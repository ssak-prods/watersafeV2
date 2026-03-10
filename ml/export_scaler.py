
import joblib
import numpy as np
import os

SCALER_PATH = "d:/watersafeV2/ml/models/scaler.save"

def export_scaler():
    if not os.path.exists(SCALER_PATH):
        print("Scaler file not found!")
        return

    scaler = joblib.load(SCALER_PATH)
    
    print("// --- GENERATED SCALER CONSTANTS ---")
    print("// Paste these into firmware/src/ml_inference.cpp")
    print(f"float MEAN_PH = {scaler.mean_[0]:.4f}f;")
    print(f"float MEAN_TURB = {scaler.mean_[1]:.4f}f;")
    print(f"float MEAN_TDS = {scaler.mean_[2]:.4f}f;")
    print(f"float MEAN_TEMP = {scaler.mean_[3]:.4f}f;")
    print("")
    print(f"float SCALE_PH = {scaler.scale_[0]:.4f}f;")
    print(f"float SCALE_TURB = {scaler.scale_[1]:.4f}f;")
    print(f"float SCALE_TDS = {scaler.scale_[2]:.4f}f;")
    print(f"float SCALE_TEMP = {scaler.scale_[3]:.4f}f;")

if __name__ == "__main__":
    export_scaler()
