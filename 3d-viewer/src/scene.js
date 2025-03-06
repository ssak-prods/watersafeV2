import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function setupScene(container) {
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12);
    scene.fog = new THREE.Fog(0x0a0a12, 20, 50);

    // Camera
    const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(12, 10, 12);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 40;
    controls.maxPolarAngle = Math.PI / 2.1; // Prevent going below ground
    controls.target.set(0, 1, 0);

    // Lighting setup
    setupLighting(scene);

    // Floor
    createFloor(scene);

    return { scene, camera, renderer, controls };
}

function setupLighting(scene) {
    // Ambient light
    const ambient = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambient);

    // Main directional light (key light)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -15;
    mainLight.shadow.bias = -0.0001;
    mainLight.shadow.normalBias = 0.02;
    scene.add(mainLight);

    // Fill light (softer, from opposite side)
    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.4);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);

    // Rim light (backlight for depth)
    const rimLight = new THREE.DirectionalLight(0xff8844, 0.3);
    rimLight.position.set(0, 8, -15);
    scene.add(rimLight);

    // Point lights for local highlights
    const pointLight1 = new THREE.PointLight(0x00d4ff, 0.6, 20);
    pointLight1.position.set(-5, 8, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ff88, 0.4, 15);
    pointLight2.position.set(5, 6, -5);
    scene.add(pointLight2);

    // Hemisphere light for natural ambient
    const hemiLight = new THREE.HemisphereLight(0x4488ff, 0x221133, 0.3);
    scene.add(hemiLight);
}

function createFloor(scene) {
    // Grid helper
    const gridHelper = new THREE.GridHelper(40, 40, 0x222244, 0x111122);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Floor plane with subtle texture
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a15,
        roughness: 0.95,
        metalness: 0.05,
        envMapIntensity: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = true;
    scene.add(floor);

    // Add subtle radial gradient to floor
    const gradientGeo = new THREE.CircleGeometry(20, 64);
    const gradientMat = new THREE.MeshBasicMaterial({
        color: 0x1a1a2e,
        transparent: true,
        opacity: 0.3
    });
    const gradient = new THREE.Mesh(gradientGeo, gradientMat);
    gradient.rotation.x = -Math.PI / 2;
    gradient.position.y = -0.015;
    scene.add(gradient);
}
