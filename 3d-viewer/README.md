# WaterSafe V2 - Ultra-Realistic 3D Water Testing Simulation

An immersive, interactive 3D visualization of the WaterSafe V2 hardware system being tested in water, with photorealistic components and dynamic water quality simulation.

## 🌊 Features

### Ultra-Realistic Components
- **ESP32-WROOM-32 DevKit**: 30-pin board with micro-USB, power LED, buttons, and antenna
- **ADS1115 16-bit ADC**: Purple PCB with green screw terminals and TSSOP chip
- **SSD1306 OLED Display**: Glowing blue 128x64 display with pixel grid
- **pH Sensor**: Yellow PCB with silver BNC connector and glass probe
- **Turbidity Sensor (TS-300B)**: Black housing with optical window and IR LED
- **TDS Sensor**: Blue PCB with waterproof 2-prong stainless steel probe
- **DS18B20 Temperature Probe**: Brushed stainless steel with 3-wire cable
- **4.7kΩ Pull-up Resistor**: Tan body with accurate color bands
- **MB-102 Breadboard**: 830 tie-points with power rails

### Realistic Wiring System
- **DuPont Connectors**: Black plastic housing with gold contacts
- **Bezier Curve Routing**: Smooth, natural wire paths
- **Color-Coded Wires**: Red (5V), Black (GND), Green (SDA), Yellow (SCL), Blue (OneWire), Orange (Analog)
- **Accurate Pin Connections**: Wires connect to exact GPIO pins

### Dynamic Water Simulation
- **Custom Shader**: Gerstner waves with Fresnel effect
- **Quality-Based Appearance**: Color and opacity change with turbidity and pH
- **Caustics Effect**: Underwater light patterns
- **Transparent Basin**: Acrylic container with metal frame

### Interactive Features
- **Water Quality Controls**: Adjust pH, turbidity, TDS, and temperature in real-time
- **Water Presets**: Pure, Tap, Muddy, Acidic, Alkaline, Contaminated
- **Waterproof Zone Indicators**: Green (submerge safe), Yellow (splash zone), Red (keep dry)
- **Component Tooltips**: Hover to see component info and waterproof status
- **View Options**: Toggle wires, labels, X-ray mode, and water surface
- **Live Sensor Readouts**: Real-time display of water quality parameters

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
cd 3d-viewer
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

## 🎮 Controls

- **Left Mouse Drag**: Rotate camera
- **Scroll Wheel**: Zoom in/out
- **Right Mouse Drag**: Pan camera
- **Click Component**: Highlight and inspect
- **Hover Component**: Show tooltip with details

## 🎨 Water Quality Presets

| Preset | pH | Turbidity (NTU) | TDS (ppm) | Temp (°C) |
|--------|-----|-----------------|-----------|-----------|
| Pure Water | 7.0 | 0 | 10 | 20 |
| Tap Water | 7.2 | 5 | 250 | 25 |
| Muddy Water | 6.8 | 850 | 450 | 22 |
| Acidic | 4.5 | 20 | 180 | 25 |
| Alkaline | 9.5 | 10 | 320 | 25 |
| Contaminated | 5.2 | 950 | 780 | 28 |

## 🔧 Technical Stack

- **Vite**: Fast build tool with HMR
- **Three.js r160+**: 3D rendering engine
- **GSAP**: Animation library
- **Custom Shaders**: GLSL for water simulation

## 📁 Project Structure

```
3d-viewer/
├── index.html              # Main HTML with UI
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── src/
│   ├── main.js             # Entry point
│   ├── scene.js            # Scene setup & lighting
│   ├── components/         # 3D component models
│   │   ├── Breadboard.js
│   │   ├── ESP32.js
│   │   ├── ADS1115.js
│   │   ├── OLED.js
│   │   ├── PHSensor.js
│   │   ├── Turbidity.js
│   │   ├── TDSSensor.js
│   │   ├── DS18B20.js
│   │   └── Resistor.js
│   ├── wiring/
│   │   └── WireManager.js  # Wire routing system
│   ├── water/
│   │   └── WaterBasin.js   # Water simulation
│   └── interaction/
│       ├── DragControls.js # Mouse interactions
│       └── ZoneIndicator.js # Waterproof zones
```

## 🌟 Highlights

### Photorealistic Materials
- **PBR Materials**: Physically-based rendering for realistic lighting
- **Metalness & Roughness**: Accurate surface properties
- **Emissive LEDs**: Glowing power indicators
- **Transparent Glass**: pH probe bulb with transmission

### Advanced Lighting
- **5-Point Lighting Setup**: Key, fill, rim, and accent lights
- **Shadow Mapping**: Soft shadows with PCF filtering
- **Tone Mapping**: ACES Filmic for cinematic look
- **Point Lights**: Local highlights on components

### Performance Optimizations
- **Instanced Geometry**: Reused meshes for efficiency
- **LOD System**: Simplified geometry for distant objects (future)
- **Shader Optimization**: Efficient GLSL code
- **Texture Compression**: Minimal memory usage

## 📝 License

Part of the WaterSafe V2 project.

## 👨‍💻 Development

Built with attention to detail, accuracy, and visual excellence. Every component is modeled to match real-world specifications from datasheets and product images.

---

**Enjoy exploring the WaterSafe V2 system in 3D!** 🌊💧
