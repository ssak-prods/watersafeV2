import * as THREE from 'three';

export function createBreadboard() {
    const group = new THREE.Group();
    group.userData = {
        id: 'breadboard',
        name: 'MB-102 Breadboard',
        description: '830 tie-point solderless breadboard. Red rail = 5V power, Blue rail = Ground.',
        zone: 'danger',
        waterproof: false
    };

    // Main body - cream/white ABS plastic
    const bodyGeo = new THREE.BoxGeometry(16.5, 0.85, 5.5);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xf5f5dc,
        roughness: 0.7,
        metalness: 0.02,
        envMapIntensity: 0.3
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    body.receiveShadow = true;
    body.position.y = 0.425;
    group.add(body);

    // Power rails - red stripe (top)
    const createRail = (color, zPos) => {
        const railGeo = new THREE.BoxGeometry(16.3, 0.03, 0.35);
        const railMat = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.5,
            metalness: 0.1
        });
        const rail = new THREE.Mesh(railGeo, railMat);
        rail.position.set(0, 0.86, zPos);
        return rail;
    };

    group.add(createRail(0xff3333, 2.4));  // Red + rail
    group.add(createRail(0x3366ff, 2.0));  // Blue - rail
    group.add(createRail(0xff3333, -2.0)); // Red + rail
    group.add(createRail(0x3366ff, -2.4)); // Blue - rail

    // Tie point holes (realistic pattern)
    const holeMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.9,
        metalness: 0.8
    });

    // Create hole pattern (simplified for performance)
    for (let x = -7.5; x <= 7.5; x += 0.508) { // 2.54mm * 2 spacing
        for (let z = -1.8; z <= 1.8; z += 0.508) {
            if (Math.abs(z) < 0.3) continue; // Center gap

            const holeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.1, 8);
            const hole = new THREE.Mesh(holeGeo, holeMat);
            hole.position.set(x, 0.8, z);
            group.add(hole);
        }
    }

    // Add subtle edge bevels
    const edgeGeo = new THREE.BoxGeometry(16.6, 0.1, 5.6);
    const edgeMat = new THREE.MeshStandardMaterial({
        color: 0xe5e5d5,
        roughness: 0.6
    });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.position.y = 0.05;
    group.add(edge);

    return group;
}
