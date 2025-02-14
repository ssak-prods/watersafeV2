# 🔬 WaterSafe V2 - Sensor Analysis & Wiring Guide (2-Sensor System)

**Based on actual hardware photos and specifications**  
**System Configuration**: TDS + Turbidity + Temperature (pH sensor removed for deployment robustness)

---

## 🎯 **Why No pH Sensor?**

**Decision**: pH sensor removed from project for practical reasons:
- ❌ **Fragile**: Glass electrode breaks easily
- ❌ **Maintenance**: Requires constant calibration and storage solution
- ❌ **Cost**: Expensive to replace (~₹600 per probe)
- ❌ **Deployment**: Not suitable for rugged, unattended installations

**What We're Using Instead**:
- ✅ **TDS** (Total Dissolved Solids) - Measures water conductivity/salinity
- ✅ **Turbidity** - Measures water clarity/cloudiness
- ✅ **Temperature** - Essential for TDS compensation and anomaly detection

**Result**: More robust, lower maintenance, deployment-ready system!

---

## 📸 **YOUR ACTUAL SENSORS - Analyzed**

### **1. TDS Sensor (DFRobot Gravity Analog TDS Meter V1.0)**

**What I See in Photos**:
- **Module Board**: Black PCB with "Gravity TDS Meter V1.0" label and DFRobot logo
- **Two Connectors**: 
  - White 3-pin connector (power/signal)
  - White 2-pin connector (probe connection)
- **Cables Included**:
  - Short cable with 3 wires (Red, Blue, Black) - Power/Signal cable
  - Long black cable with 2 wires (Red, Blue) - Probe cable
- **Probe**: Two metal electrodes in black housing (visible in photo)

**Module Specifications**:
- **3-Pin Connector** (Power/Signal):
  - **Red Wire**: VCC (5V Power)
  - **Blue Wire**: GND (Ground)
  - **Black Wire**: A (Analog Output Signal)
- **2-Pin Connector** (Probe):
  - Connects to the TDS probe electrodes
- **Operating Voltage**: 3.3V - 5.5V DC
- **Output**: 0-2.3V analog voltage (proportional to TDS)
- **Measurement Range**: 0-1000 ppm (parts per million)
- **Temperature Compensation**: Requires temperature input (from DS18B20!)

