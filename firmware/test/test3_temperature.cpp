/*
 * TEST 3: Temperature Sensor (DS18B20)
 * 
 * This tests the DS18B20 waterproof temperature probe
 * 
 * WHAT IT DOES:
 * - Reads temperature from DS18B20 every second
 * - Prints temperature in Celsius to Serial Monitor
 * - Verifies pull-up resistor is working
 * 
 * HARDWARE NEEDED:
 * - ESP32 board
 * - DS18B20 waterproof temperature probe
 * - 4.7kΩ resistor (CRITICAL!)
 * - Jumper wires
 * - Breadboard
 * 
 * WIRING:
 * DS18B20 Red wire → Breadboard Red Rail (+5V)
 * DS18B20 Black wire → Breadboard Blue Rail (GND)
 * DS18B20 Yellow wire → ESP32 GPIO 4
 * 4.7kΩ resistor → Between Yellow wire and Red Rail (pull-up!)
 * 
 * EXPECTED TEMPERATURE:
 * - Room temperature: ~25°C (77°F)
 * - If you touch the probe: ~30-35°C (body heat)
 * - In warm water: ~40-50°C
 * - In ice water: ~0-5°C
 * 
 * HOW TO USE:
 * 1. Wire DS18B20 as shown above
 * 2. DON'T FORGET the 4.7kΩ pull-up resistor!
 * 3. Upload this code
 * 4. Open Serial Monitor (115200 baud)
 * 5. Watch temperature readings
 */

#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// DS18B20 data wire connected to GPIO 4
#define TEMP_SENSOR_PIN 4

// Create OneWire instance
OneWire oneWire(TEMP_SENSOR_PIN);

// Create DallasTemperature instance
DallasTemperature tempSensor(&oneWire);

void setup() {
  Serial.begin(115200);
  delay(2000);  // Wait for Serial to stabilize
  
  Serial.println("\n\n=================================");
  Serial.println("WaterSafe V2 - TEST 3: Temperature");
  Serial.println("=================================\n");
  
  // Initialize DS18B20
  tempSensor.begin();
  
  // Check if sensor is connected
  int deviceCount = tempSensor.getDeviceCount();
  
  if (deviceCount == 0) {
    Serial.println("❌ ERROR: No DS18B20 sensor found!");
    Serial.println("\nTROUBLESHOOTING:");
    Serial.println("1. Check wiring:");
    Serial.println("   - Red wire → +5V (Red rail)");
    Serial.println("   - Black wire → GND (Blue rail)");
    Serial.println("   - Yellow wire → GPIO 4");
    Serial.println("2. Check pull-up resistor:");
    Serial.println("   - 4.7kΩ resistor between Yellow wire and +5V");
    Serial.println("3. Try a different GPIO pin (change TEMP_SENSOR_PIN)");
    Serial.println("\nHalting...");
    while(1);  // Stop here
  }
  
  Serial.print("✓ Found ");
  Serial.print(deviceCount);
  Serial.println(" DS18B20 sensor(s)");
  Serial.println("\nReading temperature every second...\n");
  Serial.println("Time(s) | Temp(°C) | Temp(°F) | Status");
  Serial.println("--------|----------|----------|--------");
}

void loop() {
  // Request temperature reading
  tempSensor.requestTemperatures();
  
  // Get temperature in Celsius
  float tempC = tempSensor.getTempCByIndex(0);
  
  // Convert to Fahrenheit
  float tempF = (tempC * 9.0 / 5.0) + 32.0;
  
  // Check for error reading
  if (tempC == -127.0) {
    Serial.println("❌ ERROR: Sensor returned -127°C");
    Serial.println("   This usually means:");
    Serial.println("   - Pull-up resistor is missing");
    Serial.println("   - Sensor is disconnected");
    Serial.println("   - Wiring is loose");
  } else {
    // Print timestamp (in seconds)
    Serial.printf("%7.1f | %8.2f | %8.2f | ", millis() / 1000.0, tempC, tempF);
    
    // Status indicator
    if (tempC < 10.0) {
      Serial.println("COLD ❄️");
    } else if (tempC < 20.0) {
      Serial.println("Cool");
    } else if (tempC < 30.0) {
      Serial.println("Room Temp ✓");
    } else if (tempC < 40.0) {
      Serial.println("Warm");
    } else {
      Serial.println("HOT 🔥");
    }
  }
  
  // Wait 1 second before next reading
  delay(1000);
}

/*
 * INTERPRETING RESULTS:
 * 
 * ✅ GOOD: Temperature reads ~25°C (room temperature)
 * → Sensor is working correctly!
 * 
 * ✅ GOOD: Temperature changes when you touch the probe
 * → Sensor is responsive!
 * 
 * ❌ BAD: Temperature always reads -127°C
 * → Missing pull-up resistor or loose wiring
 * 
 * ❌ BAD: Temperature reads 85°C constantly
 * → Sensor is in "power-on" state, not reading properly
 * → Try adding a delay before first reading
 * 
 * EXPERIMENT:
 * 1. Touch the probe with your finger → Should go up to ~30-35°C
 * 2. Put probe in warm water → Should read water temperature
 * 3. Put probe in ice water → Should read ~0-5°C
 * 
 * NEXT STEP:
 * Once temperature is reading correctly, move to TEST 4: All Sensors
 */
