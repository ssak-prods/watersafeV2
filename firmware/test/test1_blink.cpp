/*
 * TEST 1: ESP32 Blink Test
 * 
 * This is the "Hello World" of hardware!
 * 
 * WHAT IT DOES:
 * - Blinks the built-in LED on the ESP32
 * - ON for 1 second, OFF for 1 second, repeat forever
 * 
 * HARDWARE NEEDED:
 * - ESP32 board
 * - USB cable
 * - That's it!
 * 
 * HOW TO USE:
 * 1. Plug ESP32 into computer via USB
 * 2. Upload this code using PlatformIO
 * 3. Watch the blue LED blink!
 * 
 * TROUBLESHOOTING:
 * - If LED doesn't blink, try changing LED_BUILTIN to 2
 * - Some ESP32 boards use GPIO 2 instead of GPIO 5
 */

#include <Arduino.h>

// Most ESP32 boards have built-in LED on GPIO 2
// If your LED doesn't blink, try changing this to 5
#define LED_PIN 2

void setup() {
  // Initialize Serial (so we can print messages)
  Serial.begin(115200);
  delay(1000);  // Wait for Serial to stabilize
  
  // Print welcome message
  Serial.println("=================================");
  Serial.println("WaterSafe V2 - TEST 1: LED Blink");
  Serial.println("=================================");
  Serial.println("If you see this message, Serial works!");
  Serial.println("Now watch the LED blink...");
  
  // Set LED pin as output
  pinMode(LED_PIN, OUTPUT);
  
  Serial.println("Setup complete! LED should be blinking now.");
}

void loop() {
  // Turn LED ON
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED ON");
  delay(1000);  // Wait 1 second
  
  // Turn LED OFF
  digitalWrite(LED_PIN, LOW);
  Serial.println("LED OFF");
  delay(1000);  // Wait 1 second
  
  // This repeats forever!
}

/*
 * EXPECTED BEHAVIOR:
 * - Blue LED on ESP32 blinks every second
 * - Serial Monitor shows "LED ON" and "LED OFF" messages
 * 
 * IF IT WORKS:
 * ✅ Your ESP32 is functional
 * ✅ Your USB cable works
 * ✅ PlatformIO is set up correctly
 * ✅ You can upload code successfully
 * 
 * NEXT STEP:
 * Move to TEST 2: Serial Monitor (print sensor readings)
 */
