import * as THREE from 'three';

export function createADS1115() {
    const group = new THREE.Group();
    group.userData = {
        id: 'ads1115',
        name: 'ADS1115 16-bit ADC',
        description: 'High-precision analog-to-digital converter. Reads pH (A0), Turbidity (A1), and TDS (A2) sensors via I2C at address 0x48.',
        zone: 'danger',
        waterproof: false,
        pins: {
            sda: new THREE.Vector3(-0.7, -0.25, -0.5),
            scl: new THREE.Vector3(-0.7, -0.25, -0.3),
            a0: new THREE.Vector3(0.75, 0.35, -0.6),
            a1: new THREE.Vector3(0.75, 0.35, -0.2),
            a2: new THREE.Vector3(0.75, 0.35, 0.2)
        }
    };

    // PCB - Purple/blue
    const pcbGeo = new THREE.BoxGeometry(2.1, 0.12, 2.8);
    const pcbMat = new THREE.MeshStandardMaterial({
        color: 0x6b2d8a,
        roughness: 0.4,
        metalness: 0.3
    });
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    pcb.castShadow = true;
    group.add(pcb);

    // ADS1115 IC chip (TSSOP-10 package)
    const chipGeo = new THREE.BoxGeometry(0.65, 0.18, 0.5);
    const chipMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.3,
        metalness: 0.2
    });
    const chip = new THREE.Mesh(chipGeo, chipMat);
    chip.position.set(0, 0.15, 0);
    chip.castShadow = true;
    group.add(chip);

    // Chip label
    const labelGeo = new THREE.PlaneGeometry(0.5, 0.3);
    const labelMat = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        roughness: 0.8
    });
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.rotation.x = -Math.PI / 2;
    label.position.set(0, 0.25, 0);
    group.add(label);

    // Screw terminal block (green)
    const termGeo = new THREE.BoxGeometry(0.4, 0.45, 2.0);
    const termMat = new THREE.MeshStandardMaterial({
        color: 0x00aa44,
        roughness: 0.6
    });
    const terminal = new THREE.Mesh(termGeo, termMat);
    terminal.position.set(0.75, 0.28, 0);
    terminal.castShadow = true;
    group.add(terminal);

    // Terminal screws (silver)
    const screwMat = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.25,
        metalness: 0.9
    });

    for (let i = 0; i < 4; i++) {
        const screwGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.12, 8);
        const screw = new THREE.Mesh(screwGeo, screwMat);
        screw.rotation.z = Math.PI / 2;
        screw.position.set(0.85, 0.38, -0.6 + i * 0.4);
        group.add(screw);

        // Screw slot
        const slotGeo = new THREE.BoxGeometry(0.12, 0.02, 0.02);
        const slot = new THREE.Mesh(slotGeo, new THREE.MeshStandardMaterial({ color: 0x333333 }));
        slot.rotation.z = Math.PI / 2;
        slot.position.set(0.92, 0.38, -0.6 + i * 0.4);
        group.add(slot);
    }

    // Pin header (6 pins)
    const pinMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.25,
        metalness: 0.95
    });

    const pinBaseMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.8
    });

    for (let i = 0; i < 6; i++) {
        const pinGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.65, 8);
        const pin = new THREE.Mesh(pinGeo, pinMat);
        pin.position.set(-0.7, -0.25, -0.5 + i * 0.2);
        pin.castShadow = true;
        group.add(pin);

        // Pin base
        const baseGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const base = new THREE.Mesh(baseGeo, pinBaseMat);
        base.position.set(-0.7, 0.04, -0.5 + i * 0.2);
        group.add(base);
    }

    // SMD resistors (tiny brown rectangles)
    const resistorMat = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.7
    });

    for (let i = 0; i < 4; i++) {
        const resGeo = new THREE.BoxGeometry(0.15, 0.08, 0.08);
        const res = new THREE.Mesh(resGeo, resistorMat);
        res.position.set(-0.3 + i * 0.2, 0.1, 0.8);
        group.add(res);
    }

    // SMD capacitors (tiny gray rectangles)
    const capMat = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.5
    });

    for (let i = 0; i < 3; i++) {
        const capGeo = new THREE.BoxGeometry(0.12, 0.06, 0.08);
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.set(-0.2 + i * 0.2, 0.09, -0.8);
        group.add(cap);
    }

    return group;
}
