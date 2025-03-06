import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupScene } from './scene.js';
import { createBreadboard } from './components/Breadboard.js';
import { createESP32 } from './components/ESP32.js';
import { createADS1115 } from './components/ADS1115.js';
import { createOLED } from './components/OLED.js';
import { createPHSensor } from './components/PHSensor.js';
import { createTurbiditySensor } from './components/Turbidity.js';
import { createTDSSensor } from './components/TDSSensor.js';
import { createDS18B20 } from './components/DS18B20.js';
import { createResistor } from './components/Resistor.js';
import { WireManager } from './wiring/WireManager.js';
import { WaterBasin } from './water/WaterBasin.js';
import { setupInteractions } from './interaction/DragControls.js';
import { ZoneIndicator } from './interaction/ZoneIndicator.js';
import gsap from 'gsap';

// Global state
const state = {
    waterQuality: {
        ph: 7.0,
        turbidity: 0,
        tds: 250,
        temperature: 25.0
    },
    viewOptions: {
        showWires: true,
        showLabels: true,
        xrayMode: false,
        showWater: true
    },
    components: {},
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    waterBasin: null,
    wireManager: null,
    zoneIndicator: null
};

// Loading progress
let loadingProgress = 0;
const updateLoading = (progress, status) => {
    loadingProgress = progress;
    document.getElementById('loading-bar').style.width = `${progress}%`;
    document.getElementById('loading-status').textContent = status;
};

import { Cable } from './utils/Cable.js';

// Initialize application
async function init() {
    updateLoading(10, 'Setting up Lab Bench...');

    // Create scene, camera, renderer
    const container = document.getElementById('app');
    const { scene, camera, renderer, controls } = setupScene(container);

    state.scene = scene;
    state.camera = camera;
    state.renderer = renderer;
    state.controls = controls;

    // Camera Info
    // Set a nice angled view for the bench
    camera.position.set(15, 12, 15);
    camera.lookAt(0, 0, 0);

    updateLoading(20, 'Placing electronics on bench...');

    // --- 1. STATIC ELECTRONICS (Back of Bench) ---
    const electronicsOffset = -5; // Z position for electronics row

    // Breadboard
    const breadboard = createBreadboard();
    breadboard.position.set(0, 0.2, electronicsOffset);
    scene.add(breadboard);
    state.components.breadboard = breadboard;

    // ESP32
    const esp32 = createESP32();
    esp32.position.set(-6, 0.8, electronicsOffset);
    scene.add(esp32);
    state.components.esp32 = esp32;

    // ADS1115
    const ads1115 = createADS1115();
    ads1115.position.set(4, 0.6, electronicsOffset + 1);
    scene.add(ads1115);
    state.components.ads1115 = ads1115;

    // OLED
    const oled = createOLED();
    oled.position.set(4, 0.6, electronicsOffset - 1);
    scene.add(oled);
    state.components.oled = oled;

    // DS18B20 (Temp) - This one is simple, usually just a probe wire.
    // We'll treat the resistor/connector as the "Electronics"
    const ds18b20 = createDS18B20();
    // DS18B20 helper returns a single group. We might need to "fake" separate it or just position it.
    // For now, place it near the breadboard.
    ds18b20.position.set(-8, 1.0, electronicsOffset);
    scene.add(ds18b20);
    state.components.ds18b20 = ds18b20;


    updateLoading(40, 'Assembling Sensors & Probes...');

    // --- 2. SENSORS (Split: Electronics + Probes) ---
    // We will store probes in a list to animate them later.
    state.probes = [];
    state.cables = [];

    // Helper to setup sensor
    const setupSensor = (createFn, xPos, label) => {
        const { electronics, probe } = createFn();

        // Place Electronics
        electronics.position.set(xPos, 0.2, electronicsOffset + 3); // Front row of electronics
        scene.add(electronics);

        // Place Probe (Initial "Rest" Position)
        // Resting on a virtual rack or just on the table
        probe.position.set(xPos, 0.5, 0); // Middle of table, resting
        probe.rotation.x = -Math.PI / 2; // Lying flat
        scene.add(probe);

        // Create Dynamic Cable
        const cable = new Cable(scene, 0x111111);
        state.cables.push({
            mesh: cable,
            source: electronics,
            target: probe,
            sourceOffset: electronics.userData.connectorPosition,
            targetOffset: probe.userData.cableConnectionPoint
        });

        return { electronics, probe };
    };

    // pH Sensor
    const ph = setupSensor(createPHSensor, 8, 'pH');
    state.components.phSensor = ph.electronics;
    state.probes.push(ph.probe);

    // Turbidity Sensor
    const turbidity = setupSensor(createTurbiditySensor, 11, 'Turbidity');
    state.components.turbiditySensor = turbidity.electronics;
    state.probes.push(turbidity.probe);

    // TDS Sensor
    const tds = setupSensor(createTDSSensor, 14, 'TDS');
    state.components.tdsSensor = tds.electronics;
    state.probes.push(tds.probe);


    updateLoading(80, 'Preparing Water Station...');

    // --- 3. WATER BASIN (The Movable Container) ---
    state.waterBasin = new WaterBasin(scene, state.waterQuality);
    const basinGroup = state.waterBasin.basinGroup;

    // Start position: Off-screen to the left
    basinGroup.position.set(-30, 0, 5);
    state.basinGroup = basinGroup; // Save ref for animation


    updateLoading(90, 'Wiring interactions...');

    state.zoneIndicator = new ZoneIndicator(scene, state.components);
    setupInteractions(state); // Move existing interactions setup here

    updateLoading(100, 'Ready!');

    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
        startAnimation();
    }, 500);
}

