
try:
    import onnx
    print("onnx: ok")
except ImportError:
    print("onnx: missing")

try:
    import tensorflow as tf
    print("tensorflow: ok")
except ImportError:
    print("tensorflow: missing")

try:
    import onnx_tf
    print("onnx_tf: ok")
except ImportError:
    print("onnx_tf: missing")
