

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '@/lib/types';

interface TasksState {
  tasks: Task[];
}

const initialState: TasksState = {
  tasks: [],
};

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Action to set all tasks (typically used after an initial fetch from the server)
    setAllTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    // Action to add a single task
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    // Action to update a task by ID
    updateTask: (state, action: PayloadAction<{ id: string; updatedFields: Partial<Task> }>) => {
      const { id, updatedFields } = action.payload;
      const existingTask = state.tasks.find((task) => task.id === id);
      if (existingTask) {
        Object.assign(existingTask, updatedFields);
      }
    },
    // Action to delete a task by ID
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },
  },
});

export const { setAllTasks, addTask, updateTask, deleteTask } = tasksSlice.actions;

export default tasksSlice.reducer;