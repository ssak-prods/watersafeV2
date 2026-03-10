/*
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  WaterSafe V2 - FULL SYSTEM INTEGRATION                      ║
 * ║  All 3 Sensors + OLED Live Dashboard                         ║
 * ╚═══════════════════════════════════════════════════════════════╝
 * 
 * Hardware:
 * - ESP32-WROOM-32 (38-pin)
 * - DS18B20 Temperature Sensor (GPIO 4, with 4.7kΩ pullup)
 * - DFRobot TDS Sensor (ADS1115 A0)
 * - DFRobot Turbidity Sensor (ADS1115 A1)
 * - ADS1115 16-bit ADC (I2C: 0x48)
 * - OLED SSD1306 Display (I2C: 0x3C)
 * 
 * Features:
 * - Reads all 3 sensors every 3 seconds
 * - Displays live data on OLED
 * - Shows status: EXCELLENT / GOOD / FAIR / POOR / BAD
 * - Logs to Serial Monitor (copy to CSV for ML training)
 */

#include <Arduino.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_ADS1X15.h>
#include <Adafruit_SSD1306.h>

// === HARDWARE PINS ===
#define ONE_WIRE_BUS 4        // DS18B20 Temperature Sensor
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

// === SENSOR CALIBRATION ===
// TDS Calibration
#define TDS_VREF 3.3              // ADC reference voltage
#define TDS_KVALUE 0.5            // DFRobot calibration constant

// Turbidity Calibration (from your tests!)
#define TURB_V_CLEAR 3.2          // Max voltage (clear water)
#define TURB_V_MURKY 0.5          // Min voltage (very murky)
#define TURB_NTU_MIN 0.0          // NTU for clear
#define TURB_NTU_MAX 3000.0       // NTU for murky

// === OBJECTS ===
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);
Adafruit_ADS1115 ads;
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// === SENSOR DATA ===
struct SensorData {
  float temperature;   // °C
  float tds;           // ppm
  float turbidity;     // NTU
  unsigned long timestamp; // milliseconds
};

SensorData currentData;
unsigned long lastReadTime = 0;
const unsigned long READ_INTERVAL = 3000; // 3 seconds

// === HELPER FUNCTIONS ===

// Convert voltage to TDS (ppm)
float voltageToTDS(float voltage, float temperature) {
  // Temperature compensation factor
  float compensationCoefficient = 1.0 + 0.02 * (temperature - 25.0);
  float compensationVoltage = voltage / compensationCoefficient;
  
  // TDS = (133.42 * V^3 - 255.86 * V^2 + 857.39 * V) * 0.5
  // DFRobot formula
  float tdsValue = (133.42 * pow(compensationVoltage, 3) 
                   - 255.86 * pow(compensationVoltage, 2) 
                   + 857.39 * compensationVoltage) * TDS_KVALUE;
  
  return max(0.0f, tdsValue);
}

// Convert voltage to Turbidity (NTU)
float voltageToNTU(float voltage) {
  // Clamp voltage
  if (voltage > TURB_V_CLEAR) voltage = TURB_V_CLEAR;
  if (voltage < 0) voltage = 0;
  
  // Linear interpolation: higher voltage = lower NTU
  float ratio = (voltage - TURB_V_MURKY) / (TURB_V_CLEAR - TURB_V_MURKY);
  if (ratio < 0) ratio = 0;
  if (ratio > 1) ratio = 1;
  
  // Invert: high voltage = low NTU
  float ntu = TURB_NTU_MAX - (ratio * (TURB_NTU_MAX - TURB_NTU_MIN));
  
  return ntu;
}

// Get status string for TDS
String getTDSStatus(float tds) {
  if (tds < 50) return "EXCELLENT";
  else if (tds < 150) return "GOOD";
  else if (tds < 300) return "FAIR";
  else if (tds < 600) return "POOR";
  else return "BAD";
}

// Get status string for Turbidity
String getTurbidityStatus(float ntu) {
  if (ntu < 5) return "EXCELLENT";
  else if (ntu < 50) return "GOOD";
  else if (ntu < 500) return "FAIR";
  else if (ntu < 1000) return "POOR";
  else return "BAD";
}

// Get temperature status
String getTempStatus(float temp) {
  if (temp >= 10 && temp <= 30) return "NORMAL";
  else if (temp < 10) return "COLD";
  else return "HOT";
}

// Get overall system status
String getOverallStatus() {
  // Count how many parameters are BAD/POOR
  int bad_count = 0;
  int poor_count = 0;
  
  if (getTDSStatus(currentData.tds) == "BAD") bad_count++;
  else if (getTDSStatus(currentData.tds) == "POOR") poor_count++;
  
  if (getTurbidityStatus(currentData.turbidity) == "BAD") bad_count++;
  else if (getTurbidityStatus(currentData.turbidity) == "POOR") poor_count++;
  
  if (bad_count >= 2) return "BAD";
  else if (bad_count == 1 || poor_count >= 2) return "POOR";
  else if (poor_count == 1) return "FAIR";
  else return "GOOD";
}

