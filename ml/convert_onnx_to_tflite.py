
import onnx
import tensorflow as tf # Requires tensorflow installed
from onnx_tf.backend import prepare # Requires onnx-tf installed

ONNX_PATH = "d:/watersafeV2/ml/models/autoencoder.onnx"
TFLITE_PATH = "d:/watersafeV2/ml/models/model_quantized.tflite"

def convert():
    print(f"Loading {ONNX_PATH}...")
    onnx_model = onnx.load(ONNX_PATH)
    
    print("Converting to TF Representation...")
    tf_rep = prepare(onnx_model)
    tf_rep.export_graph("d:/watersafeV2/ml/models/tf_model")
    
    print("Converting to TFLite...")
    converter = tf.lite.TFLiteConverter.from_saved_model("d:/watersafeV2/ml/models/tf_model")
    
    # Quantization
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()
    
    print(f"Saving to {TFLITE_PATH}...")
    with open(TFLITE_PATH, "wb") as f:
        f.write(tflite_model)
        
    print("Done. Now run 'generate_c_header.py'!")

if __name__ == "__main__":
    convert()
