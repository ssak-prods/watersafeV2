import * as THREE from 'three';

// Hyper-realistic water shader
const waterVertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    uniform float time;
    
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        vec3 pos = position;
        
        // Complex wave composition (Gerstner waves approximation)
        float wave1 = sin(pos.x * 2.0 + time) * 0.02;
        float wave2 = sin(pos.y * 1.5 + time * 1.2) * 0.02;
        float wave3 = sin((pos.x + pos.y) * 3.0 + time * 2.0) * 0.01;
        float noise = sin(pos.x * 10.0 + time * 3.0) * cos(pos.y * 10.0 + time * 2.0) * 0.005;
        
        pos.z += wave1 + wave2 + wave3 + noise;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vViewPosition = -mvPosition.xyz;
        vPosition = pos;
        
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const waterFragmentShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    uniform vec3 waterColor;
    uniform vec3 deepWaterColor;
    uniform float opacity;
    uniform float time;
    uniform float turbidity;
    
    void main() {
        vec3 viewNormal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        
        // Fresnel reflection
        float fresnel = pow(1.0 - max(dot(viewDir, viewNormal), 0.0), 4.0);
        
        // Specular highlights (Sun reflection)
        vec3 lightDir = normalize(vec3(10.0, 20.0, 10.0));
        vec3 reflectDir = reflect(-lightDir, viewNormal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 100.0) * 1.5;
        
        // Beer's Law for depth absorption
        // Simulating depth based on simple gradient for now, can be improved with depth buffer
        float depth = 1.0; 
        vec3 absorption = waterColor * vec3(1.0 - depth * 0.5);
        
        // Mix surface color based on turbidity
        vec3 finalColor = mix(waterColor, deepWaterColor, 0.6);
        
        // Add murkiness based on turbidity uniform
        float murk = clamp(turbidity / 500.0, 0.0, 1.0);
        finalColor = mix(finalColor, vec3(0.5, 0.4, 0.3), murk * 0.8);
        
        // Combine Reflection (Fresnel) + Refraction (Base Color) + Specular
        vec3 skyColor = vec3(0.9, 0.95, 1.0); // Fake sky reflection
        vec3 col = mix(finalColor, skyColor, fresnel * 0.4 + 0.1);
        col += vec3(spec);
        
        gl_FragColor = vec4(col, opacity + (murk * 0.2)); // Murky water is more opaque
    }
