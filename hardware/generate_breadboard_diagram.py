import svgwrite
from svgwrite import cm, mm

def create_breadboard_diagram():
    """
    Creates a detailed breadboard wiring diagram with realistic component placement
    """
    dwg = svgwrite.Drawing('d:/watersafeV2/hardware/breadboard_wiring_guide.svg', 
                          size=('1800px', '1400px'), profile='full')
    
    # Styles
    dwg.defs.add(dwg.style("""
        .text { font-family: 'Courier New', monospace; fill: #222; }
        .title { font-size: 28px; font-weight: bold; }
        .subtitle { font-size: 16px; fill: #555; }
        .label { font-size: 14px; font-weight: bold; }
        .pin-label { font-size: 11px; fill: #333; }
        .instruction { font-size: 13px; fill: #d32f2f; font-weight: bold; }
        
        .breadboard { fill: #f5f5dc; stroke: #8b7355; stroke-width: 3; }
        .bb-hole { fill: #333; }
        .bb-rail-plus { fill: #ff6b6b; }
        .bb-rail-minus { fill: #4a4a4a; }
        
        .esp32-board { fill: #1a237e; stroke: #000; stroke-width: 2; }
        .module-pcb { fill: #0d47a1; stroke: #000; stroke-width: 1.5; }
        .sensor-pcb { fill: #1b5e20; stroke: #000; stroke-width: 1.5; }
        
        .resistor-body { fill: #d4af37; stroke: #8b6914; stroke-width: 1; }
        .resistor-band { stroke-width: 2; }
        
        .wire-red { stroke: #e53935; stroke-width: 3; fill: none; stroke-linecap: round; }
        .wire-black { stroke: #212121; stroke-width: 3; fill: none; stroke-linecap: round; }
        .wire-yellow { stroke: #fdd835; stroke-width: 3; fill: none; stroke-linecap: round; }
        .wire-green { stroke: #43a047; stroke-width: 3; fill: none; stroke-linecap: round; }
        .wire-blue { stroke: #1e88e5; stroke-width: 3; fill: none; stroke-linecap: round; }
        .wire-orange { stroke: #ff6f00; stroke-width: 3; fill: none; stroke-linecap: round; }
        .wire-white { stroke: #f5f5f5; stroke-width: 3; fill: none; stroke-linecap: round; stroke: #bdbdbd; }
        
        .pin-dot { fill: #ffd700; stroke: #000; stroke-width: 1; }
        .junction-dot { fill: #ff1744; }
    """))
    
    # Title
    dwg.add(dwg.text("WaterSafe V2 - Breadboard Wiring Guide", 
                     insert=(900, 50), text_anchor="middle", class_="text title"))
    dwg.add(dwg.text("Follow the colored wires to connect each component", 
                     insert=(900, 80), text_anchor="middle", class_="text subtitle"))
    
    # Draw Breadboard
    bb_x, bb_y = 150, 150
    bb_w, bb_h = 1500, 900
    
    # Main breadboard body
    dwg.add(dwg.rect(insert=(bb_x, bb_y), size=(bb_w, bb_h), 
                     class_="breadboard", rx=10, ry=10))
    
    # Power rails (top and bottom)
    rail_height = 30
    
    # Top rails
    # + rail (red)
    dwg.add(dwg.rect(insert=(bb_x + 20, bb_y + 20), size=(bb_w - 40, rail_height), 
                     class_="bb-rail-plus", rx=5))
    dwg.add(dwg.text("+  5V", insert=(bb_x + 40, bb_y + 42), class_="text label", fill="white"))
    
    # - rail (black)
    dwg.add(dwg.rect(insert=(bb_x + 20, bb_y + 60), size=(bb_w - 40, rail_height), 
                     class_="bb-rail-minus", rx=5))
    dwg.add(dwg.text("-  GND", insert=(bb_x + 40, bb_y + 82), class_="text label", fill="white"))
    
    # Bottom rails (mirror)
    dwg.add(dwg.rect(insert=(bb_x + 20, bb_y + bb_h - 90), size=(bb_w - 40, rail_height), 
                     class_="bb-rail-minus", rx=5))
    dwg.add(dwg.text("-  GND", insert=(bb_x + 40, bb_y + bb_h - 68), class_="text label", fill="white"))
    
    dwg.add(dwg.rect(insert=(bb_x + 20, bb_y + bb_h - 50), size=(bb_w - 40, rail_height), 
                     class_="bb-rail-plus", rx=5))
    dwg.add(dwg.text("+  5V", insert=(bb_x + 40, bb_y + bb_h - 28), class_="text label", fill="white"))
    
    # Draw breadboard holes pattern (simplified - just show a few rows)
    def draw_bb_holes(start_x, start_y, rows=5, cols=30):
        hole_spacing = 10
        for r in range(rows):
            for c in range(cols):
                x = start_x + c * hole_spacing
                y = start_y + r * hole_spacing
                dwg.add(dwg.circle(center=(x, y), r=2, class_="bb-hole"))
    
    # Main breadboard area holes
    draw_bb_holes(bb_x + 100, bb_y + 120, rows=25, cols=120)
    
    # Component positions
    esp32_x, esp32_y = bb_x + 250, bb_y + 300
    ads_x, ads_y = bb_x + 800, bb_y + 200
    oled_x, oled_y = bb_x + 1100, bb_y + 200
    
    # Draw ESP32 Board
    esp32_w, esp32_h = 200, 280
    dwg.add(dwg.rect(insert=(esp32_x, esp32_y), size=(esp32_w, esp32_h), 
                     class_="esp32-board", rx=5))
    dwg.add(dwg.text("ESP32", insert=(esp32_x + esp32_w/2, esp32_y + 30), 
                     text_anchor="middle", class_="text label", fill="white", font_size="20px"))
    dwg.add(dwg.text("WROOM-32", insert=(esp32_x + esp32_w/2, esp32_y + 50), 
                     text_anchor="middle", class_="text pin-label", fill="#ccc"))
    
    # USB port
    usb_w, usb_h = 30, 15
    dwg.add(dwg.rect(insert=(esp32_x + esp32_w/2 - usb_w/2, esp32_y - 10), 
                     size=(usb_w, usb_h), fill="#c0c0c0", stroke="#000"))
    dwg.add(dwg.text("USB", insert=(esp32_x + esp32_w/2, esp32_y - 20), 
                     text_anchor="middle", class_="text pin-label"))
    
    # ESP32 pins (left side)
    pin_spacing = 20
    pins_left = [
        ("VIN", esp32_x - 5, esp32_y + 40, "red"),
        ("GND", esp32_x - 5, esp32_y + 60, "black"),
        ("3V3", esp32_x - 5, esp32_y + 80, "orange"),
        ("G4", esp32_x - 5, esp32_y + 140, "yellow"),
    ]
    
    for pin_name, px, py, color in pins_left:
        dwg.add(dwg.circle(center=(px, py), r=4, class_="pin-dot"))
        dwg.add(dwg.text(pin_name, insert=(px - 35, py + 5), 
                        class_="text pin-label", text_anchor="end"))
    
    # ESP32 pins (right side)
    pins_right = [
        ("G21", esp32_x + esp32_w + 5, esp32_y + 240, "blue"),  # SDA
        ("G22", esp32_x + esp32_w + 5, esp32_y + 260, "blue"),  # SCL
    ]
    
    for pin_name, px, py, color in pins_right:
        dwg.add(dwg.circle(center=(px, py), r=4, class_="pin-dot"))
        dwg.add(dwg.text(pin_name, insert=(px + 35, py + 5), 
                        class_="text pin-label", text_anchor="start"))
    
    # Draw ADS1115 Module
    ads_w, ads_h = 120, 100
    dwg.add(dwg.rect(insert=(ads_x, ads_y), size=(ads_w, ads_h), 
                     class_="module-pcb", rx=3))
    dwg.add(dwg.text("ADS1115", insert=(ads_x + ads_w/2, ads_y + 30), 
                     text_anchor="middle", class_="text label", fill="white"))
    dwg.add(dwg.text("16-bit ADC", insert=(ads_x + ads_w/2, ads_y + 45), 
                     text_anchor="middle", class_="text pin-label", fill="#90caf9"))
    
    # ADS1115 pins
    ads_pins = [
        ("VDD", ads_x - 5, ads_y + 20),
        ("GND", ads_x - 5, ads_y + 35),
        ("SCL", ads_x - 5, ads_y + 50),
        ("SDA", ads_x - 5, ads_y + 65),
        ("ADDR", ads_x - 5, ads_y + 80),
        ("A0", ads_x + ads_w + 5, ads_y + 20),
        ("A1", ads_x + ads_w + 5, ads_y + 40),
        ("A2", ads_x + ads_w + 5, ads_y + 60),
    ]
    
    for pin_name, px, py in ads_pins:
        dwg.add(dwg.circle(center=(px, py), r=3, class_="pin-dot"))
        if px < ads_x + ads_w/2:
            dwg.add(dwg.text(pin_name, insert=(px - 25, py + 4), 
                            class_="text pin-label", text_anchor="end"))
        else:
            dwg.add(dwg.text(pin_name, insert=(px + 25, py + 4), 
                            class_="text pin-label", text_anchor="start"))
    
    # Draw OLED Display
    oled_w, oled_h = 100, 80
    dwg.add(dwg.rect(insert=(oled_x, oled_y), size=(oled_w, oled_h), 
                     class_="module-pcb", rx=3))
    # Screen area
    dwg.add(dwg.rect(insert=(oled_x + 10, oled_y + 10), size=(oled_w - 20, 40), 
                     fill="#000", stroke="#333"))
    dwg.add(dwg.text("OLED", insert=(oled_x + oled_w/2, oled_y + 65), 
                     text_anchor="middle", class_="text pin-label", fill="white"))
    
    # OLED pins
    oled_pins = [
        ("VCC", oled_x - 5, oled_y + 15),
        ("GND", oled_x - 5, oled_y + 30),
        ("SCL", oled_x - 5, oled_y + 45),
        ("SDA", oled_x - 5, oled_y + 60),
    ]
    
    for pin_name, px, py in oled_pins:
        dwg.add(dwg.circle(center=(px, py), r=3, class_="pin-dot"))
        dwg.add(dwg.text(pin_name, insert=(px - 25, py + 4), 
                        class_="text pin-label", text_anchor="end"))
    
    # Draw Sensor Modules (off-breadboard)
    sensor_y_start = bb_y + bb_h + 50
    
    def draw_sensor_module(x, y, name, pins_config):
        w, h = 140, 80
        dwg.add(dwg.rect(insert=(x, y), size=(w, h), class_="sensor-pcb", rx=3))
        dwg.add(dwg.text(name, insert=(x + w/2, y + 25), 
                        text_anchor="middle", class_="text label", fill="white"))
        
        pin_positions = []
        for i, (pin_name, color) in enumerate(pins_config):
            px, py = x + 20 + i * 35, y + h + 5
            dwg.add(dwg.circle(center=(px, py), r=3, fill=color, stroke="#000"))
            dwg.add(dwg.text(pin_name, insert=(px, py + 20), 
                            text_anchor="middle", class_="text pin-label"))
            pin_positions.append((px, py))
        
        return pin_positions
    
    # pH Sensor
    ph_pins = draw_sensor_module(bb_x + 100, sensor_y_start, "pH Sensor",
                                 [("VCC", "#e53935"), ("GND", "#212121"), ("OUT", "#43a047")])
    
    # Turbidity Sensor
    turb_pins = draw_sensor_module(bb_x + 400, sensor_y_start, "Turbidity",
                                   [("VCC", "#e53935"), ("GND", "#212121"), ("OUT", "#43a047")])
    
    # TDS Sensor
    tds_pins = draw_sensor_module(bb_x + 700, sensor_y_start, "TDS Sensor",
                                  [("VCC", "#e53935"), ("GND", "#212121"), ("OUT", "#43a047")])
    
    # DS18B20 Temperature Probe
    temp_pins = draw_sensor_module(bb_x + 1000, sensor_y_start, "DS18B20",
                                   [("VCC", "#e53935"), ("GND", "#212121"), ("DATA", "#fdd835")])
    
    # Draw Resistors on breadboard
    def draw_resistor(x, y, value, bands):
        """Draw a resistor with color bands"""
        w, h = 40, 12
        # Body
        dwg.add(dwg.rect(insert=(x, y - h/2), size=(w, h), class_="resistor-body", rx=2))
        # Leads
        dwg.add(dwg.line(start=(x - 10, y), end=(x, y), stroke="#888", stroke_width=2))
        dwg.add(dwg.line(start=(x + w, y), end=(x + w + 10, y), stroke="#888", stroke_width=2))
        # Color bands
        for i, band_color in enumerate(bands):
            band_x = x + 8 + i * 8
            dwg.add(dwg.line(start=(band_x, y - h/2), end=(band_x, y + h/2), 
                           stroke=band_color, class_="resistor-band"))
        # Label
        dwg.add(dwg.text(value, insert=(x + w/2, y - 15), 
                        text_anchor="middle", class_="text pin-label", font_weight="bold"))
        return (x - 10, y), (x + w + 10, y)
    
    # Voltage divider resistors area
    resistor_area_x = bb_x + 600
    resistor_area_y = bb_y + 400
    
    # 10k resistors (brown-black-orange)
    r1_ph = draw_resistor(resistor_area_x, resistor_area_y, "10kΩ", 
                         ["#8b4513", "#000", "#ff8c00"])
    r1_turb = draw_resistor(resistor_area_x, resistor_area_y + 80, "10kΩ", 
                           ["#8b4513", "#000", "#ff8c00"])
    r1_tds = draw_resistor(resistor_area_x, resistor_area_y + 160, "10kΩ", 
                          ["#8b4513", "#000", "#ff8c00"])
    
    # 20k resistors (red-black-orange)
    r2_ph = draw_resistor(resistor_area_x + 80, resistor_area_y + 40, "20kΩ", 
                         ["#ff0000", "#000", "#ff8c00"])
    r2_turb = draw_resistor(resistor_area_x + 80, resistor_area_y + 120, "20kΩ", 
                           ["#ff0000", "#000", "#ff8c00"])
    r2_tds = draw_resistor(resistor_area_x + 80, resistor_area_y + 200, "20kΩ", 
                          ["#ff0000", "#000", "#ff8c00"])
    
    # 4.7k pull-up resistor (yellow-violet-red)
    r_pullup = draw_resistor(esp32_x + 100, esp32_y + 100, "4.7kΩ", 
                            ["#ffff00", "#9400d3", "#ff0000"])
    
    # Helper function to draw wires
    def wire(points, color_class):
        dwg.add(dwg.polyline(points, class_=f"wire-{color_class}"))
    
    # Power connections
    # ESP32 VIN to +5V rail
    wire([(esp32_x - 5, esp32_y + 40), (bb_x + 50, esp32_y + 40), 
          (bb_x + 50, bb_y + 35)], "red")
    
    # ESP32 GND to GND rail
    wire([(esp32_x - 5, esp32_y + 60), (bb_x + 50, esp32_y + 60), 
          (bb_x + 50, bb_y + 75)], "black")
    
    # ESP32 3V3 to ADS VDD
    wire([(esp32_x - 5, esp32_y + 80), (esp32_x - 30, esp32_y + 80),
          (esp32_x - 30, ads_y + 20), (ads_x - 5, ads_y + 20)], "orange")
    
    # ESP32 3V3 to OLED VCC
    wire([(esp32_x - 30, ads_y + 20), (esp32_x - 30, oled_y + 15),
          (oled_x - 5, oled_y + 15)], "orange")
    
    # I2C connections
    # SDA: ESP32 G21 -> OLED SDA -> ADS SDA
    wire([(esp32_x + esp32_w + 5, esp32_y + 240), (esp32_x + esp32_w + 30, esp32_y + 240),
          (esp32_x + esp32_w + 30, oled_y + 60), (oled_x - 5, oled_y + 60)], "blue")
    wire([(esp32_x + esp32_w + 30, oled_y + 60), (esp32_x + esp32_w + 30, ads_y + 65),
          (ads_x - 5, ads_y + 65)], "blue")
    
    # SCL: ESP32 G22 -> OLED SCL -> ADS SCL
    wire([(esp32_x + esp32_w + 5, esp32_y + 260), (esp32_x + esp32_w + 50, esp32_y + 260),
          (esp32_x + esp32_w + 50, oled_y + 45), (oled_x - 5, oled_y + 45)], "blue")
    wire([(esp32_x + esp32_w + 50, oled_y + 45), (esp32_x + esp32_w + 50, ads_y + 50),
          (ads_x - 5, ads_y + 50)], "blue")
    
    # GND connections for modules
    wire([(ads_x - 5, ads_y + 35), (ads_x - 30, ads_y + 35),
          (ads_x - 30, bb_y + 75), (bb_x + 100, bb_y + 75)], "black")
    wire([(oled_x - 5, oled_y + 30), (oled_x - 30, oled_y + 30),
          (oled_x - 30, bb_y + 75), (bb_x + 150, bb_y + 75)], "black")
    
    # ADDR to GND
    wire([(ads_x - 5, ads_y + 80), (ads_x - 30, ads_y + 80),
          (ads_x - 30, bb_y + 75)], "black")
    
    # DS18B20 connections
    # VCC (3V3)
    wire([(temp_pins[0][0], temp_pins[0][1]), (temp_pins[0][0], bb_y + 35),
          (esp32_x - 30, bb_y + 35)], "red")
    
    # GND
    wire([(temp_pins[1][0], temp_pins[1][1]), (temp_pins[1][0], bb_y + 75)], "black")
    
    # DATA to GPIO4 with pull-up
    wire([(temp_pins[2][0], temp_pins[2][1]), (temp_pins[2][0], esp32_y + 140),
          (esp32_x - 5, esp32_y + 140)], "yellow")
    
    # Pull-up resistor connections
    wire([(r_pullup[0][0], r_pullup[0][1]), (esp32_x - 30, r_pullup[0][1])], "orange")  # To 3V3
    wire([(r_pullup[1][0], r_pullup[1][1]), (esp32_x - 5, esp32_y + 140)], "yellow")  # To DATA
    
    # Sensor power connections
    for sensor_pins in [ph_pins, turb_pins, tds_pins]:
        # VCC to +5V
        wire([(sensor_pins[0][0], sensor_pins[0][1]), 
              (sensor_pins[0][0], bb_y + bb_h - 35)], "red")
        # GND to GND
        wire([(sensor_pins[1][0], sensor_pins[1][1]), 
              (sensor_pins[1][0], bb_y + bb_h - 65)], "black")
    
    # Voltage divider connections (simplified representation)
    # pH sensor -> divider -> A0
    wire([(ph_pins[2][0], ph_pins[2][1]), (ph_pins[2][0], resistor_area_y),
          (r1_ph[0][0], r1_ph[0][1])], "green")
    wire([(r1_ph[1][0], r1_ph[1][1]), (r2_ph[0][0], r2_ph[0][1])], "green")
    wire([(r2_ph[0][0], r2_ph[0][1]), (ads_x + ads_w + 5, ads_y + 20)], "green")
    wire([(r2_ph[1][0], r2_ph[1][1]), (r2_ph[1][0], bb_y + 75)], "black")
    
    # Add instruction boxes
    inst_x = bb_x + bb_w + 50
    inst_y = bb_y + 100
    
    instructions = [
        "STEP-BY-STEP WIRING:",
        "",
        "1. Place ESP32 across center",
        "   of breadboard",
        "",
        "2. Connect power rails:",
        "   • VIN → +5V rail (RED)",
        "   • GND → GND rail (BLACK)",
        "   • 3V3 → ADS & OLED (ORANGE)",
        "",
        "3. Connect I2C devices:",
        "   • G21 (SDA) → BLUE wires",
        "   • G22 (SCL) → BLUE wires",
        "",
        "4. Install resistors:",
        "   • 3× 10kΩ (brown-black-orange)",
        "   • 3× 20kΩ (red-black-orange)",
        "   • 1× 4.7kΩ (yellow-violet-red)",
        "",
        "5. Connect sensors through",
        "   voltage dividers to A0, A1, A2",
        "",
        "6. Connect DS18B20:",
        "   • DATA → G4 (YELLOW)",
        "   • Add 4.7kΩ pull-up",
    ]
    
    for i, inst in enumerate(instructions):
        dwg.add(dwg.text(inst, insert=(inst_x, inst_y + i * 20), 
                        class_="text instruction" if i == 0 else "text pin-label"))
    
    # Legend
    legend_y = bb_y + 600
    dwg.add(dwg.text("WIRE COLOR LEGEND:", insert=(inst_x, legend_y), 
                     class_="text label"))
    
    colors = [
        ("RED", "wire-red", "5V Power"),
        ("BLACK", "wire-black", "Ground"),
        ("ORANGE", "wire-orange", "3.3V Power"),
        ("BLUE", "wire-blue", "I2C (SDA/SCL)"),
        ("GREEN", "wire-green", "Analog Signals"),
        ("YELLOW", "wire-yellow", "DS18B20 Data"),
    ]
    
    for i, (name, wire_class, desc) in enumerate(colors):
        y = legend_y + 30 + i * 25
        dwg.add(dwg.line(start=(inst_x, y), end=(inst_x + 40, y), class_=wire_class))
        dwg.add(dwg.text(f"{name}: {desc}", insert=(inst_x + 50, y + 5), 
                        class_="text pin-label"))
    
    dwg.save()
    print("✓ Breadboard wiring diagram created: breadboard_wiring_guide.svg")

if __name__ == '__main__':
    try:
        create_breadboard_diagram()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
