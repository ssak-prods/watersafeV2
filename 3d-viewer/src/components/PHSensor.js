import * as THREE from 'three';

export function createPHSensor() {
    // 1. ELECTRONICS (PCB)
    const electronicsGroup = new THREE.Group();
    electronicsGroup.userData = {
        id: 'ph_pcb',
        type: 'electronics',
        connectorPosition: new THREE.Vector3(2.2, 0.6, 0) // BNC Connector tip
    };

    // --- Materials ---
    const blackPcbMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 });
    const plasticWhiteMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.3 });
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xccffcc, transparent: true, opacity: 0.7, roughness: 0.0, transmission: 0.9
    });
    const redLineMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    // PCB Module
    const pcbGeo = new THREE.BoxGeometry(4.2, 0.2, 3.2);
    const pcb = new THREE.Mesh(pcbGeo, blackPcbMat);
    electronicsGroup.add(pcb);

    // BNC Connector on PCB
    const bncBlockGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const bncBlock = new THREE.Mesh(bncBlockGeo, silverMat);
    bncBlock.position.set(1.5, 0.6, 0);
    electronicsGroup.add(bncBlock);

    const bncCylGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.0, 16);
    const bncCyl = new THREE.Mesh(bncCylGeo, silverMat);
    bncCyl.rotation.z = Math.PI / 2;
    bncCyl.position.set(2.2, 0.6, 0); // Connector center
    electronicsGroup.add(bncCyl);


    // 2. PROBE (Glass Electrode)
    const probeGroup = new THREE.Group();
    probeGroup.userData = {
        id: 'ph_probe',
        type: 'probe',
        cableConnectionPoint: new THREE.Vector3(0, 6.0, 0), // Top of probe
        limitLineY: 1.0
    };

    // Probe Body
    const probeBodyGeo = new THREE.CylinderGeometry(0.6, 0.6, 12, 16);
    const probeBody = new THREE.Mesh(probeBodyGeo, plasticWhiteMat);
    probeBody.position.set(0, 0, 0); // Vertical center at origin
    probeBody.castShadow = true;
    probeGroup.add(probeBody);

    // Probe Cap
    const capGeo = new THREE.CylinderGeometry(0.7, 0.7, 2.0, 16);
    const cap = new THREE.Mesh(capGeo, plasticWhiteMat);
    cap.position.set(0, 6.5, 0); // Top
    probeGroup.add(cap);

    // Glass Bulb
    const bulbGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const bulb = new THREE.Mesh(bulbGeo, glassMat);
    bulb.position.set(0, -6.0, 0); // Tip
    probeGroup.add(bulb);

    // Safety Line
    const limitGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.2, 16);
    const limitLine = new THREE.Mesh(limitGeo, redLineMat);
    limitLine.position.set(0, 5.0, 0); // Safe zone limit
    probeGroup.add(limitLine);

    // Cable Stress Relief
    const reliefGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.0, 8);
    const relief = new THREE.Mesh(reliefGeo, new THREE.MeshStandardMaterial({ color: 0x111111 }));
    relief.position.set(0, 7.5, 0);
    probeGroup.add(relief);

    return { electronics: electronicsGroup, probe: probeGroup };
}
