/*
 * WaterSafe V2 - TEST 4.1: TDS Sensor Test
 * 
 * Purpose: Test DFRobot Gravity Analog TDS Sensor with temperature compensation
 * 
 * Hardware:
 * - ESP32 (38-pin)
 * - ADS1115 16-bit ADC (I2C address 0x48)
 * - OLED Display SSD1306 (I2C address 0x3C)
 * - DS18B20 Temperature Sensor (GPIO 4)
 * - TDS Sensor → ADS1115 A0
 * 
 * What This Test Does:
 * 1. Reads TDS sensor voltage from ADS1115 channel A0
 * 2. Reads temperature from DS18B20
 * 3. Applies temperature compensation to TDS reading
 * 4. Converts voltage to TDS value (ppm)
 * 5. Displays TDS + Temperature on OLED
 * 6. Logs detailed data to Serial Monitor
 * 
 * Expected Results:
 * - Dry/Air: ~0 ppm (no conductivity)
 * - Distilled water: 0-50 ppm (very low conductivity)
 * - Tap water: 100-500 ppm (normal drinking water)
 * - Salt water: 500-1000+ ppm (high conductivity)
 * 
 * Author: WaterSafe V2 Team
 * Date: 2026-02-11
 */

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_ADS1X15.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_GFX.h>

// ============================================
// HARDWARE CONFIGURATION
// ============================================

// I2C Pins (ESP32 default)
#define I2C_SDA 21
#define I2C_SCL 22

// DS18B20 Temperature Sensor
#define ONE_WIRE_BUS 4  // GPIO 4 (G4)
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);

// ADS1115 ADC
Adafruit_ADS1115 ads;
#define TDS_CHANNEL 0  // A0 channel

// OLED Display
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// LED for visual feedback
#define LED_PIN 2

// ============================================
// TDS SENSOR CONFIGURATION
// ============================================

// ADS1115 Configuration
#define ADS_VREF 5.0          // Reference voltage (5V)
#define ADS_RESOLUTION 32768.0 // 16-bit ADC (±32768 for single-ended)

// TDS Sensor Specifications (from DFRobot)
#define TDS_VOLTAGE_MAX 2.3   // Maximum output voltage
#define TDS_PPM_MAX 1000      // Maximum TDS measurement (ppm)

// Temperature Compensation
#define TEMP_COEFFICIENT 0.02  // 2% per degree Celsius
#define TEMP_REFERENCE 25.0    // Reference temperature (25°C)

// Sampling Configuration
#define SAMPLE_COUNT 30        // Number of samples for averaging
#define SAMPLE_INTERVAL 40     // Milliseconds between samples
#define UPDATE_INTERVAL 1000   // Display update interval (ms)

// ============================================
// GLOBAL VARIABLES
// ============================================

// Sampling buffers
int16_t tdsBuffer[SAMPLE_COUNT];
int bufferIndex = 0;

// Sensor readings
float currentTempC = 25.0;
float currentTempF = 77.0;
float tdsVoltage = 0.0;
float tdsValue = 0.0;  // TDS in ppm

// Statistics
float minTDS = 9999.0;
float maxTDS = 0.0;
float minTemp = 9999.0;
float maxTemp = -9999.0;

// Timing
unsigned long lastSample = 0;
unsigned long lastUpdate = 0;
unsigned long lastBlink = 0;
bool ledState = false;

// Counters
unsigned long sampleCount = 0;
unsigned long readingCount = 0;

// ============================================
// TDS CALCULATION FUNCTIONS
// ============================================

/**
 * Get median value from buffer (removes outliers)
 */
int16_t getMedian(int16_t* buffer, int count) {
  // Create temporary array for sorting
  int16_t temp[SAMPLE_COUNT];
  for (int i = 0; i < count; i++) {
    temp[i] = buffer[i];
  }
  
  // Bubble sort
  for (int i = 0; i < count - 1; i++) {
    for (int j = 0; j < count - i - 1; j++) {
      if (temp[j] > temp[j + 1]) {
        int16_t swap = temp[j];
        temp[j] = temp[j + 1];
        temp[j + 1] = swap;
      }
    }
  }
  
  // Return median
  if (count % 2 == 0) {
    return (temp[count/2 - 1] + temp[count/2]) / 2;
  } else {
    return temp[count/2];
  }
}

/**
 * Convert ADC reading to voltage
 */
