/*
 * WaterSafe V2 - COMPREHENSIVE Turbidity Sensor Diagnostic
 * 
 * This test will:
 * 1. Scan I2C bus for devices
 * 2. Initialize ADS1115
 * 3. Try multiple gain settings
 * 4. Read all 4 channels
 * 5. Show raw ADC + voltage for A1 (Turbidity)
 * 
 * Hardware:
 * - Turbidity Module: Red->5V, Black->GND, Blue->ADS1115 A1
 */

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_ADS1X15.h>

#define LED_PIN 2

Adafruit_ADS1115 ads;

// Gain settings to test
struct GainTest {
  adsGain_t gain;
  const char* name;
  float multiplier;
};

GainTest gains[] = {
  {GAIN_TWOTHIRDS, "±6.144V", 0.1875},   // 0.1875 mV/bit
  {GAIN_ONE,       "±4.096V", 0.125},    // 0.125 mV/bit
  {GAIN_TWO,       "±2.048V", 0.0625},   // 0.0625 mV/bit
};

int currentGain = 0;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  delay(2000);
  
  Serial.println("\n\n");
  Serial.println("╔═══════════════════════════════════════╗");
  Serial.println("║  TURBIDITY SENSOR - FULL DIAGNOSTIC  ║");
  Serial.println("╚═══════════════════════════════════════╝");
  Serial.println();
  
  // Step 1: I2C Scan
  Serial.println("Step 1: Scanning I2C Bus...");
  Serial.println("----------------------------");
  Wire.begin(21, 22); // ESP32 default SDA=21, SCL=22
  
  int deviceCount = 0;
  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.print("  ✓ Device found at 0x");
      if (addr < 16) Serial.print("0");
      Serial.print(addr, HEX);
      if (addr == 0x48) Serial.print(" (ADS1115 Default)");
      if (addr == 0x3C) Serial.print(" (OLED)");
      Serial.println();
      deviceCount++;
    }
  }
  
  if (deviceCount == 0) {
    Serial.println("  ✗ No I2C devices found!");
    Serial.println("  Check wiring: SDA->G21, SCL->G22");
    while(1) {
      digitalWrite(LED_PIN, !digitalRead(LED_PIN));
      delay(200);
    }
  }
  
  Serial.print("  Total devices: ");
  Serial.println(deviceCount);
  Serial.println();
  
  // Step 2: Initialize ADS1115
  Serial.println("Step 2: Initializing ADS1115...");
  Serial.println("--------------------------------");
  
  if (!ads.begin()) {
    Serial.println("  ✗ ADS1115 initialization FAILED!");
    Serial.println("  Possible causes:");
    Serial.println("    - Wrong I2C address (default is 0x48)");
    Serial.println("    - ADS1115 not powered (check VDD->5V, GND->GND)");
    Serial.println("    - Bad connections on SDA/SCL");
    while(1) {
      digitalWrite(LED_PIN, !digitalRead(LED_PIN));
      delay(500);
    }
  }
  
  Serial.println("  ✓ ADS1115 initialized successfully!");
  Serial.println();
  
  // Step 3: Set initial gain
  ads.setGain(gains[currentGain].gain);
  Serial.print("  Using Gain: ");
  Serial.println(gains[currentGain].name);
  Serial.println();
  
  // Step 4: Instructions
  Serial.println("╔═══════════════════════════════════════╗");
  Serial.println("║          LIVE MONITORING              ║");
  Serial.println("╚═══════════════════════════════════════╝");
  Serial.println();
  Serial.println("Commands:");
  Serial.println("  g - Cycle through gain settings");
  Serial.println("  t - Test all 4 channels once");
  Serial.println();
  Serial.println("Now monitoring A1 (Turbidity) continuously...");
  Serial.println();
  Serial.println("Time(s) | Raw ADC | Voltage  | Status");
  Serial.println("--------|---------|----------|---------------------------");
}

void loop() {
  static unsigned long lastRead = 0;
  static unsigned long startTime = millis();
  
  // Check for serial commands
  if (Serial.available()) {
    char cmd = Serial.read();
    
    if (cmd == 'g' || cmd == 'G') {
      // Cycle gain
      currentGain = (currentGain + 1) % 3;
      ads.setGain(gains[currentGain].gain);
      Serial.println();
      Serial.print(">>> Switched to Gain: ");
      Serial.println(gains[currentGain].name);
      Serial.println();
    }
    
    if (cmd == 't' || cmd == 'T') {
      // Test all channels
      Serial.println();
      Serial.println(">>> Testing All 4 Channels:");
      Serial.println("    Ch | Raw ADC | Voltage");
      Serial.println("    ---|---------|--------");
      for (int ch = 0; ch < 4; ch++) {
        int16_t raw = ads.readADC_SingleEnded(ch);
        float volt = raw * gains[currentGain].multiplier / 1000.0;
        
        Serial.print("    A");
        Serial.print(ch);
        Serial.print(" | ");
        Serial.print(raw);
        Serial.print("   | ");
        Serial.print(volt, 3);
        Serial.println("V");
      }
      Serial.println();
    }
  }
  
  // Continuous monitoring (every 500ms)
  if (millis() - lastRead >= 500) {
    lastRead = millis();
    
    // Read A1 (Turbidity)
    int16_t rawADC = ads.readADC_SingleEnded(1);
    
    // Convert to voltage (mV to V)
    float voltage = (rawADC * gains[currentGain].multiplier) / 1000.0;
    
    // Determine status
    String status = "";
    if (rawADC < -100) {
      status = "ERROR: Negative reading!";
    } else if (voltage < 0.1) {
      status = "⚠ NEAR ZERO - Probe issue?";
    } else if (voltage > 4.0) {
      status = "✓ CLEAR WATER (High V)";
    } else if (voltage > 3.0) {
      status = "~ Slightly Cloudy";
    } else if (voltage > 2.0) {
      status = "~ Cloudy";
    } else if (voltage > 1.0) {
      status = "~ Very Cloudy";
    } else if (voltage > 0.1) {
      status = "~ Muddy / Dark";
    }
    
    // Print formatted
    unsigned long seconds = (millis() - startTime) / 1000;
    
    char buf[100];
    sprintf(buf, " %6lu | %7d | %7.3fV | %s", 
            seconds, rawADC, voltage, status.c_str());
    Serial.println(buf);
    
    // Blink LED
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
  }
}
