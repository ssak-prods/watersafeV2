import * as THREE from 'three';

export function createESP32() {
    const group = new THREE.Group();
    group.userData = {
        id: 'esp32',
        name: 'ESP32-WROOM-32 DevKit',
        description: '30-pin development board with WiFi/Bluetooth. Runs main firmware, reads sensors via I2C (GPIO 21/22) and OneWire (GPIO 4).',
        zone: 'danger',
        waterproof: false,
        pins: {
            gpio21: new THREE.Vector3(-1.2, -0.4, -1.27),
            gpio22: new THREE.Vector3(-1.2, -0.4, -0.916),
            gpio4: new THREE.Vector3(-1.2, -0.4, 1.062),
            vin: new THREE.Vector3(-1.2, -0.4, 2.654),
            gnd: new THREE.Vector3(-1.2, -0.4, -2.654)
        }
    };

    // PCB - Blue FR4 substrate
    const pcbGeo = new THREE.BoxGeometry(2.8, 0.16, 5.5);
    const pcbMat = new THREE.MeshStandardMaterial({
        color: 0x1a4a8a,
        roughness: 0.4,
        metalness: 0.3,
        envMapIntensity: 0.5
    });
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    pcb.castShadow = true;
    pcb.receiveShadow = true;
    group.add(pcb);

    // ESP32-WROOM-32 module (black metal RF shield)
    const moduleGeo = new THREE.BoxGeometry(1.8, 0.32, 2.5);
    const moduleMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.2,
        metalness: 0.9,
        envMapIntensity: 1.0
    });
    const module = new THREE.Mesh(moduleGeo, moduleMat);
    module.position.set(0, 0.24, -0.5);
    module.castShadow = true;
    group.add(module);

    // Module label (embossed text effect)
    const labelGeo = new THREE.PlaneGeometry(1.4, 0.6);
    const labelMat = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.3,
        metalness: 0.6
    });
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.rotation.x = -Math.PI / 2;
    label.position.set(0, 0.41, -0.5);
    group.add(label);

    // Micro USB port (silver metal)
    const usbBodyGeo = new THREE.BoxGeometry(0.8, 0.32, 0.6);
    const usbMat = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.15,
        metalness: 0.95
    });
    const usbBody = new THREE.Mesh(usbBodyGeo, usbMat);
    usbBody.position.set(0, 0.12, 2.85);
    usbBody.castShadow = true;
    group.add(usbBody);

    // USB port opening (black plastic insert)
    const usbOpenGeo = new THREE.BoxGeometry(0.5, 0.16, 0.25);
    const usbOpenMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.8
    });
    const usbOpen = new THREE.Mesh(usbOpenGeo, usbOpenMat);
    usbOpen.position.set(0, 0.12, 2.98);
    group.add(usbOpen);

    // Pin headers (gold plated) - 2 rows of 15 pins each
    const pinMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37, // Gold
        roughness: 0.25,
        metalness: 0.95
    });

    const pinBaseMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.8
    });

    for (let i = 0; i < 15; i++) {
        const z = -2.654 + i * 0.354; // 2.54mm pitch

        // Left row pins
        const pin1Geo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8);
        const pin1 = new THREE.Mesh(pin1Geo, pinMat);
        pin1.position.set(-1.2, -0.4, z);
        pin1.castShadow = true;
        group.add(pin1);

        // Pin plastic base
        const base1Geo = new THREE.BoxGeometry(0.25, 0.28, 0.25);
        const base1 = new THREE.Mesh(base1Geo, pinBaseMat);
        base1.position.set(-1.2, 0.06, z);
        group.add(base1);

        // Right row pins
        const pin2 = pin1.clone();
        pin2.position.set(1.2, -0.4, z);
        group.add(pin2);

        const base2 = base1.clone();
        base2.position.set(1.2, 0.06, z);
        group.add(base2);
    }

    // Power LED (red, glowing)
    const ledGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const ledMat = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.1
    });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(0.8, 0.13, 2.1);
    group.add(led);

    // LED point light
    const ledLight = new THREE.PointLight(0xff0000, 0.3, 2);
    ledLight.position.copy(led.position);
    group.add(ledLight);

    // Reset button (black tactile switch)
    const btnGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.12, 16);
    const btnMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.6
    });
    const btn1 = new THREE.Mesh(btnGeo, btnMat);
    btn1.position.set(-0.9, 0.14, 1.9);
    group.add(btn1);

    // BOOT button
    const btn2 = btn1.clone();
    btn2.position.set(0.4, 0.14, 1.9);
    group.add(btn2);

    // Voltage regulator (small black IC)
    const regGeo = new THREE.BoxGeometry(0.4, 0.15, 0.5);
    const regMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.5
    });
    const regulator = new THREE.Mesh(regGeo, regMat);
    regulator.position.set(-0.6, 0.16, 0.8);
    group.add(regulator);

    // Capacitors (small cylinders)
    const capGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.2, 12);
    const capMat = new THREE.MeshStandardMaterial({
        color: 0x8b7355,
        roughness: 0.4,
        metalness: 0.2
    });

    const cap1 = new THREE.Mesh(capGeo, capMat);
    cap1.position.set(0.5, 0.18, 0.5);
    group.add(cap1);

    const cap2 = cap1.clone();
    cap2.position.set(-0.3, 0.18, -1.5);
    group.add(cap2);

    // Antenna trace (visible on PCB edge)
    const antennaGeo = new THREE.BoxGeometry(0.15, 0.02, 1.2);
    const antennaMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.3,
        metalness: 0.8
    });
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.set(1.35, 0.09, -1.8);
    group.add(antenna);

    return group;
}
