
import os
import binascii

# Configuration
INPUT_MODEL = "d:/watersafeV2/ml/models/autoencoder.onnx" # Should be .tflite if conversion worked
OUTPUT_HEADER = "d:/watersafeV2/firmware/src/model_data.cpp"

def generate_header():
    if not os.path.exists(INPUT_MODEL):
        print(f"Error: {INPUT_MODEL} not found.")
        return

    print(f"Reading {INPUT_MODEL}...")
    with open(INPUT_MODEL, "rb") as f:
        data = f.read()

    print(f"Generating {OUTPUT_HEADER}...")
    with open(OUTPUT_HEADER, "w") as f:
        f.write('#include "model_data.h"\n\n')
        f.write(f"const int g_model_data_len = {len(data)};\n")
        f.write("const unsigned char g_model_data[] = {\n")
        
        # Hex dump
        for i in range(0, len(data), 12):
            chunk = data[i:i+12]
            hex_str = ", ".join([f"0x{b:02X}" for b in chunk])
            f.write(f"  {hex_str},\n")
            
        f.write("};\n")
    print("Done.")

if __name__ == "__main__":
    generate_header()
