/*
 * WaterSafe V2 - DIAGNOSTIC: ADS1115 Channel Scanner
 * 
 * Reads ALL 4 ADS1115 channels every second and prints raw ADC values.
 * This helps identify which channels are connected vs floating.
 * 
 * Connected sensor = stable value (positive, changes with water)
 * Floating pin = random/oscillating values or near-zero
 */

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_ADS1X15.h>

#define LED_PIN 2

Adafruit_ADS1115 ads;

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  delay(1000);
  
  Serial.println("\n\n==============================");
  Serial.println("  ADS1115 DIAGNOSTIC SCANNER");
  Serial.println("==============================\n");
  
  // I2C Scan first
  Wire.begin(21, 22);
  Serial.println("Scanning I2C bus...");
  
  int found = 0;
  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.print("  Found device at 0x");
      Serial.println(addr, HEX);
      found++;
    }
  }
  Serial.print("Total I2C devices: ");
  Serial.println(found);
  Serial.println();
  
  // Init ADS1115
  if (!ads.begin()) {
    Serial.println("!!! ADS1115 NOT FOUND !!!");
    Serial.println("Check wiring:");
    Serial.println("  VDD -> +5V rail");
    Serial.println("  GND -> GND rail");
    Serial.println("  SDA -> ESP32 G21 (via breadboard row 20)");
    Serial.println("  SCL -> ESP32 G22 (via breadboard row 21)");
    while(1) {
      digitalWrite(LED_PIN, !digitalRead(LED_PIN));
      delay(200);
    }
  }
  
  ads.setGain(GAIN_TWOTHIRDS); // +/- 6.144V
  
  Serial.println("ADS1115 OK! Reading all 4 channels...\n");
  Serial.println("  A0=TDS signal | A1=Turbidity signal | A2=unused | A3=unused");
  Serial.println("  Connected pin: stable positive value");
  Serial.println("  Floating pin: random/oscillating/near-zero values");
  Serial.println();
  Serial.println("  Sec |    A0 (TDS) |  A1 (Turb) |   A2 (N/A) |   A3 (N/A) |  A0 Volts |  A1 Volts");
  Serial.println("  ----|------------|------------|------------|------------|-----------|----------");
}

void loop() {
  static unsigned long count = 0;
  count++;
  
  // Read all 4 channels
  int16_t a0 = ads.readADC_SingleEnded(0);
  int16_t a1 = ads.readADC_SingleEnded(1);
  int16_t a2 = ads.readADC_SingleEnded(2);
  int16_t a3 = ads.readADC_SingleEnded(3);
  
  float v0 = a0 * 0.0001875;
  float v1 = a1 * 0.0001875;
  
  char buf[120];
  sprintf(buf, "  %3lu | %10d | %10d | %10d | %10d | %9.3fV | %9.3fV",
          count, a0, a1, a2, a3, v0, v1);
  Serial.println(buf);
  
  digitalWrite(LED_PIN, !digitalRead(LED_PIN));
  delay(1000);
}
