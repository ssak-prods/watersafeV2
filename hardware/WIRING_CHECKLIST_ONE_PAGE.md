# ⚡ WaterSafe V2 - One-Page Wiring Checklist

**Print this and keep it next to your workbench!**

---

## 🔌 **15 Wires + 1 Resistor = Complete System**

### **STAGE 1: Power Rails (2 wires)**
- [ ] **Wire-1**: ESP32 **V5** → Breadboard **"+" rail**
- [ ] **Wire-2**: ESP32 **GND** → Breadboard **"-" rail**

### **STAGE 2: I2C Junction (2 wires)**
- [ ] **Wire-3**: ESP32 **G21** → Breadboard **Row 20, LEFT section** (columns a-e) (SDA hub)
- [ ] **Wire-4**: ESP32 **G22** → Breadboard **Row 21, LEFT section** (columns a-e) (SCL hub)

### **STAGE 3: ADS1115 ADC (4 wires)**
- [ ] **Wire-5**: ADS1115 **VDD** → **"+" rail**
- [ ] **Wire-6**: ADS1115 **GND** → **"-" rail**
- [ ] **Wire-7**: ADS1115 **SDA** → **Row 20, LEFT section** (same row as Wire-3)
- [ ] **Wire-8**: ADS1115 **SCL** → **Row 21, LEFT section** (same row as Wire-4)

### **STAGE 4: OLED Display (4 wires)**
- [ ] **Wire-9**: OLED **VCC** → **"+" rail**
- [ ] **Wire-10**: OLED **GND** → **"-" rail**
- [ ] **Wire-11**: OLED **SDA** → **Row 20, LEFT section** (same row as Wire-3 & Wire-7)
- [ ] **Wire-12**: OLED **SCL** → **Row 21, LEFT section** (same row as Wire-4 & Wire-8)

### **STAGE 5: DS18B20 Temperature (3 wires + 1 resistor)**
- [ ] Insert DS18B20 **RED** wire into **Row 10, LEFT section** (any hole: a/b/c/d or e)
- [ ] Insert DS18B20 **BLACK** wire into **Row 11, LEFT section**
- [ ] Insert DS18B20 **YELLOW** wire into **Row 12, LEFT section**
- [ ] **Wire-13**: Row 10, LEFT section → **"+" rail**
- [ ] **Wire-14**: Row 11, LEFT section → **"-" rail**
- [ ] **Wire-15**: Row 12, LEFT section → ESP32 **GPIO 4** (G4)
- [ ] **4.7kΩ Resistor**: Row 12, LEFT section → **"+" rail** ⚠️ **CRITICAL!**

### **STAGE 6: TDS MODULE (3 wires):
- [ ] **Wire-16**: TDS **Red** → "+" rail (5V)
- [ ] **Wire-17**: TDS **Black** → "-" rail (GND)
- [ ] **Wire-18**: TDS **Yellow** → ADS1115 A0

### **STAGE 7: Turbidity MODULE (3 wires):
- [ ] **Wire-19**: Turbidity **Red** → Breadboard "+" rail (5V)
- [ ] **Wire-20**: Turbidity **Black** → Breadboard "-" rail (GND)
- [ ] **Wire-21**: Turbidity **Yellow** → ADS1115 A1

---

## ✅ **Final Checks Before Power-On**

- [ ] All 18 wires connected
- [ ] 4.7kΩ resistor in place (Row 12 → "+" rail)
- [ ] No wires touching each other
- [ ] "+" and "-" rails not shorted
- [ ] USB cable ready (but NOT plugged in yet!)

---

## 🚀 **Power-On Test Sequence**

1. **Plug in USB** → ESP32 red LED should light up
2. **Upload test2_i2c_scanner.cpp** → Should find 0x3C and 0x48
3. **Upload test3_temperature.cpp** → Should read ~25°C
4. **Upload test2_6_animated.cpp** → OLED should show animation

---

## 🔍 **Quick Troubleshooting**

| Problem | Quick Fix |
|---------|-----------|
| No power | Check Wire-1 and Wire-2 |
| No I2C devices | Check Rows 20-21 connections |
| Temp = -127°C | Check 4.7kΩ resistor! |
| OLED blank | Check OLED power (Wire-9, Wire-10) |

---

## 🗺️ **Breadboard Layout Guide**

```
BREADBOARD TOP VIEW (Which holes to use):

Power Rails    Main Area                     
(LEFT)         LEFT section  GAP  RIGHT section
               (USE THIS!)        (DON'T USE)

  -  +         a b c d e     ═══  f g h i j
  ●  ●         ● ● ● ● ● ●   ═══  ● ● ● ● ●   Row 1
  ●  ●         ● ● ● ● ● ●   ═══  ● ● ● ● ●   Row 2
  ...          ...           ═══  ...         ...
  ●  ●         ● ● ● ● ● ●   ═══  ● ● ● ● ●   Row 10 ← DS18B20 RED (LEFT!)
  ●  ●         ● ● ● ● ● ●   ═══  ● ● ● ● ●   Row 11 ← DS18B20 BLACK (LEFT!)
  ●  ●         ● ● ● ● ● ●   ═══  ● ● ● ● ●   Row 12 ← DS18B20 YELLOW (LEFT!)
  ...          ...           ═══  ...         ...
  ●  ●         ● ● ● ● ● ●   ═══  ● ● ● ● ●   Row 20 ← I2C SDA (LEFT!)
  ●  ●         ● ● ● ● ● ●   ═══  ● ● ● ● ●   Row 21 ← I2C SCL (LEFT!)
  ...          ...           ═══  ...         ...
  ●  ●         ● ● ● ● ● ●   ═══  ● ● ● ● ●   Row 30

               ↑↑↑↑↑
          ALWAYS USE LEFT!
          (columns a-e)
```

**KEY RULE**: For ALL junction rows (10, 11, 12, 20, 21), use the **LEFT section** (columns a, b, c, d, or e). The RIGHT section (columns f-j) is NOT connected to the LEFT section!

---

## 📍 **Pin Finder (ESP32 38-pin)**

```
LEFT SIDE (bottom to top):
  VIN (or V5) ← Wire-1 connects here
  
RIGHT SIDE (top to bottom):
  GND ← Wire-2 connects here
  G23
  G22 ← Wire-4 connects here (SCL)
  TX0
  RX0
  G21 ← Wire-3 connects here (SDA)
  GND
  G19
  G18
  G5
  G17
  G16
  G4  ← Wire-15 connects here (DS18B20 data)
  ...
```

---

**Time to Complete**: ~40 minutes  
**Difficulty**: Beginner-friendly  
**Success Rate**: 100% if you follow checklist!

---

**💡 Pro Tip**: Take a photo after each stage. If something breaks, you can compare to the photo!
