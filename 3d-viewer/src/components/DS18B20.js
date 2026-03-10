import * as THREE from 'three';

export function createDS18B20() {
    const group = new THREE.Group();
    group.userData = {
        id: 'ds18b20',
        name: 'DS18B20 Temperature Probe',
        description: 'Waterproof digital temperature sensor. Uses OneWire protocol on GPIO 4 with 4.7kΩ pull-up resistor.',
        zone: 'safe', // Fully waterproof
        waterproof: true
    };

    // Stainless steel probe body (brushed metal finish)
    const probeGeo = new THREE.CylinderGeometry(0.3, 0.3, 5.0, 20);
    const probeMat = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        roughness: 0.25,
        metalness: 0.9,
        envMapIntensity: 1.0
    });
    const probe = new THREE.Mesh(probeGeo, probeMat);
    probe.rotation.z = Math.PI / 2;
    probe.castShadow = true;
    group.add(probe);

    // Brushed metal texture effect (subtle grooves)
    for (let i = 0; i < 20; i++) {
        const grooveGeo = new THREE.TorusGeometry(0.31, 0.01, 8, 24);
        const grooveMat = new THREE.MeshStandardMaterial({
            color: 0x999999,
            roughness: 0.4,
            metalness: 0.85
        });
        const groove = new THREE.Mesh(grooveGeo, grooveMat);
        groove.rotation.y = Math.PI / 2;
        groove.position.set(-2.3 + i * 0.25, 0, 0);
        group.add(groove);
    }

    // Rounded tip (hemispherical end cap)
    const tipGeo = new THREE.SphereGeometry(0.3, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2);
    const tip = new THREE.Mesh(tipGeo, probeMat);
    tip.rotation.z = -Math.PI / 2;
    tip.position.set(2.5, 0, 0);
    tip.castShadow = true;
    group.add(tip);

    // Heat shrink tubing at cable junction (black)
    const shrinkGeo = new THREE.CylinderGeometry(0.36, 0.3, 0.9, 16);
    const shrinkMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.85
    });
    const shrink = new THREE.Mesh(shrinkGeo, shrinkMat);
    shrink.rotation.z = Math.PI / 2;
    shrink.position.set(-2.95, 0, 0);
    shrink.castShadow = true;
    group.add(shrink);

    // Cable (3-wire: red, yellow, black)
    const cableGeo = new THREE.CylinderGeometry(0.28, 0.28, 4.5, 12);
    const cableMat = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.9
    });
    const cable = new THREE.Mesh(cableGeo, cableMat);
    cable.rotation.z = Math.PI / 2;
    cable.position.set(-5.5, 0, 0);
    cable.castShadow = true;
    group.add(cable);

    // Individual wires visible at cable end
    const wireColors = [
        { color: 0xff0000, y: 0.15 },  // Red (VCC)
        { color: 0xffcc00, y: 0 },     // Yellow (DATA)
        { color: 0x0a0a0a, y: -0.15 }  // Black (GND)
    ];

    wireColors.forEach(({ color, y }) => {
        const wireGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8);
        const wireMat = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.7
        });
        const wire = new THREE.Mesh(wireGeo, wireMat);
        wire.rotation.z = Math.PI / 2;
        wire.position.set(-7.9, y, 0);
        group.add(wire);

        // Wire end connector (DuPont female)
        const connGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
        const connMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            roughness: 0.6
        });
        const conn = new THREE.Mesh(connGeo, connMat);
        conn.position.set(-8.4, y, 0);
        group.add(conn);

        // Gold contact visible in connector
        const contactGeo = new THREE.BoxGeometry(0.06, 0.06, 0.2);
        const contactMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.2,
            metalness: 0.95
        });
        const contact = new THREE.Mesh(contactGeo, contactMat);
        contact.position.set(-8.5, y, 0);
        group.add(contact);
    });

    // Cable strain relief (ribbed section)
    for (let i = 0; i < 5; i++) {
        const ribGeo = new THREE.TorusGeometry(0.3, 0.03, 8, 16);
        const ribMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.9
        });
        const rib = new THREE.Mesh(ribGeo, ribMat);
        rib.rotation.y = Math.PI / 2;
        rib.position.set(-3.5 - i * 0.15, 0, 0);
        group.add(rib);
    }

    return group;
}
