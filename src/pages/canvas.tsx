import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { Stage, Layer, Line } from 'react-konva';
import useUserStore, { Drawing, User } from '../stores/useUserStore';
import { KonvaEventObject } from 'konva/lib/Node';
import { nanoid } from 'nanoid';

const Canvas = () => {
  const navigate = useNavigate();
  const { currentUser, drawings, addDrawing, connectSocket, users } = useUserStore();
  const stageRef = useRef(null);
  const [tool, setTool] = useState('pencil'); 
  const [currentLine, setCurrentLine] = useState<Drawing | null>(null);
  const [brushSize, setBrushSize] = useState(2);

  useEffect(() => {
    if (currentUser && !currentUser.color) {
      const userColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      currentUser.color = userColor;
    }
  }, [currentUser]);

  useEffect(() => {
    const savedDrawings = JSON.parse(sessionStorage.getItem('canvasState') || '[]');
    if (savedDrawings) {
      savedDrawings.forEach((drawing: Drawing) => addDrawing(drawing));
    }
  }, [addDrawing]);

  useEffect(() => {
    sessionStorage.setItem('canvasState', JSON.stringify(drawings));
  }, [drawings]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    connectSocket();
  }, [currentUser, connectSocket, navigate]);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const isErasing = tool === 'eraser'

    const paintingColor = currentUser?.color || '#000000'

    const stage = e.target.getStage();
    if (!stage) return;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    const newLine = {
      id: nanoid(),
      data: {
        tool: 'pencil',
        points: [pos.x, pos.y],
        stroke: isErasing ? '#242424' : paintingColor,
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
      <div className="w-64 p-4">
        <h3 className="text-lg font-bold mb-4">Connected Users</h3>
        <ul className="space-y-2">
          {users.map((user: User) => (
            <li key={user.userId} className="text-sm">
              <span
                className="inline-block w-4 h-4 mr-2 rounded-full"
                style={{ backgroundColor: user.color }}
              ></span>
              {user.username}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="flex space-x-4 mb-4">
          <select
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setTool(e.target.value)}
            value={tool}
          >
            <option value="pencil">Pencil</option>
            <option value="eraser">Eraser</option>
          </select>
          <input
            type="number"
            min="1"
            max="20"
            className="w-16 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:ring-2 focus:ring-red-300"
            onClick={handleClearCanvas}
          >
            Clear Canvas
          </button>
        </div>
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
              <Line key={drawing.id+uuid()} {...drawing.data} />
            ))}
            {currentLine && <Line {...currentLine.data} />}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default Canvas;
