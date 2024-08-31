import { useEffect, useRef, useState } from 'react';
import type * as ort from 'onnxruntime-web';

import './CanvasBoard.css';
import { argMax, initOnnx, runInference, MNIST_IMAGE_SIDE_SIZE } from './mnist';

type CanvasPosition = {
  x: number;
  y: number;
};

const getCanvasContext = (ele: HTMLCanvasElement | null): CanvasRenderingContext2D | null => {
  return ele?.getContext('2d', { willReadFrequently: true }) ?? null;
};

function CanvasBoard() {
  const inputCanvasEle = useRef<HTMLCanvasElement>(null);
  const scaledCanvasEle = useRef<HTMLCanvasElement>(null);
  const [ortSession, setOrtSession] = useState<ort.InferenceSession | undefined>(undefined);
  const [pos, setPos] = useState<CanvasPosition>({ x: 0, y: 0 });
  const [inferenceList, setInferenceList] = useState<Float32Array>(Float32Array.from([]));

  const setPosition = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const rect = inputCanvasEle.current?.getBoundingClientRect();
    if (rect == null) {
      return;
    }
    setPos({ x: e.clientX - rect.x, y: e.clientY - rect.y });
  };

  const drawOnCanvas = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const ctx = getCanvasContext(inputCanvasEle.current);
    const rect = inputCanvasEle.current?.getBoundingClientRect();
    if (ctx == null || rect == null) {
      return;
    }
    if (e.buttons !== 1) {
      // left button on mouse needs to be pressed
      return;
    }

    ctx.beginPath();
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
    ctx.moveTo(pos.x, pos.y);
    setPosition(e);
    ctx.lineTo(e.clientX - rect.x, e.clientY - rect.y);
    ctx.stroke();
    ctx.closePath();
  };

  const clearCanvas = () => {
    const ctx = getCanvasContext(inputCanvasEle.current);
    const scaledCtx = getCanvasContext(scaledCanvasEle.current);

    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    scaledCtx?.clearRect(0, 0, scaledCtx.canvas.width, scaledCtx.canvas.height);
  };

  const mouseUp = async () => {
    const inputCanvas = inputCanvasEle.current;
    const scaledCanvas = scaledCanvasEle.current;
    if (inputCanvas == null || scaledCanvas == null) {
      return;
    }
    const ctx = getCanvasContext(inputCanvas);
    const scaledCtx = getCanvasContext(scaledCanvas);
    if (ctx == null || scaledCtx == null) {
      return;
    }

    // convert inputCanvas data to 28 * 28 size in scaledCanvas
    ctx.save();
    ctx.scale(MNIST_IMAGE_SIDE_SIZE / ctx.canvas.width, MNIST_IMAGE_SIDE_SIZE / ctx.canvas.height);
    ctx.drawImage(inputCanvas, 0, 0);
    const imageData = ctx.getImageData(0, 0, MNIST_IMAGE_SIDE_SIZE, MNIST_IMAGE_SIDE_SIZE);
    scaledCtx.putImageData(imageData, 0, 0);
    scaledCtx.scale(MNIST_IMAGE_SIDE_SIZE / ctx.canvas.width, MNIST_IMAGE_SIDE_SIZE / ctx.canvas.height);
    scaledCtx.drawImage(scaledCanvas, 0, 0);
    const scaledImageData = scaledCtx.getImageData(0, 0, scaledCtx.canvas.width, scaledCtx.canvas.height);
    ctx.restore();
    ctx.clearRect(0, 0, MNIST_IMAGE_SIDE_SIZE, MNIST_IMAGE_SIDE_SIZE);

    // convert canvas imageData to Float32Array for inference
    const inputData: Float32Array = new Float32Array(MNIST_IMAGE_SIDE_SIZE * MNIST_IMAGE_SIDE_SIZE);
    for (let i = 0; i < scaledImageData.data.length; i += 4) {
      // gray scale
      inputData[i / 4] = scaledImageData.data[i + 3] / 255;
    }

    if (ortSession !== undefined) {
      try {
        const results = await runInference(ortSession, inputData);
        const data = results?.['18'].data;
        setInferenceList(data instanceof Float32Array ? data : Float32Array.from([]));
      } catch (e) {
        console.error(e);
      }
    } else {
      console.error('ONNX session is not created');
    }
  };

  useEffect(() => {
    let ignore = false;

    try {
      if (!ignore) {
        initOnnx().then((session) => {
          setOrtSession(session);
          console.log('session initialized');
        });
      }
    } catch (e) {
      console.error('failed to create ONNX session:', e);
    }

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div>
      <div>{inferenceList.length === 0 ? 'None' : argMax(inferenceList)}</div>
      <canvas
        width='308'
        height='308' // 28px * 11. 28 comes from mnist image size (28 * 28)
        onMouseEnter={drawOnCanvas}
        onMouseMove={drawOnCanvas}
        onMouseDown={setPosition}
        onMouseUp={mouseUp}
        ref={inputCanvasEle}
        id='main-canvas'
      />
      <canvas ref={scaledCanvasEle} width={MNIST_IMAGE_SIDE_SIZE} height={MNIST_IMAGE_SIDE_SIZE} style={{}} />
      <button onClick={clearCanvas} type='button'>
        Clear
      </button>
    </div>
  );
}

export default CanvasBoard;
