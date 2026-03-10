import * as THREE from 'three';

export class Cable {
    constructor(scene, color = 0x111111, thickness = 0.05) {
        this.scene = scene;
        this.points = [];
        this.geometry = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1)]),
            20,
            thickness,
            8,
            false
        );
        this.material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.7,
            metalness: 0.1
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        scene.add(this.mesh);
    }

    update(startPoint, endPoint) {
        // Create a catenary-like curve between start and end
        // Simple 3-point curve: Start, Mid (drooping), End

        const midPoint = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);

        // Calculate droop based on distance
        const dist = startPoint.distanceTo(endPoint);
        const droop = Math.max(0.5, dist * 0.3); // More droop for longer wires

        midPoint.y -= droop;

        const curve = new THREE.CatmullRomCurve3([
            startPoint,
            midPoint,
            endPoint
        ]);

        // Update geometry
        this.mesh.geometry.dispose();
        this.mesh.geometry = new THREE.TubeGeometry(curve, 20, this.mesh.geometry.parameters.radius, 8, false);
    }

    dispose() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.scene.remove(this.mesh);
    }
}
