import * as THREE from 'three';

export function createTDSSensor() {
    // 1. ELECTRONICS
    const electronicsGroup = new THREE.Group();
    electronicsGroup.userData = {
        id: 'tds_pcb',
        type: 'electronics',
        connectorPosition: new THREE.Vector3(1.5, 0.35, 0)
    };

    const blackPcbMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });
    const blackPlasticMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
    const whitePlasticMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.3 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.95 });
    const redLineMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    // PCB
    const pcbGeo = new THREE.BoxGeometry(4.2, 0.2, 3.2);
    const pcb = new THREE.Mesh(pcbGeo, blackPcbMat);
    electronicsGroup.add(pcb);

    // Connector
    const connGeo = new THREE.BoxGeometry(0.8, 0.5, 0.5);
    const conn = new THREE.Mesh(connGeo, whitePlasticMat);
    conn.position.set(1.5, 0.35, 0);
    electronicsGroup.add(conn);


    // 2. PROBE
    const probeGroup = new THREE.Group();
    probeGroup.userData = {
        id: 'tds_probe',
        type: 'probe',
        cableConnectionPoint: new THREE.Vector3(0, 1.5, 0),
        limitLineY: 0.5 // Top of cap
    };

    // Probe Cap (Black)
    const capGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.5, 16);
    const cap = new THREE.Mesh(capGeo, blackPlasticMat);
    cap.position.set(0, 0, 0);
    probeGroup.add(cap);

    // Limit Line
    const limitLineGeo = new THREE.CylinderGeometry(0.61, 0.61, 0.1, 16);
    const limitLine = new THREE.Mesh(limitLineGeo, redLineMat);
    limitLine.position.set(0, 0.5, 0);
    probeGroup.add(limitLine);

    // Prongs
    const prongGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
    // Left
    const p1 = new THREE.Mesh(prongGeo, metalMat);
    p1.position.set(-0.2, -1.1, 0);
    probeGroup.add(p1);
    // Right
    const p2 = new THREE.Mesh(prongGeo, metalMat);
    p2.position.set(0.2, -1.1, 0);
    probeGroup.add(p2);

    // Strain Relief
    const reliefGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 8);
    const relief = new THREE.Mesh(reliefGeo, blackPlasticMat);
    relief.position.set(0, 1.0, 0);
    probeGroup.add(relief);

    return { electronics: electronicsGroup, probe: probeGroup };
}
