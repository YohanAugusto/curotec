/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import io from 'socket.io-client';

const socket = io('http://localhost:5175'); // In case you have a backend in another server, replace with your URL if necessary

export interface User {
  userId: string;
  username: string;
  color?: string;
}

export interface Drawing {
  id: string;
  data: any;
}

interface StoreState {
  users: User[];
  drawings: Drawing[];
  currentUser: User | null;
  addUser: (username: string) => void;
  connectSocket: () => void;
  addDrawing: (drawing: Drawing) => void;
}

const useCanvas = create<StoreState>((set) => ({
  users: [],
  drawings: [],
  currentUser: null,

  addUser: (username) => {
    const user = { userId: Date.now().toString(), username };
    socket.emit('addUser', user);
    set({ currentUser: user });
  },

  connectSocket: () => {
    socket.on('updateUsers', (users) => set({ users }));

    socket.on('newDrawing', (drawing) =>
      set((state) => {
        const updatedDrawings = [...state.drawings, drawing];
        sessionStorage.setItem('canvasState', JSON.stringify(updatedDrawings));
        return { drawings: updatedDrawings };
      })
    );

    // Load persisted state from session storage
    const savedDrawings = JSON.parse(sessionStorage.getItem('canvasState') || '[]');
    if (savedDrawings.length > 0) {
      savedDrawings.forEach((drawing: Drawing) => socket.emit('newDrawing', drawing));
      set({ drawings: savedDrawings });
    }
  },

  addDrawing: (drawing) => {
    socket.emit('addDrawing', drawing);
  }
}));

export default useCanvas;
