/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import io from 'socket.io-client';

const socket = io('http://localhost:5175'); // Replace with your backend URL if necessary

export interface User {
  userId: string;
  username: string;
  color?: string
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

const useUserStore = create<StoreState>((set) => ({
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
      set((state) => ({ drawings: [...state.drawings, drawing] }))
    );
  },

  addDrawing: (drawing) => {
    socket.emit('addDrawing', drawing);
  },
}));

export default useUserStore;