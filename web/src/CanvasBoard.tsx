import { useRef, useState } from 'react';
import './CanvasBoard.css';

type CanvasPosition = {
  x: number;
  y: number;
};

function CanvasBoard() {
  const canvasEle = useRef<HTMLCanvasElement>(null);
  const [pos, setPos] = useState<CanvasPosition>({ x: 0, y: 0 });

  const setPosition = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const rect = canvasEle.current?.getBoundingClientRect();
    if (rect == null) {
      return;
    }
    setPos({ x: e.clientX - rect.x, y: e.clientY - rect.y });
  };

  const drawOnCanvas = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const ctx =
      canvasEle.current?.getContext('2d', {
        willReadFrequently: true,
      }) ?? null;
    const rect = canvasEle.current?.getBoundingClientRect();
    if (ctx == null || rect == null) {
      return;
    }
    if (e.buttons !== 1) {
      // left button on mouse needs to be pressed
      return;
    }

    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
    ctx.moveTo(pos.x, pos.y);
    setPosition(e);
    ctx.lineTo(e.clientX - rect.x, e.clientY - rect.y);
    ctx.stroke();
    ctx.closePath();
  };

  const clearCanvas = () => {
    const ctx =
      canvasEle.current?.getContext('2d', {
        willReadFrequently: true,
      }) ?? null;
    const rect = canvasEle.current?.getBoundingClientRect();
    if (ctx == null || rect == null) {
      return;
    }

    ctx.clearRect(0, 0, rect.width, rect.height);
  };

  return (
    <div>
      <canvas
        width='364'
        height='364' // 28px * 13. 28 comes from mnist image size (28 * 28)
        onMouseEnter={drawOnCanvas}
        onMouseMove={drawOnCanvas}
        onMouseDown={setPosition}
        ref={canvasEle}
        id='main-canvas'
      />
      <button onClick={clearCanvas} type='button'>
        Clear
      </button>
    </div>
  );
}

export default CanvasBoard;
