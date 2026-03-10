import * as THREE from 'three';

export function createTurbiditySensor() {
    const electronicsGroup = new THREE.Group();
    const probeGroup = new THREE.Group();

    // --- ID Data ---
    electronicsGroup.userData = {
        id: 'turbidity_pcb',
        name: 'Turbidity Adapter',
        type: 'electronics',
        connectorPosition: new THREE.Vector3(0, 2.1, 0) // Relative to group
    };

    probeGroup.userData = {
        id: 'turbidity_probe',
        name: 'Turbidity Sensor Head',
        type: 'probe',
        cableConnectionPoint: new THREE.Vector3(0, 2.8, 0), // Where cable connects
        zone: 'caution',
        limitLineY: 1.1
    };

    // --- Materials ---
    const plasticMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });
    const redLineMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const labelMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
    const connectorMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });

    // ==========================================
    // 1. ELECTRONICS PART (The Adapter Board)
    // ==========================================
    // The "Adapter" is actually small for this sensor, usually just a connector board.
    // Let's model a small PCB adapter if it exists, or just the connector end.
    // In DFRobot kit, it connects to a small driver board. Let's model that board.

    // Driver Board PCB
    const pcbGeo = new THREE.BoxGeometry(3.0, 0.2, 2.0);
    const pcbMat = new THREE.MeshStandardMaterial({ color: 0x333333 }); // Dark PCB
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    electronicsGroup.add(pcb);

    // Connector on Board (JST)
    const boardConnGeo = new THREE.BoxGeometry(0.8, 0.5, 0.5);
    const boardConn = new THREE.Mesh(boardConnGeo, connectorMat);
    boardConn.position.set(0, 0.35, 0.8);
    electronicsGroup.add(boardConn);

    // Potentiometer
    const potGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.3, 16);
    const pot = new THREE.Mesh(potGeo, new THREE.MeshStandardMaterial({ color: 0x0044aa }));
    pot.position.set(-0.8, 0.25, -0.5);
    electronicsGroup.add(pot);

    // ==========================================
    // 2. PROBE PART (The Fork)
    // ==========================================

    // Top Head (Electronics housing on probe)
    const headGeo = new THREE.BoxGeometry(3.0, 1.2, 0.8);
    const head = new THREE.Mesh(headGeo, plasticMat);
    head.position.set(0, 1.5, 0);
    head.castShadow = true;
    probeGroup.add(head);

    // The "Fork"
    const prongGeo = new THREE.BoxGeometry(0.6, 2.0, 0.6);

    const leftProng = new THREE.Mesh(prongGeo, plasticMat);
    leftProng.position.set(-0.8, 0.2, 0);
    leftProng.castShadow = true;
    probeGroup.add(leftProng);

    const rightProng = new THREE.Mesh(prongGeo, plasticMat);
    rightProng.position.set(0.8, 0.2, 0);
    rightProng.castShadow = true;
    probeGroup.add(rightProng);

    // Window features
    const windowGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x222222 });

    const emitWin = new THREE.Mesh(windowGeo, windowMat);
    emitWin.rotation.z = Math.PI / 2;
    emitWin.position.set(-0.5, 0.0, 0);
    probeGroup.add(emitWin);

    const recvWin = emitWin.clone();
    recvWin.position.set(0.5, 0.0, 0);
    probeGroup.add(recvWin);

    // Signal Wire Connector (On Top of Head)
    // The dynamic cable will connect here.
    const probeConnGeo = new THREE.BoxGeometry(0.5, 0.3, 0.4);
    const probeConn = new THREE.Mesh(probeConnGeo, connectorMat);
    probeConn.position.set(0, 2.1, 0);
    probeGroup.add(probeConn);

    // Cable Stress Relief
    const reliefGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 8);
    const relief = new THREE.Mesh(reliefGeo, plasticMat);
    relief.position.set(0, 2.5, 0);
    probeGroup.add(relief);

    // Safety Markers
    const lineGeo = new THREE.BoxGeometry(3.1, 0.1, 0.85);
    const limitLine = new THREE.Mesh(lineGeo, redLineMat);
    limitLine.position.set(0, 1.1, 0);
    probeGroup.add(limitLine);

    const textGeo = new THREE.PlaneGeometry(1.5, 0.4);
    const text = new THREE.Mesh(textGeo, labelMat);
    text.position.set(0, 1.4, 0.41);
    probeGroup.add(text);

    return { electronics: electronicsGroup, probe: probeGroup };
}