// Global Animation State
let currentAnim = null;

function runTestSequence(preset) {
    if (currentAnim && currentAnim.isActive()) return; // Don't interrupt if running

    // GSAP Timeline
    const tl = gsap.timeline();
    currentAnim = tl;

    const basin = state.basinGroup;
    const probes = state.probes;

    // 1. Reset (if needed) - Retract probes, Move old basin away
    // For simplicity, let's assume we "swap" the water instantly if it's already there, 
    // or we move it out and back in. Let's move out and back in.

    // Lift probes if they are down
    probes.forEach(probe => {
        tl.to(probe.position, { y: 2.0, duration: 0.5, ease: 'power2.out' }, 'retract');
        tl.to(probe.rotation, { x: -Math.PI / 2, duration: 0.5 }, 'retract');
    });

    // Move Basin Away (to right)
    tl.to(basin.position, { x: 30, duration: 1.5, ease: 'power2.in' }, 'basinOut');

    // Reset Basin to Left (instantly, hidden)
    tl.call(() => {
        basin.position.set(-30, 0, 5);
        state.waterBasin.updateQuality(preset); // Apply new preset stats
    });

    // Move Basin In (from Left to Center)
    tl.to(basin.position, { x: 0, duration: 1.5, ease: 'power2.out' }, 'basinIn');

    // Dip Sensors
    probes.forEach((probe, i) => {
        // Staggered entry
        const label = `dip-${i}`;

        // Move to "Hover" position above water
        // Water is at approx z=3 to z=7. Center z=5.
        // Sensors are currently at x=8, 11, 14.
        // We need to move them to x ~ 0 +/- something

        const targetX = (i - 1) * 3; // -3, 0, 3

        tl.to(probe.position, { x: targetX, z: 5, y: 8, duration: 1.0, ease: 'power1.out' }, label);
        tl.to(probe.rotation, { x: 0, duration: 1.0 }, label); // Vertical

        // Dip into water
        // Safety Height check: We want the "Limit Line" to be just above water.
        // Water Level is y=8 (from WaterBasin.js old code) -> Let's check water level.
        // Actually WaterBasin creates water at y=10 now.
        // probe.userData.limitLineY is local Y of the line.
        // We want (ProbeWorldY + limitLineY) > WaterLevel.
        // Safe dip: ProbeWorldY = WaterLevel - limitLineY + 0.5 (Safety margin)

        const waterHeight = 10;
        const limitY = probe.userData.limitLineY || 1.0;
        const dipY = waterHeight - limitY + 0.2; // Just above line

        tl.to(probe.position, { y: dipY, duration: 0.8, ease: 'bounce.out' }, `${label}-down`);
    });
}


