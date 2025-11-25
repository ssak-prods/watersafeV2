# Mechanical Specification & Enclosure Design

**Project:** WaterSafe V2
**Component:** Housing & Sensor Interface

## 1. Design Philosophy: "Pipe-First"
The system must survive in a utility environment (pump rooms, tanker outlets). It cannot be a loose breadboard. We use a **Bypass Loop** architecture for the sensors to ensure modularity, easy cleaning, and pressure protection.

## 2. The Enclosure (IP65 Box)
**Target**: ABS Plastic Junction Box with Clear Lid (for LED visibility) or Solid Lid.
**Dimensions**: Approx 150mm x 100mm x 50mm (min) to fit ESP32 + Breadboard/PCB.

### Port Map:
-   **Bottom Face**:
    -   1x PG9 Gland: Power Cable (USB or DC Jack).
    -   1x PG7 Gland: pH Probe Cable (BNC).
    -   1x PG7 Gland: Turbidity Sensor Cable.
    -   1x PG7 Gland: TDS Sensor Cable.
    -   1x PG7 Gland: Temp Probe Cable.
-   **Sides**:
    -   Mounting Flanges for wall/pipe screws.
    -   External Status LED (Red/Green) mounted on lid (Optional).

## 3. The Flow Cell (Bypass Loop) Design
Direct insertion into a high-pressure 2-inch pipe is dangerous and hard to maintain. We tap off the main line into a smaller sampling loop.

**Structure**:
1.  **Inlet**: 1/4" or 1/2" off-take from Main Pipe (using a T-connector + Ball Valve).
2.  **Chamber**: A sequence of PVC T-joints or a dedicated acrylic flow cell.
    -   **Pos 1**: Turbidity Sensor (Needs darkness/opacity, so PVC is good).
    -   **Pos 2**: pH Probe (Vertical mounting preferred).
    -   **Pos 3**: TDS Probe.
    -   **Pos 4**: Temp Probe.
3.  **Outlet**: Return to line (downstream of a restriction) or drain to waste.

**Crucial Deployment Details**:
-   **Velocity**: Flow must be slow enough to avoid cavitation bubbles (which ruin turbidity readings) but fast enough to ensure fresh samples.
-   **Orientation**: pH bulb must stay wet. Mount pH probe vertically or at >45 degree angle. Never upside down.
-   **Light Shielding**: Turbidity sensor is optical; ambient light affects it. The flow cell segment for turbidity should be opaque (black tape or grey PVC).

## 4. Mounting Strategy
-   **Clamps**: Use "U-Clamps" or Zip-ties to secure the Enclosure to the PVC pipe loop.
-   **Vibration**: If on a tanker, mount the box on rubber washers to dampen high-frequency engine vibration which can loosen wires.

## 5. Maintenance Access
-   Box lid should be screw-down but accessible.
-   Probes must be removable from the T-joints for monthly cleaning in distilled water.
