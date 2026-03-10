/*
 * TEST 3.5: Temperature Sensor + OLED Display
 * 
 * This test combines:
 * - DS18B20 temperature sensor reading
 * - Real-time display on OLED screen
 * - Serial Monitor output for debugging
 * 
 * What you'll see:
 * - OLED shows current temperature in large text
 * - Updates every second
 * - Both Celsius and Fahrenheit
 * - Serial Monitor shows detailed readings
 */

#include <Arduino.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_GFX.h>

// DS18B20 Temperature Sensor Setup
#define ONE_WIRE_BUS 4  // GPIO 4 (G4)
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// OLED Display Setup
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Timing
unsigned long lastUpdate = 0;
const unsigned long UPDATE_INTERVAL = 1000; // Update every 1 second

// Temperature tracking
float currentTempC = 0.0;
float currentTempF = 0.0;
float minTempC = 999.0;
float maxTempC = -999.0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n========================================");
  Serial.println("  WaterSafe V2 - TEST 3.5");
  Serial.println("  Temperature Sensor + OLED Display");
  Serial.println("========================================\n");
  
  // Initialize I2C
  Wire.begin();
  
  // Initialize OLED
  Serial.println("Initializing OLED display...");
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println("❌ ERROR: OLED initialization failed!");
    Serial.println("   Check OLED wiring:");
    Serial.println("   - VCC → + rail");
    Serial.println("   - GND → - rail");
    Serial.println("   - SDA → Row 20 (shared with ADS1115)");
    Serial.println("   - SCL → Row 21 (shared with ADS1115)");
    while(1); // Stop here
  }
  Serial.println("✓ OLED initialized successfully!");
  
  // Show startup screen
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("WaterSafe");
  display.println("   V2");
  display.setTextSize(1);
  display.setCursor(0, 40);
  display.println("Temp Sensor");
  display.setCursor(0, 50);
  display.println("Initializing...");
  display.display();
  delay(2000);
  
  // Initialize DS18B20
  Serial.println("\nInitializing DS18B20 temperature sensor...");
  sensors.begin();
  
  // Check if sensor is found
  int deviceCount = sensors.getDeviceCount();
  Serial.print("Found ");
  Serial.print(deviceCount);
  Serial.println(" DS18B20 sensor(s)");
  
  if (deviceCount == 0) {
    Serial.println("\n❌ ERROR: No DS18B20 sensor found!");
    Serial.println("   Troubleshooting:");
    Serial.println("   1. Check RED wire: Row 10 → + rail");
    Serial.println("   2. Check BLACK wire: Row 11 → - rail");
    Serial.println("   3. Check YELLOW wire: Row 12 → ESP32 GPIO 4");
    Serial.println("   4. Check 4.7kΩ resistor: Row 12 → + rail");
    Serial.println("   5. Ensure all wires are firmly connected");
    
    // Show error on OLED
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.println("ERROR!");
    display.println("");
    display.println("No Temp Sensor");
    display.println("Found!");
    display.println("");
    display.println("Check wiring:");
    display.println("- 4.7k resistor?");
    display.display();
    
    while(1); // Stop here
  }
  
  Serial.println("✓ DS18B20 sensor found!");
  Serial.println("\n✓ All systems ready!");
  Serial.println("\nStarting temperature monitoring...");
  Serial.println("Time(s) | Temp(°C) | Temp(°F) | Min(°C) | Max(°C) | Status");
  Serial.println("--------|----------|----------|---------|---------|--------");
  
  // Initial reading
  sensors.requestTemperatures();
  delay(1000);
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Update every second
  if (currentMillis - lastUpdate >= UPDATE_INTERVAL) {
    lastUpdate = currentMillis;
    
    // Request temperature reading
    sensors.requestTemperatures();
    
    // Get temperature in Celsius
    currentTempC = sensors.getTempCByIndex(0);
    
    // Check for sensor error
    if (currentTempC == -127.00) {
      Serial.println("\n❌ ERROR: Temperature reading failed!");
      Serial.println("   Reading: -127°C (sensor error)");
      Serial.println("   This usually means:");
      Serial.println("   - Pull-up resistor (4.7kΩ) is missing or disconnected");
      Serial.println("   - Data wire (YELLOW) is not connected to GPIO 4");
      Serial.println("   - Sensor is damaged (less likely)");
      
      // Show error on OLED
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println("SENSOR ERROR!");
      display.println("");
      display.println("Reading: -127C");
      display.println("");
      display.println("Check:");
      display.println("- 4.7k resistor");
      display.println("- Yellow wire");
      display.display();
      
      delay(5000);
      return;
    }
    
    // Convert to Fahrenheit
    currentTempF = (currentTempC * 9.0 / 5.0) + 32.0;
    
    // Update min/max
    if (currentTempC < minTempC) minTempC = currentTempC;
    if (currentTempC > maxTempC) maxTempC = currentTempC;
    
    // Determine status
    String status = "";
    if (currentTempC < 15.0) {
      status = "Cold ❄️";
    } else if (currentTempC < 25.0) {
      status = "Cool ✓";
    } else if (currentTempC < 30.0) {
      status = "Room Temp ✓";
    } else if (currentTempC < 35.0) {
      status = "Warm 🔥";
    } else {
      status = "Hot 🔥🔥";
    }
    
    // Print to Serial Monitor
    float timeSeconds = currentMillis / 1000.0;
    Serial.printf("%7.1f | %8.2f | %8.2f | %7.2f | %7.2f | %s\n",
                  timeSeconds, currentTempC, currentTempF, minTempC, maxTempC, status.c_str());
    
    // Update OLED Display
    display.clearDisplay();
    
    // Title
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.println("Temperature:");
    
    // Large temperature in Celsius
    display.setTextSize(3);
    display.setCursor(0, 15);
    display.printf("%.1f", currentTempC);
    display.setTextSize(2);
    display.print("C");
    
    // Fahrenheit (smaller)
    display.setTextSize(1);
    display.setCursor(0, 42);
    display.printf("%.1fF", currentTempF);
    
    // Min/Max
    display.setCursor(0, 54);
    display.printf("Min:%.1f Max:%.1f", minTempC, maxTempC);
    
    // Status indicator (right side)
    display.setTextSize(1);
    display.setCursor(70, 42);
    if (currentTempC < 25.0) {
      display.println("COOL");
    } else if (currentTempC < 30.0) {
      display.println("ROOM");
    } else if (currentTempC < 35.0) {
      display.println("WARM");
    } else {
      display.println("HOT!");
    }
    
    // Visual temperature bar
    int barHeight = map(constrain(currentTempC, 0, 50), 0, 50, 0, 20);
    display.fillRect(100, 44 - barHeight, 20, barHeight, SSD1306_WHITE);
    display.drawRect(100, 24, 20, 20, SSD1306_WHITE);
    
    display.display();
  }
  
  // Blink built-in LED to show program is running
  digitalWrite(2, !digitalRead(2));
  delay(100);
}

/*
 * EXPECTED OLED DISPLAY:
 * 
 * ┌──────────────────────┐
 * │ Temperature:         │
 * │                      │
 * │ 25.6°C               │
 * │                      │
 * │ 78.1°F        ROOM   │
 * │ Min:24.5 Max:26.2  ▓ │
 * └──────────────────────┘
 * 
 * EXPECTED SERIAL OUTPUT:
 * 
 * Time(s) | Temp(°C) | Temp(°F) | Min(°C) | Max(°C) | Status
 * --------|----------|----------|---------|---------|--------
 *     1.0 |    25.62 |    78.12 |   25.62 |   25.62 | Room Temp ✓
 *     2.0 |    25.69 |    78.24 |   25.62 |   25.69 | Room Temp ✓
 *     3.0 |    25.75 |    78.35 |   25.62 |   25.75 | Room Temp ✓
 * 
 * INTERACTIVE TEST:
 * - Touch the probe with your finger
 * - Watch temperature rise on OLED (and Serial Monitor)
 * - Let go and watch it cool down
 * - Min/Max values track the range
 * - Temperature bar fills up as temp increases
 */