// Animation loop
function startAnimation() {
    function animate() {
        requestAnimationFrame(animate);

        // Update controls
        state.controls.update();

        // Update water simulation
        if (state.waterBasin && state.viewOptions.showWater) {
            state.waterBasin.update();
        }

        // Update zone indicators
        if (state.zoneIndicator) {
            state.zoneIndicator.update(state.camera);
        }

        // Update dynamic cables
        if (state.cables) {
            state.cables.forEach(cable => {
                // Get world positions
                const sourcePos = new THREE.Vector3();
                const targetPos = new THREE.Vector3();

                cable.source.localToWorld(sourcePos.copy(cable.sourceOffset));
                cable.target.localToWorld(targetPos.copy(cable.targetOffset));

                cable.mesh.update(sourcePos, targetPos);
            });
        }

        // Render scene
        state.renderer.render(state.scene, state.camera);
    }
    animate();
}

// Setup UI event listeners
function setupUI() {
    // Water quality sliders
    const sliders = [
        { id: 'ph', key: 'ph', min: 0, max: 14 },
        { id: 'turbidity', key: 'turbidity', min: 0, max: 1000 },
        { id: 'tds', key: 'tds', min: 0, max: 1000 },
        { id: 'temp', key: 'temperature', min: 0, max: 75 }
    ];

    sliders.forEach(({ id, key, min, max }) => {
        const slider = document.getElementById(`${id}-slider`);
        const valueDisplay = document.getElementById(`${id}-value`);
        const fill = document.getElementById(`${id}-fill`);
        const readout = document.getElementById(`readout-${id}`);

        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            state.waterQuality[key] = value;

            // Update displays
            valueDisplay.textContent = value.toFixed(key === 'ph' || key === 'temperature' ? 1 : 0);
            fill.style.width = `${((value - min) / (max - min)) * 100}%`;

            // Update readout panel
            if (readout) {
                let displayValue = value.toFixed(key === 'ph' || key === 'temperature' ? 2 : 0);
                if (key === 'turbidity') displayValue += ' NTU';
                if (key === 'tds') displayValue += ' ppm';
                if (key === 'temperature') displayValue += '°C';
                readout.textContent = displayValue;

                // Update status color
                updateReadoutStatus(readout, key, value);
            }

            // Update water appearance
            if (state.waterBasin) {
                state.waterBasin.updateQuality(state.waterQuality);
            }
        });
    });

    // Water presets
    const presets = {
        pure: { ph: 7.0, turbidity: 0, tds: 10, temperature: 20 },
        tap: { ph: 7.2, turbidity: 5, tds: 250, temperature: 25 },
        muddy: { ph: 6.8, turbidity: 850, tds: 450, temperature: 22 },
        acidic: { ph: 4.5, turbidity: 20, tds: 180, temperature: 25 },
        alkaline: { ph: 9.5, turbidity: 10, tds: 320, temperature: 25 },
        contaminated: { ph: 5.2, turbidity: 950, tds: 780, temperature: 28 }
    };

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = presets[btn.dataset.preset];
            if (preset) {
                // animateToPreset(preset); // Old logic
                runTestSequence(preset); // New Lab Bench Logic
            }
        });
    });

    // Toggle buttons
    const toggles = [
        { id: 'toggle-wires', key: 'showWires' },
        { id: 'toggle-labels', key: 'showLabels' },
        { id: 'toggle-xray', key: 'xrayMode' },
        { id: 'toggle-water', key: 'showWater' }
    ];

    toggles.forEach(({ id, key }) => {
        const btn = document.getElementById(id);
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            state.viewOptions[key] = btn.classList.contains('active');

            // Apply view changes
            applyViewOptions();
        });
    });

    // Zone legend hover
    document.querySelectorAll('.zone-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            const zone = item.dataset.zone;
            if (state.zoneIndicator) {
                state.zoneIndicator.highlightZone(zone);
            }
        });

        item.addEventListener('mouseleave', () => {
            if (state.zoneIndicator) {
                state.zoneIndicator.clearHighlight();
            }
        });
    });
}

