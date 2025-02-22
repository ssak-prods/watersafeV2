#ifndef ML_INFERENCE_H
#define ML_INFERENCE_H

#include "sensors.h"

// Initialize the ML model
bool ml_setup();

// Run inference on the sensor data
// Returns true if anomaly detected
bool ml_check_anomaly(SensorData data);

// Get the last reconstruction error (for debugging/telemetry)
float ml_get_last_error();

#endif
