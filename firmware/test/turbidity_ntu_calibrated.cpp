/*
 * WaterSafe V2 - Turbidity Sensor with NTU Calibration
 * 
 * Based on DFRobot Gravity Analog Turbidity Sensor
 * 
 * NTU (Nephelometric Turbidity Units):
 * - 0-5 NTU: Excellent water quality (clear)
 * - 5-50 NTU: Good (slightly hazy)
 * - 50-500 NTU: Fair (cloudy)
 * - 500+ NTU: Poor (very murky)
 * 
 * Calibration:
 * - This version uses YOUR sensor's actual voltage range
 * - Adjust CALIBRATION constants based on test readings
 */

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_ADS1X15.h>

Adafruit_ADS1115 ads;

// === CALIBRATION CONSTANTS ===
// Adjust these based on YOUR sensor's actual readings

// Maximum voltage (clear water or air)
// Default: 3.2V (based on your observations)
#define V_CLEAR 3.2

// Minimum voltage (very murky water)
// Default: 0.5V (based on your observations)
#define V_MURKY 0.5

// NTU mapping
// When voltage = V_CLEAR → NTU = NTU_MIN
// When voltage = V_MURKY → NTU = NTU_MAX
#define NTU_MIN 0.0      // Clear water
#define NTU_MAX 3000.0   // Very murky

// === END CALIBRATION ===

float voltageToNTU(float voltage) {
  // Clamp voltage to valid range
  if (voltage > V_CLEAR) voltage = V_CLEAR;
  if (voltage < 0) voltage = 0;
  
  // Linear interpolation: higher voltage = lower NTU
  // NTU = NTU_MAX - (voltage - V_MURKY) / (V_CLEAR - V_MURKY) * (NTU_MAX - NTU_MIN)
  
  float ratio = (voltage - V_MURKY) / (V_CLEAR - V_MURKY);
  if (ratio < 0) ratio = 0;
  if (ratio > 1) ratio = 1;
  
  // Invert: high voltage = low NTU
  float ntu = NTU_MAX - (ratio * (NTU_MAX - NTU_MIN));
  
  return ntu;
}

String getNTUStatus(float ntu) {
  if (ntu < 5) return "EXCELLENT (Crystal Clear)";
  else if (ntu < 50) return "GOOD (Slightly Hazy)";
  else if (ntu < 500) return "FAIR (Cloudy)";
  else if (ntu < 1000) return "POOR (Very Cloudy)";
  else return "BAD (Murky/Dirty)";
}

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("\n\n");
  Serial.println("╔═══════════════════════════════════════════╗");
  Serial.println("║   TURBIDITY SENSOR - NTU CALIBRATED      ║");
  Serial.println("╚═══════════════════════════════════════════╝");
  Serial.println();
  
  if (!ads.begin()) {
    Serial.println("ADS1115 initialization failed!");
    while (1);
  }
  
  ads.setGain(GAIN_TWOTHIRDS); // ±6.144V
  
  Serial.println("Calibration Settings:");
  Serial.print("  V_CLEAR (max voltage): ");
  Serial.print(V_CLEAR);
  Serial.println("V");
  Serial.print("  V_MURKY (min voltage): ");
  Serial.print(V_MURKY);
  Serial.println("V");
  Serial.println();
  Serial.println("Commands:");
  Serial.println("  c - Enter calibration mode");
  Serial.println("  t - Test all channels");
  Serial.println();
  Serial.println("Time(s) |  ADC  | Voltage |  NTU   | Status");
  Serial.println("--------|-------|---------|--------|------------------------");
}

void loop() {
  static unsigned long lastRead = 0;
  static unsigned long startTime = millis();
  static bool calibrationMode = false;
  
  // Handle commands
  if (Serial.available()) {
    char cmd = Serial.read();
    
    if (cmd == 'c' || cmd == 'C') {
      Serial.println();
      Serial.println("╔═══════════════════════════════════════╗");
      Serial.println("║       CALIBRATION MODE               ║");
      Serial.println("╚═══════════════════════════════════════╝");
      Serial.println();
      Serial.println("STEP 1: Put probe in CLEAR WATER");
      Serial.println("        Wait 10 seconds for stable reading");
      Serial.println("        Note the VOLTAGE value");
      Serial.println();
      Serial.println("STEP 2: Put probe in MURKY WATER (add milk/mud)");
      Serial.println("        Wait 10 seconds");
      Serial.println("        Note the VOLTAGE value");
      Serial.println();
      Serial.println("STEP 3: Edit the code:");
      Serial.println("        #define V_CLEAR (your clear water voltage)");
      Serial.println("        #define V_MURKY (your murky water voltage)");
      Serial.println();
      Serial.println("Current readings:");
    }
    
    if (cmd == 't' || cmd == 'T') {
      Serial.println();
      Serial.println(">>> Testing All Channels:");
      Serial.println("    Ch | Raw ADC | Voltage");
      for (int ch = 0; ch < 4; ch++) {
        int16_t raw = ads.readADC_SingleEnded(ch);
        float volt = raw * 0.1875 / 1000.0;
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
  
  // Read sensor every 500ms
  if (millis() - lastRead >= 500) {
    lastRead = millis();
    
    // Read A1 (Turbidity)
    int16_t rawADC = ads.readADC_SingleEnded(1);
    float voltage = (rawADC * 0.1875) / 1000.0; // mV to V
    float ntu = voltageToNTU(voltage);
    String status = getNTUStatus(ntu);
    
    unsigned long seconds = (millis() - startTime) / 1000;
    
    char buf[120];
    sprintf(buf, " %6lu | %5d | %6.3fV | %6.0f | %s",
            seconds, rawADC, voltage, ntu, status.c_str());
    Serial.println(buf);
  }
}