`;

export class WaterBasin {
    constructor(scene, waterQuality) {
        this.scene = scene;
        this.waterQuality = waterQuality;
        this.waterMesh = null;
        this.basinGroup = new THREE.Group();
        this.time = 0;

        this.createBasin();
        this.createWater();
        this.scene.add(this.basinGroup);
    }

    createBasin() {
        // High-quality glass material for the container
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.1,
            roughness: 0.0,
            metalness: 0.0,
            transmission: 0.99, // Glass-like transmission
            thickness: 1.0,     // Volume rendering for glass
            ior: 1.5,           // Index of Refraction for Glass
            envMapIntensity: 1.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0
        });

        // Bottom
        const bottomGeo = new THREE.BoxGeometry(30, 0.5, 20);
        const bottom = new THREE.Mesh(bottomGeo, glassMat);
        bottom.position.set(0, -0.25, 0);
        bottom.receiveShadow = true;
        this.basinGroup.add(bottom);

        // Walls
        const wallThickness = 0.5;

        // Back wall
        const backGeo = new THREE.BoxGeometry(30, 15, wallThickness);
        const back = new THREE.Mesh(backGeo, glassMat);
        back.position.set(0, 7.5, -10);
        back.castShadow = true;
        this.basinGroup.add(back);

        // Front wall
        const front = back.clone();
        front.position.set(0, 7.5, 10);
        this.basinGroup.add(front);

        // Left wall
        const sideGeo = new THREE.BoxGeometry(wallThickness, 15, 20);
        const left = new THREE.Mesh(sideGeo, glassMat);
        left.position.set(-15, 7.5, 0);
        left.castShadow = true;
        this.basinGroup.add(left);

        // Right wall
        const right = left.clone();
        right.position.set(15, 7.5, 0);
        this.basinGroup.add(right);

        // Add silicone sealant at edges (Visual detail)
        const sealantMat = new THREE.MeshStandardMaterial({
            color: 0xeeeeee,
            roughness: 0.8
        });
        const cornerGeo = new THREE.CylinderGeometry(0.1, 0.1, 15, 8);
        const corners = [
            [-14.9, 7.5, -9.9], [14.9, 7.5, -9.9],
            [-14.9, 7.5, 9.9], [14.9, 7.5, 9.9]
        ];

        corners.forEach(pos => {
            const seal = new THREE.Mesh(cornerGeo, sealantMat);
            seal.position.set(...pos);
            this.basinGroup.add(seal);
        });

        // Metal stand/frame
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.2,
            metalness: 0.9
        });
        const baseFrameGeo = new THREE.BoxGeometry(31, 0.5, 21);
        const baseFrame = new THREE.Mesh(baseFrameGeo, frameMat);
        baseFrame.position.set(0, -0.6, 0);
        this.basinGroup.add(baseFrame);
    }

    createWater() {
        const waterGeometry = new THREE.PlaneGeometry(29, 19, 128, 128);

        // Initialize shader material
        const waterMaterial = new THREE.ShaderMaterial({
            vertexShader: waterVertexShader,
            fragmentShader: waterFragmentShader,
            uniforms: {
                time: { value: 0 },
                waterColor: { value: new THREE.Color(0x00aaff) },
                deepWaterColor: { value: new THREE.Color(0x004488) },
                opacity: { value: 0.8 },
                turbidity: { value: 0 }
            },
            transparent: true,
            side: THREE.DoubleSide
        });

        this.waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
        this.waterMesh.rotation.x = -Math.PI / 2;
        this.waterMesh.position.y = 10; // High water level
        this.waterMesh.receiveShadow = true;
        this.waterMesh.castShadow = false; // Water shouldn't cast hard shadows typically

        this.basinGroup.add(this.waterMesh);

        // Caustics (Fake projected light on floor)
        // In a real engine we'd compute this, here we use a texture or shader trick
        // Using a simple animated mesh near bottom for performance/visual hack
        const causticGeo = new THREE.PlaneGeometry(28, 18);
        const causticMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
        this.caustics = new THREE.Mesh(causticGeo, causticMat);
        this.caustics.rotation.x = -Math.PI / 2;
        this.caustics.position.y = 0.1;
        this.basinGroup.add(this.caustics);
    }

    getWaterColor() {
        const { turbidity, ph } = this.waterQuality;
        let color = new THREE.Color(0x00aaff); // Pure water cyan

        // pH Scale (Acidic=Red/Orange, Neutral=Cyan, Alkaline=Purple/Blue)
        if (ph < 6.0) {
            color.lerp(new THREE.Color(0xffaa00), (6.0 - ph) / 6.0 * 0.5); // Acidic - Yellowish
        } else if (ph > 8.0) {
            color.lerp(new THREE.Color(0x4400ff), (ph - 8.0) / 6.0 * 0.4); // Alkaline - Purpleish
        }

        return color;
    }

    updateQuality(quality) {
        this.waterQuality = quality;

        if (this.waterMesh && this.waterMesh.material.uniforms) {
            const color = this.getWaterColor();
            this.waterMesh.material.uniforms.waterColor.value = color;
            this.waterMesh.material.uniforms.turbidity.value = quality.turbidity;

            // Adjust opacity for turbidity
            // Clean water ~ 0.6 opacity (glassy)
            // Dirty water ~ 0.95 opacity (opaque)
            let baseOpacity = 0.6 + (quality.turbidity / 1000.0) * 0.35;
            this.waterMesh.material.uniforms.opacity.value = baseOpacity;
        }
    }

    update() {
        this.time += 0.015;

        if (this.waterMesh) {
            this.waterMesh.material.uniforms.time.value = this.time;
        }

        if (this.caustics) {
            // Flicker caustics
            this.caustics.material.opacity = 0.1 + Math.sin(this.time * 2.0) * 0.05;
            this.caustics.position.y = 0.1 + Math.sin(this.time) * 0.05;
        }
    }

    setVisible(visible) {
        this.basinGroup.visible = visible;
    }
}
