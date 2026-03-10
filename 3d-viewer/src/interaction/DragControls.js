import * as THREE from 'three';

export function setupInteractions(state) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const tooltip = document.getElementById('info-tooltip');

    let hoveredObject = null;
    let isDragging = false;

    // Mouse move handler
    state.renderer.domElement.addEventListener('mousemove', (event) => {
        // Update mouse position
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Don't raycast while dragging camera
        if (state.controls.enabled === false || isDragging) {
            hideTooltip();
            return;
        }

        // Raycast
        raycaster.setFromCamera(mouse, state.camera);

        const allObjects = [];
        Object.values(state.components).forEach(comp => {
            comp.traverse(child => {
                if (child.isMesh) allObjects.push(child);
            });
        });

        const intersects = raycaster.intersectObjects(allObjects, false);

        if (intersects.length > 0) {
            const object = intersects[0].object;

            // Find parent component
            let component = object;
            while (component.parent && !component.userData.id) {
                component = component.parent;
            }

            if (component.userData.id) {
                hoveredObject = component;
                showTooltip(component, event.clientX, event.clientY);
                document.body.style.cursor = 'pointer';
            } else {
                hideTooltip();
                document.body.style.cursor = 'default';
            }
        } else {
            hideTooltip();
            document.body.style.cursor = 'default';
        }
    });

    // Click handler
    state.renderer.domElement.addEventListener('click', (event) => {
        if (hoveredObject && hoveredObject.userData.id) {
            console.log('Clicked:', hoveredObject.userData.name);

            // Highlight component
            highlightComponent(hoveredObject);

            // Show detailed info
            showDetailedInfo(hoveredObject);
        }
    });

    // Mouse leave handler
    state.renderer.domElement.addEventListener('mouseleave', () => {
        hideTooltip();
        document.body.style.cursor = 'default';
    });

    function showTooltip(component, x, y) {
        const data = component.userData;

        document.getElementById('info-title').textContent = data.name || 'Component';
        document.getElementById('info-desc').textContent = data.description || '';

        const zoneBadge = document.getElementById('info-zone');
        zoneBadge.className = 'zone-badge';

        if (data.waterproof) {
            zoneBadge.textContent = '💧 WATERPROOF';
            zoneBadge.classList.add('safe');
        } else if (data.zone === 'caution') {
            zoneBadge.textContent = '⚠️ SPLASH RESISTANT';
            zoneBadge.classList.add('caution');
        } else {
            zoneBadge.textContent = '🚫 KEEP DRY';
            zoneBadge.classList.add('danger');
        }

        tooltip.classList.add('visible');
    }

    function hideTooltip() {
        tooltip.classList.remove('visible');
        hoveredObject = null;
    }

    function highlightComponent(component) {
        // Reset all components
        Object.values(state.components).forEach(comp => {
            comp.traverse(child => {
                if (child.isMesh && child.material) {
                    if (child.material.emissive) {
                        child.material.emissiveIntensity = child.userData.originalEmissive || 0;
                    }
                }
            });
        });

        // Highlight selected component
        component.traverse(child => {
            if (child.isMesh && child.material) {
                if (!child.userData.originalEmissive) {
                    child.userData.originalEmissive = child.material.emissiveIntensity || 0;
                }
                if (child.material.emissive) {
                    child.material.emissiveIntensity = 0.5;
                }
            }
        });

        // Auto-unhighlight after 2 seconds
        setTimeout(() => {
            component.traverse(child => {
                if (child.isMesh && child.material && child.material.emissive) {
                    child.material.emissiveIntensity = child.userData.originalEmissive || 0;
                }
            });
        }, 2000);
    }

    function showDetailedInfo(component) {
        console.log('Component Details:', component.userData);
    }
}

// Drag controls for probes (simplified version)
export function enableProbeDragging(state) {
    // This would allow dragging probes in/out of water
    // Implementation would track mouse position and update probe positions
    // For now, we'll keep probes static but this is where drag logic would go
}