float adsToVoltage(int16_t rawValue) {
  // ADS1115 in single-ended mode: 0-32767 = 0-4.096V (default gain)
  // We're using ±4.096V range, so:
  return (rawValue * 4.096) / ADS_RESOLUTION;
}

/**
 * Apply temperature compensation to TDS reading
 */
float applyTempCompensation(float voltage, float temperature) {
  // Temperature compensation formula from DFRobot:
  // compensationCoefficient = 1.0 + 0.02 * (temperature - 25.0)
  float coefficient = 1.0 + TEMP_COEFFICIENT * (temperature - TEMP_REFERENCE);
  return voltage / coefficient;
}

/**
 * Convert compensated voltage to TDS value (ppm)
 * Using DFRobot's calibration formula
 */
float voltageToTDS(float voltage) {
  // DFRobot formula (cubic polynomial fit):
  // TDS = (133.42*V³ - 255.86*V² + 857.39*V) * 0.5
  float tds = (133.42 * voltage * voltage * voltage 
             - 255.86 * voltage * voltage 
             + 857.39 * voltage) * 0.5;
  
  // Clamp to valid range
  if (tds < 0) tds = 0;
  if (tds > TDS_PPM_MAX) tds = TDS_PPM_MAX;
  
  return tds;
}

// ============================================
// SETUP
// ============================================

void setup() {
  // Initialize Serial
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n");
  Serial.println("========================================");
  Serial.println("  WaterSafe V2 - TEST 4.1: TDS Sensor");
  Serial.println("========================================");
  Serial.println();
  
  // Initialize LED
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  // Initialize I2C
  Wire.begin(I2C_SDA, I2C_SCL);
  Serial.println("[INIT] I2C bus initialized");
  
  // Initialize OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println("[ERROR] OLED initialization failed!");
    while (1) {
      digitalWrite(LED_PIN, !digitalRead(LED_PIN));
      delay(200);
    }
  }
  Serial.println("[OK] OLED Display initialized (0x3C)");
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("WaterSafe V2");
  display.println("TEST 4.1");
  display.println();
  display.println("Initializing...");
  display.display();
  
  // Initialize ADS1115
  if (!ads.begin()) {
    Serial.println("[ERROR] ADS1115 initialization failed!");
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("ERROR:");
    display.println("ADS1115 not found!");
    display.println();
    display.println("Check wiring:");
    display.println("- VDD -> +5V");
    display.println("- GND -> GND");
    display.println("- SDA -> G21");
    display.println("- SCL -> G22");
    display.display();
    while (1) {
      digitalWrite(LED_PIN, !digitalRead(LED_PIN));
      delay(500);
    }
  }
  Serial.println("[OK] ADS1115 initialized (0x48)");
  
  // Configure ADS1115 gain (±4.096V range)
  ads.setGain(GAIN_ONE);  // ±4.096V
  Serial.println("[CONFIG] ADS1115 gain: ±4.096V");
  
  // Initialize DS18B20
  tempSensor.begin();
  int deviceCount = tempSensor.getDeviceCount();
  
  if (deviceCount == 0) {
    Serial.println("[ERROR] DS18B20 not found!");
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("ERROR:");
    display.println("DS18B20 not found!");
    display.println();
    display.println("Check wiring:");
    display.println("- RED -> +5V");
    display.println("- BLACK -> GND");
    display.println("- YELLOW -> G4");
    display.println("- 4.7k resistor");
    display.display();
    while (1) {
      digitalWrite(LED_PIN, !digitalRead(LED_PIN));
      delay(500);
    }
  }
  Serial.print("[OK] DS18B20 initialized (");
  Serial.print(deviceCount);
  Serial.println(" device(s) found)");
  
  // Initial temperature reading
  tempSensor.requestTemperatures();
  currentTempC = tempSensor.getTempCByIndex(0);
  currentTempF = currentTempC * 9.0 / 5.0 + 32.0;
  
  Serial.println();
  Serial.println("========================================");
  Serial.println("  HARDWARE INITIALIZATION COMPLETE");
  Serial.println("========================================");
  Serial.println();
  Serial.println("TDS Sensor Configuration:");
  Serial.println("  - Channel: A0");
  Serial.println("  - Voltage Range: 0-2.3V");
  Serial.println("  - TDS Range: 0-1000 ppm");
  Serial.println("  - Temperature Compensation: Enabled");
  Serial.println();
  Serial.print("Current Temperature: ");
  Serial.print(currentTempC, 1);
  Serial.println("°C");
  Serial.println();
  Serial.println("========================================");
  Serial.println("  STARTING TDS MEASUREMENTS");
  Serial.println("========================================");
  Serial.println();
  Serial.println("Time(s) | Raw ADC | Voltage(V) | Comp.V(V) | TDS(ppm) | Temp(°C)");
  Serial.println("--------|---------|------------|-----------|----------|----------");
  
  // Show ready screen
  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(0, 0);
  display.println("TDS TEST");
  display.setTextSize(1);
  display.println();
  display.println("Ready!");
  display.println();
  display.print("Temp: ");
  display.print(currentTempC, 1);
  display.println("C");
  display.display();
  
  delay(2000);
  
  // Blink LED to indicate ready
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_PIN, LOW);
    delay(100);
  }
}

