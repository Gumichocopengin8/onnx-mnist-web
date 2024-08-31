# Convert pt file to onnx file
import torch
from mnist import Net
from pathlib import Path


def main():
    MODEL_PATH = Path("./mnist_cnn.pt")
    mnist_model = Net()
    mnist_model.load_state_dict(torch.load(MODEL_PATH))
    mnist_model.eval()
    dymmy_input = torch.zeros(1, 1, 28, 28)
    torch.onnx.export(
        mnist_model, dymmy_input, "../web/public/mnist_cnn.onnx", verbose=True
    )


if __name__ == "__main__":
    main()
