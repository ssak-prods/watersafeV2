import * as THREE from 'three';

export function createOLED() {
    const group = new THREE.Group();
    group.userData = {
        id: 'oled',
        name: 'SSD1306 OLED Display',
        description: '0.96" 128x64 pixel OLED display. Shows real-time sensor readings and system status via I2C.',
        zone: 'danger',
        waterproof: false,
        pins: {
            sda: new THREE.Vector3(-0.9, -0.22, -0.425),
            scl: new THREE.Vector3(-0.65, -0.22, -0.425)
        }
    };

    // PCB
    const pcbGeo = new THREE.BoxGeometry(2.7, 0.12, 2.7);
    const pcbMat = new THREE.MeshStandardMaterial({
        color: 0x1a3355,
        roughness: 0.4,
        metalness: 0.3
    });
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    pcb.castShadow = true;
    group.add(pcb);

    // Display bezel (black plastic frame)
    const bezelGeo = new THREE.BoxGeometry(2.5, 0.18, 1.3);
    const bezelMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.3,
        metalness: 0.1
    });
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    bezel.position.set(0, 0.15, 0.5);
    bezel.castShadow = true;
    group.add(bezel);

    // Active display area (blue-tinted glass with glow)
    const screenGeo = new THREE.BoxGeometry(2.2, 0.04, 0.95);
    const screenMat = new THREE.MeshStandardMaterial({
        color: 0x0066aa,
        emissive: 0x003366,
        emissiveIntensity: 0.6,
        roughness: 0.05,
        metalness: 0.3,
        transparent: true,
        opacity: 0.95
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.25, 0.5);
    group.add(screen);

    // Screen glow effect
    const glowLight = new THREE.PointLight(0x0066aa, 0.4, 3);
    glowLight.position.set(0, 0.3, 0.5);
    group.add(glowLight);

    // Pixel grid pattern (subtle)
    const pixelGeo = new THREE.PlaneGeometry(2.1, 0.9);
    const pixelMat = new THREE.MeshBasicMaterial({
        color: 0x004488,
        transparent: true,
        opacity: 0.3
    });
    const pixels = new THREE.Mesh(pixelGeo, pixelMat);
    pixels.rotation.x = -Math.PI / 2;
    pixels.position.set(0, 0.27, 0.5);
    group.add(pixels);

    // Pin header (4 pins: GND, VCC, SCL, SDA)
    const pinMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.25,
        metalness: 0.95
    });

    const pinBaseMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.8
    });

    for (let i = 0; i < 4; i++) {
        const pinGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.55, 8);
        const pin = new THREE.Mesh(pinGeo, pinMat);
        pin.position.set(-0.9 + i * 0.25, -0.22, -0.425);
        pin.castShadow = true;
        group.add(pin);

        // Pin base
        const baseGeo = new THREE.BoxGeometry(0.2, 0.18, 0.2);
        const base = new THREE.Mesh(baseGeo, pinBaseMat);
        base.position.set(-0.9 + i * 0.25, 0.03, -0.425);
        group.add(base);
    }

    // Controller IC (small black chip on back)
    const icGeo = new THREE.BoxGeometry(0.8, 0.1, 0.8);
    const icMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.4
    });
    const ic = new THREE.Mesh(icGeo, icMat);
    ic.position.set(0, 0.11, -0.8);
    group.add(ic);

    // Mounting holes
    const holeMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.9
    });

    const positions = [
        [-1.2, 0.07, 1.2],
        [1.2, 0.07, 1.2],
        [-1.2, 0.07, -1.2],
        [1.2, 0.07, -1.2]
    ];

    positions.forEach(pos => {
        const holeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.15, 12);
        const hole = new THREE.Mesh(holeGeo, holeMat);
        hole.position.set(...pos);
        group.add(hole);
    });

    return group;
}
