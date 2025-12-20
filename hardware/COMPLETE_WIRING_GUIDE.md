# 🔌 WaterSafe V2 - Complete Wiring Reference

**Use this guide anytime you need to wire up the system from scratch!**

---

## 📦 **Component Inventory**

### **Main Components**:
- [ ] ESP32-WROOM-32 (38-pin development board)
- [ ] ADS1115 16-bit ADC (purple board with header pins)
- [ ] OLED Display 0.96" I2C (blue board, 4 pins: GND, VCC, SCL, SDA)
- [ ] DS18B20 Waterproof Temperature Probe (3 wires: Red, Black, Yellow)
- [ ] Breadboard (830 tie-points, split at row 30)

### **Sensors (For TEST 4+)**:
- [ ] pH Sensor Module (analog output)
- [ ] Turbidity Sensor Module (analog output)
- [ ] TDS Sensor Module (analog output)

### **Wiring Supplies**:
- [ ] 4.7kΩ Resistor (1 piece - CRITICAL for DS18B20!)
- [ ] M-M Jumper Wires (at least 10)
- [ ] M-F Jumper Wires (at least 10)
- [ ] F-F Jumper Wires (at least 10)
- [ ] USB Micro-USB cable

---

## 🗺️ **Pin Mapping Table - Master Reference**

### **ESP32 Pins Used**:

| ESP32 Pin | Label on Board | Purpose | Connects To |
|-----------|----------------|---------|-------------|
| VIN (or V5) | V5 | 5V Power Output | Breadboard "+" rail |
| GND (right top) | GND | Ground | Breadboard "-" rail |
| GPIO 21 | G21 | I2C SDA (Data) | Breadboard Row 20 |
| GPIO 22 | G22 | I2C SCL (Clock) | Breadboard Row 21 |
| GPIO 4 | G4 | OneWire Data | Breadboard Row 12 |

---

### **ADS1115 Pins**:

| ADS1115 Pin | Purpose | Connects To |
|-------------|---------|-------------|
| VDD | Power (5V) | Breadboard "+" rail |
| GND | Ground | Breadboard "-" rail |
| SCL | I2C Clock | Breadboard Row 21 (shared with ESP32 G22) |
| SDA | I2C Data | Breadboard Row 20 (shared with ESP32 G21) |
| A0 | Analog Input 0 | pH Sensor Signal (TEST 4+) |
| A1 | Analog Input 1 | Turbidity Sensor Signal (TEST 4+) |
| A2 | Analog Input 2 | TDS Sensor Signal (TEST 4+) |
| A3 | Analog Input 3 | (Unused for now) |

---

### **OLED Display Pins**:

| OLED Pin | Purpose | Connects To |
|----------|---------|-------------|
| GND | Ground | Breadboard "-" rail |
| VCC | Power (5V) | Breadboard "+" rail |
| SCL | I2C Clock | Breadboard Row 21 (shared with ESP32 G22) |
| SDA | I2C Data | Breadboard Row 20 (shared with ESP32 G21) |

---

### **DS18B20 Temperature Probe**:

| Wire Color | Purpose | Connects To |
|------------|---------|-------------|
| RED | VCC (5V Power) | Breadboard Row 10 → "+" rail |
| BLACK | GND (Ground) | Breadboard Row 11 → "-" rail |
| YELLOW | DATA (OneWire) | Breadboard Row 12 → ESP32 GPIO 4 |
| **4.7kΩ Resistor** | Pull-up | Between Row 12 and "+" rail |

---

## 🔧 **Complete Wiring Instructions (Step-by-Step)**

### **⚠️ SAFETY FIRST**:
- **ALWAYS unplug USB before wiring!**
- **Double-check connections before plugging in!**
- **Never connect power (+) directly to ground (-)**

---

### **STAGE 1: Breadboard Power Rails Setup**

**Goal**: Distribute 5V and GND from ESP32 to breadboard rails

**Breadboard Layout**:
```
LEFT SIDE (Rows 1-30):
  - (outer column) = GROUND rail
  + (inner column) = POWER rail (5V)

Note: Rows 31-60 are NOT connected (split at row 30)
```

