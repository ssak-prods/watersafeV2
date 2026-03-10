import * as THREE from 'three';

export class WireManager {
    constructor(scene) {
        this.scene = scene;
        this.wires = [];
        this.wireGroups = {
            power: [],
            i2c: [],
            onewire: [],
            analog: []
        };
    }

    createAllWires(components) {
        // Power wires (ESP32 VIN/GND to breadboard rails)
        this.createPowerWires(components);

        // I2C bus (ESP32 GPIO21/22 to ADS1115 and OLED)
        this.createI2CWires(components);

        // OneWire (ESP32 GPIO4 to DS18B20)
        this.createOneWireWires(components);

        // Analog signals (Sensors to ADS1115)
        this.createAnalogWires(components);
    }

    createPowerWires(components) {
        const esp32 = components.esp32;

        // VIN to breadboard + rail (red wire)
        const vinWire = this.createWire(
            esp32.position.clone().add(esp32.userData.pins.vin),
            new THREE.Vector3(-4, 1.5, 2.4),
            new THREE.Vector3(0, 1.2, 2.4),
            0xff3333,
            'power'
        );

        // GND to breadboard - rail (black wire)
        const gndWire = this.createWire(
            esp32.position.clone().add(esp32.userData.pins.gnd),
            new THREE.Vector3(-4, 1.5, -2.4),
            new THREE.Vector3(0, 1.2, -2.4),
            0x0a0a0a,
            'power'
        );
    }

    createI2CWires(components) {
        const esp32 = components.esp32;
        const ads1115 = components.ads1115;
        const oled = components.oled;

        // ESP32 GPIO21 (SDA) to ADS1115 (green wire)
        const sdaToADS = this.createWire(
            esp32.position.clone().add(esp32.userData.pins.gpio21),
            new THREE.Vector3(0, 1.8, 0),
            ads1115.position.clone().add(ads1115.userData.pins.sda),
            0x33cc33,
            'i2c'
        );

        // ESP32 GPIO22 (SCL) to ADS1115 (yellow wire)
        const sclToADS = this.createWire(
            esp32.position.clone().add(esp32.userData.pins.gpio22),
            new THREE.Vector3(0, 2.0, 0.3),
            ads1115.position.clone().add(ads1115.userData.pins.scl),
            0xffcc00,
            'i2c'
        );

        // ADS1115 to OLED (daisy chain)
        const sdaToOLED = this.createWire(
            ads1115.position.clone().add(ads1115.userData.pins.sda),
            new THREE.Vector3(2, 1.5, -0.5),
            oled.position.clone().add(oled.userData.pins.sda),
            0x33cc33,
            'i2c'
        );

        const sclToOLED = this.createWire(
            ads1115.position.clone().add(ads1115.userData.pins.scl),
            new THREE.Vector3(2, 1.6, -0.7),
            oled.position.clone().add(oled.userData.pins.scl),
            0xffcc00,
            'i2c'
        );
    }

    createOneWireWires(components) {
        const esp32 = components.esp32;

        // ESP32 GPIO4 to DS18B20 (blue wire)
        // Note: DS18B20 has individual wires, so we connect to the yellow (DATA) wire
        const oneWire = this.createWire(
            esp32.position.clone().add(esp32.userData.pins.gpio4),
            new THREE.Vector3(-5, 2.0, -1.5),
            new THREE.Vector3(-6, 1.5, -2), // DS18B20 yellow wire position
            0x3366ff,
            'onewire'
        );
    }

    createAnalogWires(components) {
        const ads1115 = components.ads1115;
        const phSensor = components.phSensor;
        const turbiditySensor = components.turbiditySensor;
        const tdsSensor = components.tdsSensor;

        // pH sensor to ADS1115 A0 (orange wire)
        const phWire = this.createWire(
            phSensor.position.clone().add(phSensor.userData.pins.signal),
            new THREE.Vector3(4, 1.8, 1.5),
            ads1115.position.clone().add(ads1115.userData.pins.a0),
            0xff8844,
            'analog'
        );

        // Turbidity to ADS1115 A1 (orange wire)
        const turbWire = this.createWire(
            new THREE.Vector3(4.5, 1.5, -1), // Turbidity cable exit
            new THREE.Vector3(3.5, 1.6, 0),
            ads1115.position.clone().add(ads1115.userData.pins.a1),
            0xff8844,
            'analog'
        );

        // TDS to ADS1115 A2 (orange wire)
        const tdsWire = this.createWire(
            new THREE.Vector3(5, 1.2, -3.5), // TDS terminal
            new THREE.Vector3(3.5, 1.4, -1),
            ads1115.position.clone().add(ads1115.userData.pins.a2),
            0xff8844,
            'analog'
        );
    }

    createWire(start, mid, end, color, type) {
        const wireGroup = new THREE.Group();

        // Create DuPont connector at start
        const startConnector = this.createDuPontConnector(start, true);
        wireGroup.add(startConnector);

        // Create DuPont connector at end
        const endConnector = this.createDuPontConnector(end, false);
        wireGroup.add(endConnector);

        // Create wire path using quadratic bezier curve
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);

        const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.06, 8, false);
        const wireMat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.7,
            metalness: 0.1
        });

        const wire = new THREE.Mesh(tubeGeo, wireMat);
        wire.castShadow = true;
        wireGroup.add(wire);

        this.scene.add(wireGroup);
        this.wires.push(wireGroup);
        this.wireGroups[type].push(wireGroup);

        return wireGroup;
    }

    createDuPontConnector(position, isMale) {
        const connector = new THREE.Group();

        // Plastic housing (black)
        const housingGeo = new THREE.BoxGeometry(0.25, 0.25, 0.28);
        const housingMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            roughness: 0.7
        });
        const housing = new THREE.Mesh(housingGeo, housingMat);
        housing.position.copy(position);
        connector.add(housing);

        // Gold contact
        const contactGeo = isMale
            ? new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8)
            : new THREE.BoxGeometry(0.06, 0.06, 0.08);

        const contactMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.2,
            metalness: 0.95
        });
        const contact = new THREE.Mesh(contactGeo, contactMat);

        if (isMale) {
            contact.rotation.x = Math.PI / 2;
            contact.position.copy(position).add(new THREE.Vector3(0, 0, 0.2));
        } else {
            contact.position.copy(position).add(new THREE.Vector3(0, 0, -0.1));
        }

        connector.add(contact);

        return connector;
    }

    setVisible(visible) {
        this.wires.forEach(wire => {
            wire.visible = visible;
        });
    }

    highlightWireType(type) {
        Object.keys(this.wireGroups).forEach(key => {
            const opacity = key === type ? 1.0 : 0.3;
            this.wireGroups[key].forEach(wire => {
                wire.traverse(child => {
                    if (child.isMesh && child.material) {
                        child.material.opacity = opacity;
                        child.material.transparent = opacity < 1.0;
                    }
                });
            });
        });
    }

    clearHighlight() {
        this.wires.forEach(wire => {
            wire.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.opacity = 1.0;
                    child.material.transparent = false;
                }
            });
        });
    }
}