// === SENSOR READING ===
void readSensors() {
  // 1. Read Temperature
  tempSensor.requestTemperatures();
  currentData.temperature = tempSensor.getTempCByIndex(0);
  
  // 2. Read TDS (A0)
  int16_t adc0 = ads.readADC_SingleEnded(0);
  float voltage0 = adc0 * 0.1875 / 1000.0; // Convert to Volts
  currentData.tds = voltageToTDS(voltage0, currentData.temperature);
  
  // 3. Read Turbidity (A1)
  int16_t adc1 = ads.readADC_SingleEnded(1);
  float voltage1 = adc1 * 0.1875 / 1000.0; // Convert to Volts
  currentData.turbidity = voltageToNTU(voltage1);
  
  // 4. Timestamp
  currentData.timestamp = millis();
}

// === DISPLAY UPDATE ===
void updateDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  
  // Title
  display.setCursor(0, 0);
  display.println("WaterSafe V2 Monitor");
  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);
  
  // Temperature
  display.setCursor(0, 14);
  display.print("Temp: ");
  display.print(currentData.temperature, 1);
  display.print(" C");
  
  // TDS
  display.setCursor(0, 26);
  display.print("TDS:  ");
  display.print((int)currentData.tds);
  display.print(" ppm");
  
  display.setCursor(75, 26);
  display.print("[");
  display.print(getTDSStatus(currentData.tds).substring(0, 4)); // First 4 chars
  display.print("]");
  
  // Turbidity
  display.setCursor(0, 38);
  display.print("Turb: ");
  display.print((int)currentData.turbidity);
  display.print(" NTU");
  
  display.setCursor(75, 38);
  display.print("[");
  display.print(getTurbidityStatus(currentData.turbidity).substring(0, 4));
  display.print("]");
  
  // Overall Status
  display.drawLine(0, 50, 128, 50, SSD1306_WHITE);
  display.setCursor(0, 54);
  display.print("Status: ");
  String status = getOverallStatus();
  display.print(status);
  
  // Show symbol based on status
  if (status == "GOOD") {
    display.setCursor(120, 54);
    display.print("*"); // Check mark placeholder
  } else if (status == "BAD") {
    display.setCursor(120, 54);
    display.print("X");
  }
  
  display.display();
}

// === SERIAL LOGGING (for CSV export) ===
void logToSerial() {
  // CSV Format: timestamp, temperature, tds, turbidity, label
  Serial.print(currentData.timestamp);
  Serial.print(",");
  Serial.print(currentData.temperature, 2);
  Serial.print(",");
  Serial.print(currentData.tds, 2);
  Serial.print(",");
  Serial.print(currentData.turbidity, 2);
  Serial.print(",");
  Serial.print("normal"); // Change to "anomaly" during tests
  Serial.println();
}

// === SETUP ===
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n╔═══════════════════════════════════════╗");
  Serial.println("║  WaterSafe V2 - Full System Test    ║");
  Serial.println("╚═══════════════════════════════════════╝\n");
  
  // Initialize I2C
  Wire.begin(21, 22);
  
  // Initialize OLED
  Serial.print("Initializing OLED... ");
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("FAILED!");
    while (1);
  }
  Serial.println("OK");
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("WaterSafe V2");
  display.println("Initializing...");
  display.display();
  delay(1000);
  
  // Initialize Temperature Sensor
  Serial.print("Initializing DS18B20... ");
  tempSensor.begin();
  int deviceCount = tempSensor.getDeviceCount();
  if (deviceCount == 0) {
    Serial.println("FAILED!");
    while (1);
  }
  Serial.print("OK (");
  Serial.print(deviceCount);
  Serial.println(" device(s))");
  
  // Initialize ADS1115
  Serial.print("Initializing ADS1115... ");
  if (!ads.begin()) {
    Serial.println("FAILED!");
    while (1);
  }
  Serial.println("OK");
  ads.setGain(GAIN_TWOTHIRDS); // ±6.144V range
  
  // Print CSV Header
  Serial.println("\n=== CSV DATA LOG (copy to file) ===");
  Serial.println("timestamp,temperature,tds,turbidity,label");
  
  Serial.println("\n✓ All Systems Ready!");
  Serial.println("Reading sensors every 3 seconds...\n");
  
  delay(1000);
}

// === MAIN LOOP ===
void loop() {
  unsigned long currentTime = millis();
  
  // Read sensors every 3 seconds
  if (currentTime - lastReadTime >= READ_INTERVAL) {
    lastReadTime = currentTime;
    
    // Read all sensors
    readSensors();
    
    // Update OLED display
    updateDisplay();
    
    // Log to Serial (for CSV export)
    logToSerial();
  }
  
  delay(10); // Small delay to prevent WDT issues
}