**Wiring** (2 wires):

**Wire-1: Power Distribution**
- **From**: ESP32 **VIN** pin (or **V5**) - Left side, bottom pin
- **To**: Breadboard LEFT **"+" inner column** (any hole in rows 1-30)
- **Wire Type**: M-F or M-M (depending on ESP32 pin accessibility)

**Wire-2: Ground Distribution**
- **From**: ESP32 **GND** pin - Right side, top pin
- **To**: Breadboard LEFT **"-" outer column** (any hole in rows 1-30)
- **Wire Type**: M-F or M-M

**Result**: Entire "+" rail = 5V, entire "-" rail = GND

---

### **STAGE 2: I2C Bus Junction Points**

**Goal**: Create shared connection points for I2C devices (ADS1115 and OLED)

**Breadboard Rows Used**:
- **Row 20** = SDA junction (I2C Data line)
- **Row 21** = SCL junction (I2C Clock line)

**Wiring** (2 wires):

**Wire-3: SDA Line (ESP32 to Junction)**
- **From**: ESP32 **GPIO 21** (G21) - Right side, 6th pin from top
- **To**: Breadboard **Row 20** (any hole)
- **Wire Type**: M-F or M-M

**Wire-4: SCL Line (ESP32 to Junction)**
- **From**: ESP32 **GPIO 22** (G22) - Right side, 3rd pin from top
- **To**: Breadboard **Row 21** (any hole)
- **Wire Type**: M-F or M-M

**Result**: Row 20 = SDA hub, Row 21 = SCL hub

---

### **STAGE 3: ADS1115 ADC Module**

**Goal**: Connect ADS1115 for analog sensor reading

**Wiring** (4 wires):

**Wire-5: ADS1115 Power**
- **From**: ADS1115 **VDD** pin
- **To**: Breadboard **"+" rail**
- **Wire Type**: M-F or M-M

**Wire-6: ADS1115 Ground**
- **From**: ADS1115 **GND** pin
- **To**: Breadboard **"-" rail**
- **Wire Type**: M-F or M-M

**Wire-7: ADS1115 SDA (Data)**
- **From**: ADS1115 **SDA** pin
- **To**: Breadboard **Row 20** (different hole, same row as Wire-3)
- **Wire Type**: M-F or M-M

**Wire-8: ADS1115 SCL (Clock)**
- **From**: ADS1115 **SCL** pin
- **To**: Breadboard **Row 21** (different hole, same row as Wire-4)
- **Wire Type**: M-F or M-M

**Result**: ADS1115 powered and connected to I2C bus

---

### **STAGE 4: OLED Display**

**Goal**: Connect OLED for visual output

**Wiring** (4 wires):

**Wire-9: OLED Power**
- **From**: OLED **VCC** pin
- **To**: Breadboard **"+" rail**
- **Wire Type**: M-F or M-M

**Wire-10: OLED Ground**
- **From**: OLED **GND** pin
- **To**: Breadboard **"-" rail**
- **Wire Type**: M-F or M-M

**Wire-11: OLED SDA (Data)**
- **From**: OLED **SDA** pin
- **To**: Breadboard **Row 20** (different hole, same row as Wire-3 and Wire-7)
- **Wire Type**: M-F or M-M

**Wire-12: OLED SCL (Clock)**
- **From**: OLED **SCL** pin
- **To**: Breadboard **Row 21** (different hole, same row as Wire-4 and Wire-8)
- **Wire Type**: M-F or M-M

**Result**: OLED powered and sharing I2C bus with ADS1115

---

### **STAGE 5: DS18B20 Temperature Sensor**

**Goal**: Connect temperature probe with OneWire protocol

**Breadboard Rows Used**:
- **Row 10** = DS18B20 RED wire (Power)
- **Row 11** = DS18B20 BLACK wire (Ground)
- **Row 12** = DS18B20 YELLOW wire (Data) + Pull-up resistor

**Wiring** (3 wires + 1 resistor):

