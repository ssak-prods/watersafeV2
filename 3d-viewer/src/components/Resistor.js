import * as THREE from 'three';

export function createResistor() {
    const group = new THREE.Group();
    group.userData = {
        id: 'resistor_pullup',
        name: '4.7kΩ Pull-up Resistor',
        description: 'Required for OneWire bus. Connects between 5V and DS18B20 data line to ensure reliable communication.',
        zone: 'danger',
        waterproof: false
    };

    // Resistor body (tan/beige ceramic)
    const bodyGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.85, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xd4b896,
        roughness: 0.75,
        metalness: 0.05
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.z = Math.PI / 2;
    body.castShadow = true;
    group.add(body);

    // Color bands for 4.7kΩ (Yellow-Violet-Red-Gold)
    const bands = [
        { color: 0xffff00, pos: -0.28 },  // Yellow (4)
        { color: 0x8800ff, pos: -0.12 },  // Violet (7)
        { color: 0xff0000, pos: 0.04 },   // Red (×100)
        { color: 0xd4af37, pos: 0.28 }    // Gold (±5%)
    ];

    bands.forEach(({ color, pos }) => {
        const bandGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.08, 16);
        const bandMat = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.5,
            metalness: color === 0xd4af37 ? 0.7 : 0.1
        });
        const band = new THREE.Mesh(bandGeo, bandMat);
        band.rotation.z = Math.PI / 2;
        band.position.set(pos, 0, 0);
        group.add(band);
    });

    // Wire leads (silver-plated copper)
    const leadMat = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.25,
        metalness: 0.9
    });

    // Left lead
    const lead1Geo = new THREE.CylinderGeometry(0.025, 0.025, 1.1, 8);
    const lead1 = new THREE.Mesh(lead1Geo, leadMat);
    lead1.rotation.z = Math.PI / 2;
    lead1.position.set(-0.975, 0, 0);
    lead1.castShadow = true;
    group.add(lead1);

    // Right lead
    const lead2 = lead1.clone();
    lead2.position.set(0.975, 0, 0);
    group.add(lead2);

    // Lead bends (for breadboard insertion)
    const bendGeo = new THREE.TorusGeometry(0.1, 0.025, 8, 16, Math.PI / 2);

    const bend1 = new THREE.Mesh(bendGeo, leadMat);
    bend1.rotation.y = Math.PI;
    bend1.position.set(-0.525, -0.1, 0);
    group.add(bend1);

    const bend2 = new THREE.Mesh(bendGeo, leadMat);
    bend2.rotation.y = Math.PI;
    bend2.position.set(0.525, -0.1, 0);
    group.add(bend2);

    // Vertical lead sections (going down to breadboard)
    const vertGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8);

    const vert1 = new THREE.Mesh(vertGeo, leadMat);
    vert1.position.set(-0.525, -0.25, 0);
    group.add(vert1);

    const vert2 = new THREE.Mesh(vertGeo, leadMat);
    vert2.position.set(0.525, -0.25, 0);
    group.add(vert2);

    return group;
}
