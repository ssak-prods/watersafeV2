# WaterSafe V2: Official Bill of Materials (India/Robu.in Edition)

**Project Lead Note**: This list is curated for the "WaterSafe V2" project. All links are from **Robu.in**, a trusted vendor in India. Alternatives (Amazon, ElectronicsComp) are acceptable, but verify specifications match.

### 1. Core Electronics (The Brains)

| Component | Specification | Qty | Approx Cost | Link (Example) |
| :--- | :--- | :--- | :--- | :--- |
| **ESP32 Dev Board** | 38-Pin DevKit V1 (Micro-USB) | 1 | ₹550 | [Buy 30-Pin ESP32](https://robu.in/product/esp32-wifi-and-bluetooth-chip-development-board-30-pin/) |
| **ADS1115 ADC** | 16-Bit, I2C Interface, 4-Channel | 1 | ₹350 | [Buy ADS1115 Module](https://robu.in/product/ads1115-16-bit-adc-4-channel-programmable-gain-amplifier/) |
| **OLED Display** | 0.96" I2C OLED (SSD1306) - White/Blue | 1 | ₹300 | [Buy 0.96" OLED](https://robu.in/product/0-96-inch-i2c-iik-serial-128x64-oled-display-module-4-pin-white/) |
| **Micro USB Cable** | Data Sync Cable (Good Quality) | 1 | ₹100 | [Buy USB Cable](https://robu.in/product/usb-a-to-micro-usb-cable-1-meter/) |

### 2. Sensors (The Eyes)

| Component | Specification | Qty | Approx Cost | Link (Example) |
| :--- | :--- | :--- | :--- | :--- |
| **Turbidity Sensor** | Analog Turbidity Module (3-pin/4-pin) | 1 | ₹950 | [Buy Turbidity Sensor](https://robu.in/product/turbidity-sensor-suspended-turbidity-value-detection-module-kit/) |
| **TDS Sensor** | Gravity Analog TDS Sensor | 1 | ₹650 | [Buy TDS Sensor](https://robu.in/product/analog-tds-sensor-module-normal-quality/) |
| **Temp Sensor** | DS18B20 Waterproof Probe | 1 | ₹150 | [Buy DS18B20](https://robu.in/product/waterproof-ds18b20-digital-temperature-sensor/) |

**Note**: pH sensor removed from project due to fragility and maintenance requirements. TDS + Turbidity + Temperature provide robust water quality monitoring.

### 3. Prototyping Essentials (The Skeleton)

**CRITICAL**: Do not skip these. You cannot build the project without them.

| Component | Specification | Qty | Approx Cost | Link (Example) |
| :--- | :--- | :--- | :--- | :--- |
| **Breadboard** | MB-102 (830 Points) - Large size | 1 | ₹150 | [Buy Breadboard](https://robu.in/product/830-points-solderless-breadboard-mb-102/) |
| **Jumper Wires** | Male-to-Male (Bundle of 65) | 1 | ₹100 | [Buy M-M Wires](https://robu.in/product/65pcs-solderless-flexible-breadboard-jumper-wires-cable-male-to-male-for-arduino/) |
| **Jumper Wires** | Male-to-Female (Pack of 40) | 1 | ₹100 | [Buy M-F Wires](https://robu.in/product/40-pcs-20cm-dupont-wire-cable-male-to-female-jumper-cable-2-54mm-200mm/) |
| **Resistor** | **4.7k Ohm** (For DS18B20 Temp Sensor) | 1 | ₹10 | [Buy Resistors (Pack)](https://robu.in/product/fixed-resistor-1-4w-4-7k-pack-of-20-approx/) |

### Total Estimated Budget: ~₹3,200 (INR)

**Savings**: ₹800 saved by removing pH sensor (fragile glass electrode not suitable for deployment)

### Notes for the "Noob"
1.  **Soldering**: These modules usually come with pins pre-soldered OR loose header pins. If they are loose, you **MUST solder** them. You cannot just "place" the pins in the holes. If you don't know how to solder, buy a "Soldering Iron Kit" (approx ₹400) or ask a friend.
2.  **Power Supply**: The ESP32 can be powered via the USB cable connected to your PC during development.