**Wire-13: DS18B20 Power**
- **From**: Breadboard **Row 10** (where RED wire is inserted)
- **To**: Breadboard **"+" rail**
- **Wire Type**: M-M

**Wire-14: DS18B20 Ground**
- **From**: Breadboard **Row 11** (where BLACK wire is inserted)
- **To**: Breadboard **"-" rail**
- **Wire Type**: M-M

**Wire-15: DS18B20 Data**
- **From**: Breadboard **Row 12** (where YELLOW wire is inserted)
- **To**: ESP32 **GPIO 4** (G4) - Right side, 7th pin from bottom
- **Wire Type**: M-M or M-F

**RESISTOR: 4.7kΩ Pull-up (CRITICAL!)**
- **One leg**: Breadboard **Row 12** (same row as YELLOW wire)
- **Other leg**: Breadboard **"+" rail**
- **Note**: Resistor is non-polarized (either leg can go either way)

**Result**: DS18B20 connected with proper pull-up resistor

---

## 📊 **Visual Wiring Diagram**

```
BREADBOARD LAYOUT (Rows 1-30):

Power Rails:
  - (outer) ← All GND connections
  + (inner) ← All VCC/VDD/VIN connections

Main Area:
  Row 10: [DS18B20 RED] ──────→ + rail
                                ↑
                                │ 4.7kΩ resistor
                                │
  Row 12: [DS18B20 YELLOW] ────┴──→ ESP32 GPIO 4
  
  Row 11: [DS18B20 BLACK] ─────→ - rail
  
  Row 20: [ESP32 G21] ─┬─ [ADS1115 SDA] ← I2C SDA Bus
                       └─ [OLED SDA]
  
  Row 21: [ESP32 G22] ─┬─ [ADS1115 SCL] ← I2C SCL Bus
                       └─ [OLED SCL]

Components:
  ESP32: Straddling breadboard or floating (connected via wires)
  ADS1115: Floating (connected via wires)
  OLED: Floating (connected via wires)
  DS18B20: Wires inserted into breadboard rows 10-12
```

---

## ✅ **Verification Checklist**

### **Before Plugging in USB**:

**Power Connections** (6 wires):
- [ ] ESP32 VIN → "+" rail (Wire-1)
- [ ] ESP32 GND → "-" rail (Wire-2)
- [ ] ADS1115 VDD → "+" rail (Wire-5)
- [ ] ADS1115 GND → "-" rail (Wire-6)
- [ ] OLED VCC → "+" rail (Wire-9)
- [ ] OLED GND → "-" rail (Wire-10)
- [ ] DS18B20 RED (Row 10) → "+" rail (Wire-13)
- [ ] DS18B20 BLACK (Row 11) → "-" rail (Wire-14)

**I2C Connections** (4 wires):
- [ ] ESP32 G21 → Row 20 (Wire-3)
- [ ] ESP32 G22 → Row 21 (Wire-4)
- [ ] ADS1115 SDA → Row 20 (Wire-7)
- [ ] ADS1115 SCL → Row 21 (Wire-8)
- [ ] OLED SDA → Row 20 (Wire-11)
- [ ] OLED SCL → Row 21 (Wire-12)

**OneWire Connection** (1 wire + resistor):
- [ ] DS18B20 YELLOW (Row 12) → ESP32 GPIO 4 (Wire-15)
- [ ] 4.7kΩ resistor: Row 12 → "+" rail

**Safety Checks**:
- [ ] No wires touching each other (no shorts)
- [ ] All wires firmly inserted (not loose)
- [ ] "+" rail never directly connected to "-" rail
- [ ] All components stable (not dangling)

---

## 🚀 **Testing Sequence**

After wiring, test in this order:

### **TEST 1: Power Check**
- Plug in USB
- **Expected**: ESP32 red LED lights up
- **If not**: Check Wire-1 and Wire-2

### **TEST 2: I2C Scanner**
- Upload `test2_i2c_scanner.cpp`
- **Expected**: Serial Monitor shows 0x3C (OLED) and 0x48 (ADS1115)
- **If not**: Check Wires 3, 4, 7, 8, 11, 12