function animateToPreset(preset) {
    Object.keys(preset).forEach(key => {
        const slider = document.getElementById(`${key === 'temperature' ? 'temp' : key}-slider`);
        if (slider) {
            gsap.to(state.waterQuality, {
                [key]: preset[key],
                duration: 1.5,
                ease: 'power2.inOut',
                onUpdate: () => {
                    slider.value = state.waterQuality[key];
                    slider.dispatchEvent(new Event('input'));
                }
            });
        }
    });
}

function updateReadoutStatus(element, key, value) {
    element.classList.remove('normal', 'warning', 'danger');

    let status = 'normal';
    if (key === 'ph') {
        if (value < 6.5 || value > 8.5) status = 'warning';
        if (value < 5.5 || value > 9.5) status = 'danger';
    } else if (key === 'turbidity') {
        if (value > 5) status = 'warning';
        if (value > 50) status = 'danger';
    } else if (key === 'tds') {
        if (value > 500) status = 'warning';
        if (value > 800) status = 'danger';
    } else if (key === 'temperature') {
        if (value < 10 || value > 35) status = 'warning';
        if (value < 5 || value > 45) status = 'danger';
    }

    element.classList.add(status);

    // Update overall status
    const statusElement = document.getElementById('readout-status');
    if (statusElement) {
        const allReadouts = [
            document.getElementById('readout-ph'),
            document.getElementById('readout-turbidity'),
            document.getElementById('readout-tds'),
            document.getElementById('readout-temp')
        ];

        const hasDanger = allReadouts.some(el => el.classList.contains('danger'));
        const hasWarning = allReadouts.some(el => el.classList.contains('warning'));

        statusElement.classList.remove('normal', 'warning', 'danger');
        if (hasDanger) {
            statusElement.textContent = 'DANGER';
            statusElement.classList.add('danger');
        } else if (hasWarning) {
            statusElement.textContent = 'WARNING';
            statusElement.classList.add('warning');
        } else {
            statusElement.textContent = 'NORMAL';
            statusElement.classList.add('normal');
        }
    }
}

function applyViewOptions() {
    // Toggle wires visibility
    if (state.wireManager) {
        state.wireManager.setVisible(state.viewOptions.showWires);
    }

    // Toggle water visibility
    if (state.waterBasin) {
        state.waterBasin.setVisible(state.viewOptions.showWater);
    }

    // Toggle X-ray mode
    if (state.viewOptions.xrayMode) {
        Object.values(state.components).forEach(component => {
            component.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.transparent = true;
                    child.material.opacity = 0.3;
                    child.material.wireframe = true;
                }
            });
        });
    } else {
        Object.values(state.components).forEach(component => {
            component.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.transparent = false;
                    child.material.opacity = 1.0;
                    child.material.wireframe = false;
                }
            });
        });
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    if (state.camera && state.renderer) {
        state.camera.aspect = window.innerWidth / window.innerHeight;
        state.camera.updateProjectionMatrix();
        state.renderer.setSize(window.innerWidth, window.innerHeight);
    }
});

// Start application
setupUI();
init();
