
import svgwrite
from svgwrite import cm, mm

def create_diagram():
    dwg = svgwrite.Drawing('d:/watersafeV2/hardware/improved_wiring_diagram.svg', size=('1600px', '1000px'), profile='full')
    
    # Styles
    # Note: svgwrite doesn't support <style> blocks in 'tiny' profile as easily, using inline styles or defs
    dwg.defs.add(dwg.style("""
        .text { font-family: Arial, sans-serif; fill: #333; }
        .title { font-size: 24px; font-weight: bold; }
        .label { font-size: 14px; }
        .pin-label { font-size: 12px; fill: #555; }
        .component-box { fill: #f8f9fa; stroke: #333; stroke-width: 2; }
        .module-box { fill: #e3f2fd; stroke: #1565c0; stroke-width: 2; }
        .sensor-box { fill: #e8f5e9; stroke: #2e7d32; stroke-width: 2; }
        .wire-5v { stroke: #d32f2f; stroke-width: 2; fill: none; }
        .wire-3v3 { stroke: #f57c00; stroke-width: 2; fill: none; }
        .wire-gnd { stroke: #212121; stroke-width: 2; fill: none; }
        .wire-i2c { stroke: #1976d2; stroke-width: 2; fill: none; }
        .wire-signal { stroke: #388e3c; stroke-width: 2; fill: none; }
        .wire-bus { stroke: #666; stroke-width: 4; stroke-opacity: 0.2; fill: none; }
        .conn-dot { fill: #000; }
    """))

    # Helpers
    def draw_component(x, y, w, h, title, subtitle="", type="module"):
        cls = "module-box"
        if type == "sensor": cls = "sensor-box"
        if type == "mcu": cls = "component-box"
        
        dwg.add(dwg.rect(insert=(x, y), size=(w, h), class_=cls, rx=5, ry=5))
        dwg.add(dwg.text(title, insert=(x + w/2, y + 25), text_anchor="middle", class_="text title", font_size="16px"))
        if subtitle:
            dwg.add(dwg.text(subtitle, insert=(x + w/2, y + 45), text_anchor="middle", class_="text label"))
        return (x, y, w, h)

    def draw_pin(comp_rect, side, offset, label, color="black"):
        # side: 'left', 'right', 'top', 'bottom'
        x, y, w, h = comp_rect
        px, py = 0, 0
        if side == 'left':
            px, py = x, y + offset
            dwg.add(dwg.text(label, insert=(px + 5, py + 4), class_="text pin-label", text_anchor="start"))
        elif side == 'right':
            px, py = x + w, y + offset
            dwg.add(dwg.text(label, insert=(px - 5, py + 4), class_="text pin-label", text_anchor="end"))
        elif side == 'top':
            px, py = x + offset, y
        
        dwg.add(dwg.circle(center=(px, py), r=3, fill=color, stroke="none"))
        return (px, py)

    def draw_wire(points, type="signal"):
        cls = f"wire-{type}"
        dwg.add(dwg.polyline(points, class_=cls))

    def draw_resistor(x, y, label=""):
        # Simple zig-zag
        path = f"M {x},{y} L {x+5},{y-3} L {x+10},{y+3} L {x+15},{y-3} L {x+20},{y+3} L {x+25},{y}"
        dwg.add(dwg.path(d=path, stroke="#333", fill="none", stroke_width=2))
        if label:
            dwg.add(dwg.text(label, insert=(x+12, y-10), text_anchor="middle", class_="text pin-label"))
        return (x, y, x+25, y) # start, end

    # --- LAYOUT ---
    
    # Title
    dwg.add(dwg.text("WaterSafe V2 - Corrected Wiring Diagram", insert=(800, 40), text_anchor="middle", class_="text title"))
    dwg.add(dwg.text("Includes: OLED Display, ADS1115 (3.3V Logic Safe), Corrected DS18B20 Power", insert=(800, 70), text_anchor="middle", class_="text label"))

    # Power Rails Visual Guide
    dwg.add(dwg.text("5V Rail", insert=(50, 100), class_="text label", fill="#d32f2f"))
    dwg.add(dwg.line(start=(100, 95), end=(1550, 95), class_="wire-5v"))
    
    dwg.add(dwg.text("GND Rail", insert=(50, 950), class_="text label", fill="#212121"))
    dwg.add(dwg.line(start=(100, 945), end=(1550, 945), class_="wire-gnd"))

    # 1. ESP32 (Center Left)
    esp = draw_component(200, 300, 200, 300, "ESP32", "DevKit V1", "mcu")
    
    # Pins
    p_vin = draw_pin(esp, 'left', 50, "VIN (5V)")
    p_gnd_esp = draw_pin(esp, 'left', 250, "GND")
    p_3v3 = draw_pin(esp, 'left', 80, "3V3 Out")
    
    p_sda = draw_pin(esp, 'right', 230, "G21 (SDA)")
    p_scl = draw_pin(esp, 'right', 250, "G22 (SCL)")
    p_g4 = draw_pin(esp, 'right', 100, "G4 (Temp)")

    # Connect ESP Power
    draw_wire([(p_vin[0], p_vin[1]), (100, p_vin[1]), (100, 95)], "5v")
    draw_wire([(p_gnd_esp[0], p_gnd_esp[1]), (100, p_gnd_esp[1]), (100, 945)], "gnd")

    # 2. Logic Level Bus (3.3V)
    # Create a 3.3V rail below the 5V rail for local logic components
    dwg.add(dwg.line(start=(300, 200), end=(900, 200), class_="wire-3v3")) 
    dwg.add(dwg.text("3.3V Logic Rail", insert=(310, 190), class_="text label", fill="#f57c00"))
    # Connect ESP 3V3 to rail
    draw_wire([(p_3v3[0], p_3v3[1]), (p_3v3[0]-20, p_3v3[1]), (p_3v3[0]-20, 200), (300, 200)], "3v3")

    # 3. I2C Devices (Middle)
    
    # 3a. OLED Display
    oled = draw_component(500, 450, 150, 120, "OLED Display", "SSD1306 (0x3C)")
    p_oled_vcc = draw_pin(oled, 'left', 30, "VCC")
    p_oled_gnd = draw_pin(oled, 'left', 50, "GND")
    p_oled_scl = draw_pin(oled, 'left', 70, "SCL")
    p_oled_sda = draw_pin(oled, 'left', 90, "SDA")

    # OLED Power
    draw_wire([(p_oled_vcc[0], p_oled_vcc[1]), (480, p_oled_vcc[1]), (480, 200)], "3v3") # To 3.3V rail
    draw_wire([(p_oled_gnd[0], p_oled_gnd[1]), (480, p_oled_gnd[1]), (480, 945)], "gnd")

    # 3b. ADS1115
    ads = draw_component(700, 450, 150, 180, "ADS1115 ADC", "Address: 0x48")
    p_ads_vcc = draw_pin(ads, 'left', 30, "VDD")
    p_ads_gnd = draw_pin(ads, 'left', 50, "GND")
    p_ads_addr = draw_pin(ads, 'left', 70, "ADDR")
    p_ads_scl = draw_pin(ads, 'left', 90, "SCL")
    p_ads_sda = draw_pin(ads, 'left', 110, "SDA")
    
    p_ads_a0 = draw_pin(ads, 'right', 40, "A0 (pH)")
    p_ads_a1 = draw_pin(ads, 'right', 80, "A1 (Turb)")
    p_ads_a2 = draw_pin(ads, 'right', 120, "A2 (TDS)")

    # ADS Power
    draw_wire([(p_ads_vcc[0], p_ads_vcc[1]), (680, p_ads_vcc[1]), (680, 200)], "3v3") # To 3.3V rail
    draw_wire([(p_ads_gnd[0], p_ads_gnd[1]), (680, p_ads_gnd[1]), (680, 945)], "gnd")
    # ADS Addr -> GND
    draw_wire([(p_ads_addr[0], p_ads_addr[1]), (660, p_ads_addr[1]), (660, 945)], "gnd")

    # I2C Bus wires (Daisy chain)
    # ESP -> OLED -> ADS
    # SCL
    draw_wire([(p_scl[0], p_scl[1]), (460, p_scl[1]), (460, p_oled_scl[1]), (p_oled_scl[0], p_oled_scl[1])], "i2c")
    draw_wire([(p_oled_scl[0], p_oled_scl[1]), (460, p_oled_scl[1]), (660, p_ads_scl[1]), (p_ads_scl[0], p_ads_scl[1])], "i2c")
    # SDA
    draw_wire([(p_sda[0], p_sda[1]), (440, p_sda[1]), (440, p_oled_sda[1]), (p_oled_sda[0], p_oled_sda[1])], "i2c")
    draw_wire([(p_oled_sda[0], p_oled_sda[1]), (440, p_oled_sda[1]), (640, p_ads_sda[1]), (p_ads_sda[0], p_ads_sda[1])], "i2c")

    # 4. Sensors (Right Side)
    
    # Helper for sensor
    def draw_sensor_block(y_start, name, label_color="black"):
        s = draw_component(1200, y_start, 150, 100, name, "", "sensor")
        v = draw_pin(s, 'left', 30, "VCC")
        g = draw_pin(s, 'left', 50, "GND")
        o = draw_pin(s, 'left', 70, "Analog Out")
        
        # Power
        draw_wire([(v[0], v[1]), (1180, v[1]), (1180, 95)], "5v")
        draw_wire([(g[0], g[1]), (1180, g[1]), (1180, 945)], "gnd")
        
        return o

    # pH Sensor
    ph_out = draw_sensor_block(250, "pH Sensor")
    # Turb Sensor
    turb_out = draw_sensor_block(450, "Turbidity")
    # TDS Sensor
    tds_out = draw_sensor_block(650, "TDS Sensor")

    # Voltage Dividers & Connections to ADC
    # Divider logic: Sensor Out (5V) -> [R1 10k] -> ADC Pin -> [R2 20k] -> GND
    
    def draw_divider(sensor_out, adc_in_pin, y_level):
        # Schematic representation:
        # Sig ------[R1]----.---> ADC
        #                   |
        #                  [R2]
        #                   |
        #                  GND
        
        # Route from sensor
        draw_wire([(sensor_out[0], sensor_out[1]), (1100, sensor_out[1]), (1100, y_level)], "signal")
        
        # R1
        draw_resistor(1050, y_level, "10k")
        draw_wire([(1100, y_level), (1075, y_level)], "signal")
        
        # Junction
        jx, jy = 1040, y_level
        draw_wire([(1050, y_level), (jx, jy)], "signal")
        dwg.add(dwg.circle(center=(jx, jy), r=3, fill="black"))
        
        # To ADC
        draw_wire([(jx, jy), (adc_in_pin[0]+20, jy), (adc_in_pin[0]+20, adc_in_pin[1]), (adc_in_pin[0], adc_in_pin[1])], "signal")
        
        # R2 to GND
        draw_wire([(jx, jy), (jx, jy+20)], "signal")
        draw_resistor(jx-12, jy+20, "20k") # Vertical resistor visual hack (drawn horizontal but rotated? No, just draw lines)
        # Manually draw vertical resistor
        # zig zag down
        rx = jx
        ry = jy + 20
        path = f"M {rx},{ry} L {rx-3},{ry+5} L {rx+3},{ry+10} L {rx-3},{ry+15} L {rx+3},{ry+20} L {rx},{ry+25}"
        dwg.add(dwg.path(d=path, stroke="#333", fill="none", stroke_width=2))
        dwg.add(dwg.text("20k", insert=(rx+10, ry+15), class_="text pin-label"))
        
        # To GND Rail
        draw_wire([(rx, ry+25), (rx, 945)], "gnd")

    draw_divider(ph_out, p_ads_a0, 300)
    draw_divider(turb_out, p_ads_a1, 500)
    draw_divider(tds_out, p_ads_a2, 700)

    # 5. DS18B20 Temp Sensor
    temp = draw_component(900, 800, 150, 100, "DS18B20", "Temp Probe", "sensor")
    t_vdd = draw_pin(temp, 'left', 30, "VDD")
    t_dat = draw_pin(temp, 'left', 50, "DATA")
    t_gnd = draw_pin(temp, 'left', 70, "GND")

    # Connect Power (3.3V SAFE choice for direct GPIO connection)
    # Using 3.3V rail for DS18B20 so we don't need level shifting on data line
    draw_wire([(t_vdd[0], t_vdd[1]), (880, t_vdd[1]), (880, 200)], "3v3") 
    draw_wire([(t_gnd[0], t_gnd[1]), (880, t_gnd[1]), (880, 945)], "gnd")

    # Data & Pullup
    # Data goes to ESP GPIO 4
    # Pullup goes between Data and VDD (3.3V)
    
    # Route Data
    draw_wire([(t_dat[0], t_dat[1]), (400, t_dat[1]), (400, p_g4[1]), (p_g4[0], p_g4[1])], "signal")
    
    # Pullup Resistor
    # Located near the sensor or MCU. Let's place it near the wire path.
    # Tap into Data Line at (850, t_dat[1])
    # Tap into 3.3V line at (850, 200) ? Far away.
    # Easier: Pullup between local VDD and Data pins
    
    px, py = 850, t_dat[1] # On data line
    vx, vy = 850, t_vdd[1] # On VDD line (extended)
    
    # Extend VDD wire
    draw_wire([(t_vdd[0], t_vdd[1]), (vx, vy)], "3v3")
    draw_wire([(t_dat[0], t_dat[1]), (px, py)], "signal")
    
    # Resistor between vx,vy and px,py
    dwg.add(dwg.line(start=(vx, vy), end=(vx, vy+15), stroke="#333", stroke_width=2))
    # Resistor body
    res_path = f"M {vx},{vy+15} L {vx-3},{vy+20} L {vx+3},{vy+25} L {vx-3},{vy+30} L {vx+3},{vy+35} L {vx},{vy+40}"
    dwg.add(dwg.path(d=res_path, stroke="#333", fill="none", stroke_width=2))
    dwg.add(dwg.line(start=(vx, vy+40), end=(px, py), stroke="#333", stroke_width=2))
    
    dwg.add(dwg.text("4.7k Pullup", insert=(vx+10, vy+30), class_="text pin-label"))
    dwg.add(dwg.circle(center=(px, py), r=3, fill="black")) # Junction dot on Data
    dwg.add(dwg.circle(center=(vx, vy), r=3, fill="black")) # Junction dot on VDD

    dwg.save()

if __name__ == '__main__':
    try:
        create_diagram()
        print("Diagram created successfully.")
    except Exception as e:
        print(f"Error: {e}")
