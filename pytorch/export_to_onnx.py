# Convert pt file to onnx file
import torch
from mnist import Net
from onnxruntime.quantization import quantize_dynamic, QuantType, quant_pre_process
from pathlib import Path

MODEL_PATH = Path("./mnist_cnn.pt")
INTERMEDIATE_OUTPUT_DIR = Path(".")
WEB_OUTPUT_DIR = Path("../web/public")
ONNX_OUTPUT = "mnist_cnn.onnx"
ONNX_QUANT_PREPROCESS_OUTPUT = "mnist_cnn.infer.onnx"
ONNX_QUANT_OUTPUT = "mnist_cnn.quant.onnx"


def quantizate_onnx_model():
    # Quantization
    # https://github.com/microsoft/onnxruntime-inference-examples/blob/main/quantization/image_classification/cpu/ReadMe.md
    quant_pre_process(
        input_model=INTERMEDIATE_OUTPUT_DIR / ONNX_OUTPUT,
        output_model_path=INTERMEDIATE_OUTPUT_DIR / ONNX_QUANT_PREPROCESS_OUTPUT,
    )
    quantize_dynamic(
        model_input=INTERMEDIATE_OUTPUT_DIR / ONNX_QUANT_PREPROCESS_OUTPUT,
        model_output=WEB_OUTPUT_DIR / ONNX_QUANT_OUTPUT,
        weight_type=QuantType.QUInt8,  # bug: https://github.com/microsoft/onnxruntime/issues/15888#issuecomment-1856864610
    )


def main():
    mnist_model = Net()
    mnist_model.load_state_dict(torch.load(MODEL_PATH))
    mnist_model.eval()
    dymmy_input = torch.zeros(1, 1, 28, 28)
    torch.onnx.export(
        mnist_model, dymmy_input, INTERMEDIATE_OUTPUT_DIR / ONNX_OUTPUT, verbose=True
    )
    quantizate_onnx_model()


if __name__ == "__main__":
    main()
