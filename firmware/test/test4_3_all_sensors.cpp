/*
 * WaterSafe V2 - TEST 4.3: Full Sensor Integration (TDS + Turbidity + Temp)
 * 
 * Hardware:
 * - ESP32 (38-pin)
 * - ADS1115 ADC (0x48)
 * - OLED Display (0x3C)
 * - DS18B20 Temp Sensor (GPIO 4)
 * - TDS Sensor (A0)
 * - Turbidity Sensor (A1)
 * 
 * Logic:
 * 1. Read Temp (C)
 * 2. Read TDS Voltage (A0), apply Temp Comp, calculate PPM.
 * 3. Read Turbidity Voltage (A1).
 *    - High Voltage (>4V) = Clear
 *    - Low Voltage (<2.5V) = Cloudy/Dirty
 * 4. Display all on OLED.
 */

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_ADS1X15.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_GFX.h>

// --- PINS ---
#define ONE_WIRE_BUS 4
#define LED_PIN 2

// --- OBJECTS ---
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);
Adafruit_ADS1115 ads;
Adafruit_SSD1306 display(128, 64, &Wire, -1);

// --- CONFIG ---
// Gain TwoThirds = +/- 6.144V range (1 bit = 0.1875mV)
// Needed because Turbidity sensor can output ~4.5V
// For GAIN_TWOTHIRDS: Each count = 6.144V / 32768 = 0.0001875V
#define ADS_MULTIPLIER 0.0001875F 

// TDS Params
#define TDS_FACTOR 0.5 // DFRobot standard
#define TEMP_ALPHA 0.02 // Temp coeff

// --- VARIABLES ---
float tempC = 25.0;
float tdsPpm = 0.0;
float turbVolt = 0.0;
String turbStatus = "Init";

// Median Filter Buffer
#define SAMPLES 10
int16_t tdsBuf[SAMPLES];
int16_t turbBuf[SAMPLES];
int bufIdx = 0;

int16_t getMedian(int16_t* b, int n) {
  int16_t temp[n];
  for(int i=0; i<n; i++) temp[i] = b[i];
  for(int i=0; i<n-1; i++) {
    for(int j=0; j<n-i-1; j++) {
      if(temp[j] > temp[j+1]) {
        int16_t t = temp[j]; temp[j] = temp[j+1]; temp[j+1] = t;
      }
    }
  }
  return temp[n/2];
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  delay(1000);

  Serial.println("\n--- WaterSafe V2: FULL SYSTEM TEST ---");

  // Init OLED
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED Failed");
    for(;;);
  }
  display.clearDisplay();
  display.setTextColor(WHITE);
  display.setTextSize(1);
  display.println("WaterSafe V2");
  display.println("Initializing...");
  display.display();

  // Init DS18B20
  tempSensor.begin();
  if(tempSensor.getDeviceCount() == 0) Serial.println("Warning: No DS18B20 found");

  // Init ADS1115
  if (!ads.begin()) {
    Serial.println("ADS1115 Failed");
    display.println("ADS1115 Error");
    display.display();
    for(;;);
  }
  ads.setGain(GAIN_TWOTHIRDS); // +/- 6.144V range (Important for Turbidity > 4V)
  
  Serial.println("Sensors Ready.");
  delay(1000);
}

void loop() {
  unsigned long start = millis();

  // 1. Read Temperature (Async request would be better, but blocking is fine for test)
  tempSensor.requestTemperatures();
  float t = tempSensor.getTempCByIndex(0);
  if(t > -100) tempC = t; // Only update if valid

  // 2. Read ADC (Raw)
  int16_t adc0 = ads.readADC_SingleEnded(0); // TDS
  int16_t adc1 = ads.readADC_SingleEnded(1); // Turbidity

  // Fill Buffer
  tdsBuf[bufIdx] = adc0;
  turbBuf[bufIdx] = adc1;
  bufIdx = (bufIdx + 1) % SAMPLES;

  // 3. Process Data
  int16_t medTds = getMedian(tdsBuf, SAMPLES);
  int16_t medTurb = getMedian(turbBuf, SAMPLES);

  // --- CALC TDS ---
  float vTds = medTds * ADS_MULTIPLIER;
  // Temp Compensate
  float compVoltage = vTds / (1.0 + TEMP_ALPHA * (tempC - 25.0));
  // Convert to PPM (DFRobot cubic formula)
  tdsPpm = (133.42*pow(compVoltage,3) - 255.86*pow(compVoltage,2) + 857.39*compVoltage) * 0.5;
  if(tdsPpm < 0) tdsPpm = 0;

  // --- CALC TURBIDITY ---
  turbVolt = medTurb * ADS_MULTIPLIER;
  // Simple mapping for visual status
  if(turbVolt > 4.0) turbStatus = "CLEAR";
  else if(turbVolt > 3.0) turbStatus = "CLOUDY";
  else if(turbVolt > 2.5) turbStatus = "DIRTY";
  else turbStatus = "MUDDY";

  // 4. Output to Serial (CSV with Debug Info)
  Serial.print("TEMP="); Serial.print(tempC, 2); Serial.print("C | ");
  Serial.print("TDS: ADC="); Serial.print(medTds); 
  Serial.print(" V="); Serial.print(vTds, 3); 
  Serial.print(" CompV="); Serial.print(compVoltage, 3);
  Serial.print(" PPM="); Serial.print(tdsPpm, 0); Serial.print(" | ");
  Serial.print("TURB: ADC="); Serial.print(medTurb);
  Serial.print(" V="); Serial.print(turbVolt, 3);
  Serial.print(" Status="); Serial.println(turbStatus);

  // 5. Update OLED
  display.clearDisplay();
  
  // Header
  // display.setTextSize(1); display.setCursor(0,0); display.print("Temp  TDS   Turb");

  // Temp
  display.setTextSize(1); display.setCursor(0,0); display.print("Temp: ");
  display.setTextSize(2); display.setCursor(40,0); display.print(tempC, 1); display.setTextSize(1); display.print("C");

  // TDS
  display.setCursor(0,20); display.print("TDS : ");
  display.setTextSize(2); display.setCursor(40,20); display.print(tdsPpm, 0); display.setTextSize(1); display.print("ppm");

  // Turbidity
  display.setCursor(0,40); display.print("Turb: ");
  // display.setTextSize(2); display.setCursor(40,40); display.print(turbVolt, 2); display.setTextSize(1); display.print("V");
  display.setTextSize(2); display.setCursor(40,40); display.print(turbStatus);

  display.display();

  // Heartbeat
  digitalWrite(LED_PIN, !digitalRead(LED_PIN));
  delay(1000);
}
