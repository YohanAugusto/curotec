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

/**
 * Custom hook to manage canvas state and socket interactions.
 *
 * @typedef {Object} StoreState
 * @property {Array} users - List of users connected to the canvas.
 * @property {Array} drawings - List of drawings on the canvas.
 * @property {Object|null} currentUser - The current user interacting with the canvas.
 * @property {Function} addUser - Function to add a new user.
 * @property {Function} connectSocket - Function to establish socket connections and handle events.
 * @property {Function} addDrawing - Function to add a new drawing.
 *
 * @function addUser
 * @param {string} username - The username of the user to be added.
 * @description Adds a new user to the canvas and emits the 'addUser' event via socket.
 *
 * @function connectSocket
 * @description Establishes socket connections and sets up event listeners for 'updateUsers' and 'newDrawing' events.
 * Also restores saved drawings from session storage.
 *
 * @function addDrawing
 * @param {Object} drawing - The drawing object to be added.
 * @description Emits the 'addDrawing' event via socket to add a new drawing.
 */
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