// ============================================
// MAIN LOOP
// ============================================

void loop() {
  unsigned long currentMillis = millis();
  
  // ========================================
  // SAMPLE TDS SENSOR (every 40ms)
  // ========================================
  if (currentMillis - lastSample >= SAMPLE_INTERVAL) {
    lastSample = currentMillis;
    
    // Read TDS sensor from ADS1115 A0
    int16_t rawValue = ads.readADC_SingleEnded(TDS_CHANNEL);
    tdsBuffer[bufferIndex] = rawValue;
    bufferIndex++;
    sampleCount++;
    
    if (bufferIndex >= SAMPLE_COUNT) {
      bufferIndex = 0;
    }
  }
  
  // ========================================
  // UPDATE DISPLAY (every 1 second)
  // ========================================
  if (currentMillis - lastUpdate >= UPDATE_INTERVAL) {
    lastUpdate = currentMillis;
    readingCount++;
    
    // Read temperature
    tempSensor.requestTemperatures();
    currentTempC = tempSensor.getTempCByIndex(0);
    
    if (currentTempC == DEVICE_DISCONNECTED_C) {
      currentTempC = 25.0;  // Default to 25°C if sensor fails
      Serial.println("[WARNING] Temperature sensor disconnected!");
    }
    
    currentTempF = currentTempC * 9.0 / 5.0 + 32.0;
    
    // Get median TDS reading (removes outliers)
    int16_t medianRaw = getMedian(tdsBuffer, SAMPLE_COUNT);
    
    // Convert to voltage
    tdsVoltage = adsToVoltage(medianRaw);
    
    // Apply temperature compensation
    float compensatedVoltage = applyTempCompensation(tdsVoltage, currentTempC);
    
    // Convert to TDS value (ppm)
    tdsValue = voltageToTDS(compensatedVoltage);
    
    // Update statistics
    if (tdsValue < minTDS) minTDS = tdsValue;
    if (tdsValue > maxTDS) maxTDS = tdsValue;
    if (currentTempC < minTemp) minTemp = currentTempC;
    if (currentTempC > maxTemp) maxTemp = currentTempC;
    
    // ========================================
    // SERIAL OUTPUT (detailed logging)
    // ========================================
    char buffer[100];
    sprintf(buffer, "%7lu | %7d | %10.3f | %9.3f | %8.1f | %8.2f",
            currentMillis / 1000,
            medianRaw,
            tdsVoltage,
            compensatedVoltage,
            tdsValue,
            currentTempC);
    Serial.println(buffer);
    
    // ========================================
    // OLED DISPLAY
    // ========================================
    display.clearDisplay();
    
    // Title
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.println("TDS Sensor Test");
    
    // TDS Value (large)
    display.setTextSize(3);
    display.setCursor(0, 15);
    if (tdsValue < 100) {
      display.printf("%.1f", tdsValue);
    } else {
      display.printf("%.0f", tdsValue);
    }
    display.setTextSize(1);
    display.print(" ppm");
    
    // Temperature
    display.setTextSize(1);
    display.setCursor(0, 42);
    display.printf("Temp: %.1fC / %.1fF", currentTempC, currentTempF);
    
    // Min/Max
    display.setCursor(0, 52);
    display.printf("Min:%.0f Max:%.0f", minTDS, maxTDS);
    
    // Status indicator (bottom right)
    display.setCursor(100, 56);
    if (tdsValue < 50) {
      display.print("PURE");
    } else if (tdsValue < 300) {
      display.print("GOOD");
    } else if (tdsValue < 600) {
      display.print("FAIR");
    } else {
      display.print("HIGH");
    }
    
    display.display();
  }
  
  // ========================================
  // BLINK LED (heartbeat)
  // ========================================
  if (currentMillis - lastBlink >= 500) {
    lastBlink = currentMillis;
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState);
  }
}