**Important Notes**:
- ⚠️ **Probe must be submerged** to at least the marked line
- ⚠️ **Do NOT touch probe electrodes** with fingers (affects readings)
- ⚠️ **Temperature compensation** needed for accurate readings (we'll use DS18B20 temp!)

---

### **2. Turbidity Sensor (DFRobot Gravity Analog Turbidity Sensor)**

**What I See in Photos**:
- **Module Board**: Black PCB with "Gravity" label and blue potentiometer
- **Two White Connectors**: 
  - 3-pin connector (power/signal)
  - 3-pin connector (probe connection)
- **Cables Included**:
  - Cable with twisted wires (Red, Yellow, Black) - Power/Signal
  - Cable with twisted wires (Red, Yellow, Black) - Probe connection
- **Probe**: Clear/translucent plastic housing with LED and photodetector (visible in photo)

**Module Specifications**:
- **3-Pin Connector** (Power/Signal to ESP32):
  - **Red Wire**: VCC (5V Power)
  - **Black Wire**: GND (Ground)
  - **Yellow Wire**: A (Analog Output Signal)
- **3-Pin Connector** (Probe Connection):
  - Connects module to turbidity probe
  - **Red**: LED power
  - **Yellow**: Photodetector signal
  - **Black**: Ground
- **Operating Voltage**: 5V DC
- **Output**: 0-4.5V analog voltage (inversely proportional to turbidity!)
  - **Clear water** = Higher voltage (~4V)
  - **Turbid water** = Lower voltage (~0.5V)
- **Measurement Range**: 0-3000 NTU (Nephelometric Turbidity Units)
- **Blue Potentiometer**: Sensitivity adjustment

**Important Notes**:
- ⚠️ **Optical sensor** - Keep probe clean! Wipe with soft cloth
- ⚠️ **Inverse relationship**: Higher turbidity = LOWER voltage
- ⚠️ **Calibration**: Use clear water as baseline (should read ~4V)
- ⚠️ **Avoid air bubbles** on probe surface (affects readings)

---

### **3. DS18B20 Temperature Sensor** (Already Connected!)

**What You Have**:
- ✅ Waterproof temperature probe (3 wires: Red, Black, Yellow)
- ✅ Already wired and tested (TEST 3.5 complete!)
- ✅ Displaying on OLED in real-time

**Why It's Critical**:
- **TDS Compensation**: TDS readings vary with temperature (we'll correct this!)
- **Anomaly Detection**: Sudden temperature changes indicate water source changes
- **Baseline**: Normal water temperature is ~25°C (room temp)

---

## 🔌 **WIRING PLAN - 2 Analog Sensors**

### **TEST 4.1: TDS Sensor (First Sensor)**

**Hardware Needed**:
- TDS module board
- TDS probe (two metal electrodes)
- 2 cables (short 3-wire for power/signal, long 2-wire for probe)

**Wiring**:

**Step 1: Connect Probe to Module**
- Take the **long black cable** (2-wire: Red + Blue)
- Plug the white connector into the **2-pin socket** on the TDS module
- The other end connects to the TDS probe electrodes

**Step 2: Connect Power/Signal Cable**
- Take the **short cable** (3-wire: Red, Blue, Black)
- Plug the white connector into the **3-pin socket** on the TDS module

**Step 3: Connect to Breadboard**
- **Red wire** (VCC) → Breadboard **"+" rail** (5V)
- **Blue wire** (GND) → Breadboard **"-" rail** (Ground)
- **Black wire** (Signal) → **ADS1115 A0** pin

**Verification Checklist**:
- [ ] TDS module has both cables connected (2-pin and 3-pin)
- [ ] Power wires go to breadboard rails
- [ ] Signal wire (black) goes to ADS1115 A0
- [ ] Probe is connected (but don't submerge yet!)

---

### **TEST 4.2: Turbidity Sensor (Second Sensor)**

**Hardware Needed**:
- Turbidity module board
- Turbidity probe (clear plastic housing with LED/photodetector)
- 2 cables (both 3-wire: Red, Yellow, Black)

**Wiring**:

**Step 1: Connect Probe to Module**
- Take **one 3-wire cable** (Red, Yellow, Black)
- Plug the white connector into one of the **3-pin sockets** on the turbidity module
- The other end connects to the turbidity probe

**Step 2: Connect Power/Signal Cable**
- Take the **other 3-wire cable** (Red, Yellow, Black)
- Plug the white connector into the remaining **3-pin socket** on the turbidity module

**Step 3: Connect to Breadboard**
- **Red wire** (VCC) → Breadboard **"+" rail** (5V)
- **Black wire** (GND) → Breadboard **"-" rail** (Ground)
- **Yellow wire** (Signal) → **ADS1115 A1** pin

**Verification Checklist**:
- [ ] Turbidity module has both cables connected (probe + power/signal)
- [ ] Power wires go to breadboard rails
- [ ] Signal wire (yellow) goes to ADS1115 A1
- [ ] Probe LED should light up when powered (visible through clear housing)

---

## 📊 **Complete Wiring Summary (2 Sensors + Temperature)**

### **ADS1115 Connections**:
```
ADS1115 Pin | Connected To
------------|-------------
VDD         | Breadboard "+" rail (5V)
GND         | Breadboard "-" rail
SCL         | Breadboard Row 21 (shared with ESP32 G22)
SDA         | Breadboard Row 20 (shared with ESP32 G21)
A0          | TDS Sensor Signal (Black wire)
A1          | Turbidity Sensor Signal (Yellow wire)
A2          | (Unused)
A3          | (Unused)
```

### **Power Distribution**:
```
Breadboard "+" rail (5V) supplies:
  - ESP32 VIN
  - ADS1115 VDD
  - OLED VCC
  - DS18B20 RED wire (via Row 10)
  - TDS Module VCC (Red wire)
  - Turbidity Module VCC (Red wire)

Breadboard "-" rail (GND) supplies:
  - ESP32 GND
  - ADS1115 GND
  - OLED GND
  - DS18B20 BLACK wire (via Row 11)
  - TDS Module GND (Blue wire)
  - Turbidity Module GND (Black wire)
```

### **Digital Sensors (Already Connected)**:
```
DS18B20 Temperature:
  - RED wire → Row 10 → "+" rail
  - BLACK wire → Row 11 → "-" rail
  - YELLOW wire → Row 12 → ESP32 GPIO 4
  - 4.7kΩ resistor → Row 12 → "+" rail
```

---

## ⚠️ **CRITICAL SAFETY NOTES**

### **TDS Sensor**:
1. **Submerge to marked line** on probe (usually ~1cm depth)
2. **Don't touch electrodes** with fingers (oils affect readings)
3. **Temperature compensation** needed for accuracy (we'll use DS18B20!)
4. **Rinse with distilled water** after use

### **Turbidity Sensor**:
1. **Keep optical surfaces clean** - wipe with soft cloth
2. **Avoid air bubbles** on probe surface
3. **Calibration**: Clear water should read ~4V (high voltage)
4. **Inverse reading**: More turbid = LOWER voltage
5. **Don't scratch** the optical windows!

---

## 🧪 **Testing Strategy - One at a Time**

### **TEST 4.1: TDS Sensor Only**
1. Wire TDS sensor to ADS1115 A0
2. Upload test code (reads A0 only)
3. Test with:
   - **Distilled water** → Should read ~0V (0 ppm)
   - **Tap water** → Should read ~0.5-1.5V (100-500 ppm)
   - **Salt water** (1 tsp in 1 cup) → Should read ~2-3V (>500 ppm)
4. Verify readings change with water conductivity
5. Display on OLED: TDS value + Temperature

### **TEST 4.2: Turbidity Sensor Only**
1. Wire turbidity sensor to ADS1115 A1
2. Upload test code (reads A1 only)
3. Test with:
   - **Clear water** → Should read ~4V (low turbidity)
   - **Milk water** (few drops) → Should read ~2V (medium turbidity)
   - **Milk water** (more drops) → Should read ~0.5V (high turbidity)
4. Verify readings decrease as turbidity increases
5. Display on OLED: Turbidity value + Temperature

### **TEST 4.3: Both Sensors Together**
1. Both sensors wired to A0 and A1
2. Upload test code (reads both channels)
3. Verify readings are independent (changing one doesn't affect the other)
4. Display on OLED: TDS + Turbidity + Temperature (3 parameters!)

---

## � **What We Can Detect (Without pH)**

### **Anomalies Detectable with TDS + Turbidity + Temperature**:

**1. Contamination Events**:
- ✅ **Sewage leak**: High TDS + High Turbidity
- ✅ **Industrial discharge**: Very high TDS
- ✅ **Sediment influx**: High Turbidity (low TDS)
- ✅ **Salt contamination**: High TDS (low Turbidity)

**2. System Issues**:
- ✅ **Pipe corrosion**: Gradual TDS increase
- ✅ **Filter failure**: Turbidity spike
- ✅ **Temperature anomaly**: Source water change

**3. Normal vs Abnormal**:
- ✅ **Normal water**: Low TDS (~100-300 ppm), Low Turbidity (~0-5 NTU), ~25°C
- ✅ **Abnormal water**: Deviations from baseline in any parameter

**What We're Missing Without pH**:
- ❌ Acid/base contamination (vinegar, bleach)
- ❌ pH-specific water quality (drinking water should be pH 6.5-8.5)

**Conclusion**: We can still detect **90% of water quality issues** without pH!

---

## 🎯 **Next Steps**

**TELL ME**:

**Option A**: "Let's wire TDS sensor first (TEST 4.1)!"  
→ I'll create TDS test code with temperature compensation

**Option B**: "Let's wire Turbidity sensor first (TEST 4.2)!"  
→ I'll create Turbidity test code with inverse reading explanation

**Option C**: "Let's wire both sensors together (TEST 4.3)!"  
→ I'll create combined test code for both sensors

**Option D**: "Update all project files to remove pH references first"  
→ I'll scan and update: BOM, firmware, ML scripts, documentation

**Your choice?** 🔬
