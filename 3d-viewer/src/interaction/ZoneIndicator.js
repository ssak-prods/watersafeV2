import * as THREE from 'three';

export class ZoneIndicator {
    constructor(scene, components) {
        this.scene = scene;
        this.components = components;
        this.indicators = [];
        this.createZoneIndicators();
    }

    createZoneIndicators() {
        // Create zone indicators for each component
        Object.values(this.components).forEach(component => {
            const zone = component.userData.zone;
            const waterproof = component.userData.waterproof;

            if (zone) {
                const indicator = this.createIndicator(component, zone, waterproof);
                this.indicators.push(indicator);
            }

            // Check for sub-components (like probes)
            if (component.userData.probe) {
                const probe = component.userData.probe;
                const probeZone = probe.userData.zone;
                const probeWaterproof = probe.userData.waterproof;

                if (probeZone) {
                    const probeIndicator = this.createIndicator(probe, probeZone, probeWaterproof);
                    this.indicators.push(probeIndicator);
                }
            }
        });
    }

    createIndicator(component, zone, waterproof) {
        const group = new THREE.Group();

        // Get bounding box of component
        const box = new THREE.Box3().setFromObject(component);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Create glow ring around component
        const ringGeo = new THREE.TorusGeometry(
            Math.max(size.x, size.z) * 0.7,
            0.05,
            16,
            32
        );

        let color, intensity;
        if (waterproof || zone === 'safe') {
            color = 0x00ff88; // Green
            intensity = 0.6;
        } else if (zone === 'caution') {
            color = 0xffcc00; // Yellow
            intensity = 0.5;
        } else {
            color = 0xff4466; // Red
            intensity = 0.4;
        }

        const ringMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });

        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.copy(center);
        ring.position.y = 0.05; // Just above floor

        group.add(ring);
        this.scene.add(group);

        return {
            group,
            ring,
            component,
            zone,
            waterproof,
            color,
            intensity,
            baseOpacity: 0
        };
    }

    highlightZone(zoneName) {
        this.indicators.forEach(indicator => {
            const matches =
                (zoneName === 'safe' && (indicator.waterproof || indicator.zone === 'safe')) ||
                (zoneName === 'caution' && indicator.zone === 'caution') ||
                (zoneName === 'danger' && indicator.zone === 'danger' && !indicator.waterproof);

            if (matches) {
                indicator.ring.material.opacity = 0.6;
                indicator.baseOpacity = 0.6;
            } else {
                indicator.ring.material.opacity = 0.1;
                indicator.baseOpacity = 0.1;
            }
        });
    }

    clearHighlight() {
        this.indicators.forEach(indicator => {
            indicator.ring.material.opacity = 0;
            indicator.baseOpacity = 0;
        });
    }

    update(camera) {
        // Pulse animation for indicators
        const time = Date.now() * 0.001;

        this.indicators.forEach(indicator => {
            if (indicator.baseOpacity > 0) {
                const pulse = Math.sin(time * 2) * 0.2;
                indicator.ring.material.opacity = indicator.baseOpacity + pulse;
            }

            // Make rings face camera
            indicator.ring.lookAt(camera.position);
            indicator.ring.rotation.x = 0; // Keep horizontal
        });
    }

    showAllZones() {
        this.indicators.forEach(indicator => {
            indicator.ring.material.opacity = 0.3;
            indicator.baseOpacity = 0.3;
        });
    }

    hideAllZones() {
        this.clearHighlight();
    }
}