### **TEST 3: Temperature**
- Upload `test3_temperature.cpp`
- **Expected**: Temperature reads ~25°C (room temp)
- **If -127°C**: Check 4.7kΩ resistor and Wire-15

### **TEST 4: OLED Display**
- Upload `test2_6_animated.cpp`
- **Expected**: OLED shows animated text
- **If blank**: Check Wires 9, 10, 11, 12

---

## 🔍 **Troubleshooting Guide**

### **Problem: "No I2C devices found"**
**Check**:
1. Power rails: Are "+" and "-" rails powered?
2. I2C wires: Are Rows 20 and 21 connected to ESP32 G21/G22?
3. Component power: Are VCC/VDD connected to "+" rail?
4. Component ground: Are GND connected to "-" rail?

### **Problem: "Temperature reads -127°C"**
**Cause**: Missing or disconnected pull-up resistor
**Fix**:
1. Verify 4.7kΩ resistor: One leg in Row 12, other in "+" rail
2. Check Wire-15: Row 12 → ESP32 GPIO 4
3. Ensure resistor legs are fully inserted

### **Problem: "OLED is blank"**
**Check**:
1. OLED power: VCC → "+", GND → "-"
2. OLED I2C: SDA → Row 20, SCL → Row 21
3. Upload correct code (test2_6_animated.cpp)

### **Problem: "ESP32 won't power on"**
**Check**:
1. USB cable is good (try different cable)
2. Wire-1 (VIN → "+") is connected
3. Wire-2 (GND → "-") is connected
4. No short circuits (+ and - not touching)

---

## 📋 **Quick Reference Card (Print This!)**

```
═══════════════════════════════════════════════════════════
                 WATERSAFE V2 WIRING QUICK REF
═══════════════════════════════════════════════════════════

POWER RAILS:
  ESP32 VIN → + rail  |  ESP32 GND → - rail

I2C BUS (Rows 20-21):
  Row 20 (SDA): ESP32 G21 + ADS1115 SDA + OLED SDA
  Row 21 (SCL): ESP32 G22 + ADS1115 SCL + OLED SCL

ADS1115:
  VDD → + rail  |  GND → - rail  |  SDA → Row 20  |  SCL → Row 21

OLED:
  VCC → + rail  |  GND → - rail  |  SDA → Row 20  |  SCL → Row 21

DS18B20 (Rows 10-12):
  RED (Row 10) → + rail
  BLACK (Row 11) → - rail
  YELLOW (Row 12) → ESP32 GPIO 4
  4.7kΩ resistor: Row 12 → + rail (CRITICAL!)

TOTAL WIRES: 15 wires + 1 resistor

TEST SEQUENCE:
  1. Power Check (red LED on ESP32)
  2. I2C Scanner (0x3C + 0x48)
  3. Temperature (~25°C)
  4. OLED Display (animated text)
═══════════════════════════════════════════════════════════
```

---

## 📝 **Notes for Future Assembly**

### **Tips**:
- Use different colored wires for different purposes (helps debugging)
- Keep wires short to reduce clutter
- Label components with tape if needed
- Take photos after each stage (helps remember)

### **Common Mistakes to Avoid**:
- ❌ Forgetting the 4.7kΩ pull-up resistor for DS18B20
- ❌ Connecting 5V directly to ESP32 GPIO pins (use VIN instead)
- ❌ Mixing up SDA and SCL (swap them if I2C doesn't work)
- ❌ Using rows 31+ without bridging the power rail split

### **Time Estimates**:
- Stage 1 (Power Rails): 5 minutes
- Stage 2 (I2C Junction): 5 minutes
- Stage 3 (ADS1115): 10 minutes
- Stage 4 (OLED): 10 minutes
- Stage 5 (DS18B20): 10 minutes
- **Total**: ~40 minutes for complete assembly

---

**Last Updated**: 2026-02-09  
**Tested**: ✅ All stages verified working  
**Version**: 1.0 (Complete for TEST 1-3)
