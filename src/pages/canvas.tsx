import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { Stage, Layer, Line } from 'react-konva';
import useUserStore, { Drawing } from '../stores/useUserStore';
import { KonvaEventObject } from 'konva/lib/Node';
import { nanoid } from 'nanoid';
import UserList from '../components/UserList';
import Toolbar from '../components/Toolbar';

const DEFAULT_BRUSH_SIZE = 2;
const DEFAULT_TOOL = 'pencil';
const DEFAULT_COLOR = '#000000';
const ERASER_COLOR = '#242424';

const Canvas = () => {
  const navigate = useNavigate();
  const { currentUser, drawings, addDrawing, connectSocket } = useUserStore();
  const stageRef = useRef(null);
  const [tool, setTool] = useState(DEFAULT_TOOL);
  const [currentLine, setCurrentLine] = useState<Drawing | null>(null);
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH_SIZE);

  useEffect(() => {
    if (currentUser && !currentUser.color) {
      const userColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      currentUser.color = userColor;
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    connectSocket();
  }, [currentUser, connectSocket, navigate]);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const isErasing = tool === 'eraser';
    const paintingColor = currentUser?.color || DEFAULT_COLOR;

    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const newLine = {
      id: nanoid(),
      data: {
        tool: 'pencil',
        points: [pos.x, pos.y],
        stroke: isErasing ? ERASER_COLOR : paintingColor,
        strokeWidth: brushSize,
        lineCap: 'round',
        lineJoin: 'round',
      },
    };
    setCurrentLine(newLine);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!currentLine) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const point = stage.getPointerPosition();
    if (!point) return;
    const updatedPoints = [...currentLine.data.points, point.x, point.y];
    setCurrentLine({ ...currentLine, data: { ...currentLine.data, points: updatedPoints } });
  };

  const handleMouseUp = () => {
    if (currentLine) {
      addDrawing(currentLine);
      setCurrentLine(null);
    }
  };

  const handleClearCanvas = () => {
    sessionStorage.removeItem('canvasState');
    window.location.reload();
  };

  return (
    <div className="flex flex-row items-start">
      <UserList />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Toolbar
          tool={tool}
          setTool={setTool}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          handleClearCanvas={handleClearCanvas}
        />
        <Stage
          ref={stageRef}
          width={window.innerWidth - 256}
          height={window.innerHeight}
          className="border border-gray-300"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layer>
            {drawings.map((drawing) => (
              <Line key={drawing.id + uuid()} {...drawing.data} />
            ))}
            {currentLine && <Line {...currentLine.data} />}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default Canvas;
