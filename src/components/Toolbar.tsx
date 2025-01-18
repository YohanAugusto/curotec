import React from 'react';

interface ToolbarProps {
    tool: string;
    setTool: (tool: string) => void;
    brushSize: number;
    setBrushSize: (size: number) => void;
    handleClearCanvas: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ tool, setTool, brushSize, setBrushSize, handleClearCanvas }) => {
    return (
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
    );
};

export default Toolbar;