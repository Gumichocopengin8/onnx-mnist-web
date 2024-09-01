import * as ort from 'onnxruntime-web';

ort.env.wasm.wasmPaths = './dist/'; // defined in vite.config.ts as viteStaticCopy()

export const MNIST_IMAGE_SIDE_SIZE = 28;

export const initOnnx = (): Promise<ort.InferenceSession> => {
  const session = ort.InferenceSession.create('./mnist_cnn.onnx', {
    enableProfiling: true,
    executionProviders: ['wasm'],
  });
  return session;
};

export const runInference = async (
  session: ort.InferenceSession,
  inputData: Float32Array
): Promise<ort.InferenceSession.OnnxValueMapType> => {
  const tensor = new ort.Tensor('float32', inputData, [1, 1, MNIST_IMAGE_SIDE_SIZE, MNIST_IMAGE_SIDE_SIZE]);
  const feeds = { 'input.1': tensor };
  const results = await session.run(feeds);
  return results;
};

export const argMax = (output: Float32Array): number => {
  return output.reduce((argmax, n, i) => (n > output[argmax] ? i : argmax), 0);
};

export const getNumberColor = (num: number) => {
  switch (num) {
    case 0:
      return '#9e0142';
    case 1:
      return '#d53e4f';
    case 2:
      return '#f46d43';
    case 3:
      return '#fdae61';
    case 4:
      return '#e6cf22';
    case 5:
      return '#98f5f2';
    case 6:
      return '#9ff992';
    case 7:
      return '#64cead';
    case 8:
      return '#3faaec';
    case 9:
      return '#7a60ec';
    default:
      return 'white';
  }
};
