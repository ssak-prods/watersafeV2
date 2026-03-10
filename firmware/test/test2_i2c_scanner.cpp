/*
 * TEST 2: I2C Scanner
 * 
 * This scans the I2C bus to find connected devices
 * 
 * WHAT IT DOES:
 * - Scans all I2C addresses (0x01 to 0x7F)
 * - Reports which devices are found
 * - Helps verify ADS1115 and OLED are connected correctly
 * 
 * HARDWARE NEEDED:
 * - ESP32 board
 * - ADS1115 ADC module (optional for this test)
 * - OLED display (optional for this test)
 * - Jumper wires
 * - Breadboard
 * 
 * WIRING:
 * ESP32 GPIO 21 (SDA) → ADS1115 SDA → OLED SDA
 * ESP32 GPIO 22 (SCL) → ADS1115 SCL → OLED SCL
 * ESP32 VIN (5V) → Breadboard Red Rail (+) → ADS1115 VDD → OLED VCC
 * ESP32 GND → Breadboard Blue Rail (-) → ADS1115 GND → OLED GND
 * 
 * EXPECTED I2C ADDRESSES:
 * - ADS1115: 0x48 (default)
 * - OLED SSD1306: 0x3C or 0x3D
 * 
 * HOW TO USE:
 * 1. Wire up ADS1115 and OLED as shown above
 * 2. Upload this code
 * 3. Open Serial Monitor (115200 baud)
 * 4. Check which addresses are found
 */

#include <Arduino.h>
#include <Wire.h>

// I2C pins for ESP32
#define I2C_SDA 21
#define I2C_SCL 22

void setup() {
  Serial.begin(115200);
  delay(2000);  // Wait for Serial to stabilize
  
  Serial.println("\n\n=================================");
  Serial.println("WaterSafe V2 - TEST 2: I2C Scanner");
  Serial.println("=================================\n");
  
  // Initialize I2C
  Wire.begin(I2C_SDA, I2C_SCL);
  
  Serial.println("Scanning I2C bus...\n");
  delay(500);
}

void loop() {
  byte error, address;
  int devicesFound = 0;
  
  Serial.println("Scanning...");
  
  // Scan all I2C addresses from 1 to 127
  for (address = 1; address < 127; address++) {
    // Try to communicate with this address
    Wire.beginTransmission(address);
    error = Wire.endTransmission();
    
    if (error == 0) {
      // Device found!
      Serial.print("✓ I2C device found at address 0x");
      if (address < 16) Serial.print("0");
      Serial.print(address, HEX);
      
      // Identify known devices
      if (address == 0x48) {
        Serial.print("  → ADS1115 ADC");
      } else if (address == 0x3C || address == 0x3D) {
        Serial.print("  → OLED Display (SSD1306)");
      }
      
      Serial.println();
      devicesFound++;
    }
  }
  
  // Print summary
  Serial.println("\n--- Scan Complete ---");
  if (devicesFound == 0) {
    Serial.println("❌ No I2C devices found!");
    Serial.println("\nTROUBLESHOOTING:");
    Serial.println("1. Check wiring (SDA to GPIO 21, SCL to GPIO 22)");
    Serial.println("2. Check power (VCC and GND connected)");
    Serial.println("3. Try swapping SDA and SCL wires");
  } else {
    Serial.print("✓ Found ");
    Serial.print(devicesFound);
    Serial.println(" device(s)");
    
    Serial.println("\nEXPECTED DEVICES:");
    Serial.println("- 0x48 = ADS1115 ADC");
    Serial.println("- 0x3C or 0x3D = OLED Display");
  }
  
  Serial.println("\n=================================\n");
  
  // Wait 5 seconds before scanning again
  delay(5000);
}

/*
 * INTERPRETING RESULTS:
 * 
 * ✅ GOOD: Found 0x48 and 0x3C
 * → Both ADS1115 and OLED are connected correctly!
 * 
 * ⚠️ PARTIAL: Found only 0x48
 * → ADS1115 works, but OLED might be disconnected or wrong address
 * 
 * ⚠️ PARTIAL: Found only 0x3C
 * → OLED works, but ADS1115 might be disconnected
 * 
 * ❌ BAD: No devices found
 * → Check wiring! SDA/SCL might be swapped or loose
 * 
 * NEXT STEP:
 * Once you see 0x48 and 0x3C, move to TEST 3: Temperature Sensor
 */
