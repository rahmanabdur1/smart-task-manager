'use client';

import { useEffect, useCallback, useMemo } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import { Task } from '@/lib/types';
import { getGeminiSuggestions, getInitialTasksAction } from '@/lib/actions';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateTask, setAllTasks } from '@/redux/features/tasks/tasksSlice';

export default function Home() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.tasks);

  useEffect(() => {
    const fetchAndSetInitialTasks = async () => {
      try {
        const initialTasks = await getInitialTasksAction();
        dispatch(setAllTasks(initialTasks));
      } catch (error) {
        console.error("Failed to fetch initial tasks:", error);
      }
    };
    fetchAndSetInitialTasks();
  }, [dispatch]);

  const handleSuggestSubtasks = useCallback(async (taskToUpdate: Task) => {
    const prompt = `Break down the task "${taskToUpdate.title}: ${taskToUpdate.description || 'No description provided.'}" into 3-5 smaller, actionable subtasks. Provide them as a comma-separated list, e.g., "Subtask 1, Subtask 2, Subtask 3". Do not include any introductory or concluding sentences.`;

    try {
      const { suggestions, error } = await getGeminiSuggestions(prompt);
      if (error) throw new Error(error);

      const suggestedSubtasks = suggestions
        ? suggestions.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

      dispatch(updateTask({ id: taskToUpdate.id, updatedFields: { subtasks: suggestedSubtasks } }));
    } catch (error: any) {
      console.error('Error from Gemini server action in Home component:', error);
      throw error;
    }
  }, [dispatch]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.status === 'pending' && b.status === 'completed') return -1;
      if (a.status === 'completed' && b.status === 'pending') return 1;
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });
  }, [tasks]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-lg">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold text-center">Smart Task Manager for AI Birthday</h1>
          <p className="text-center text-blue-200 mt-2">Powered by Gemini AI for smart suggestions for AI Birthday</p>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-3xl py-8">
        <TaskForm />
        <h2 className="text-3xl font-bold mt-10 mb-6 text-gray-800 border-b-2 border-blue-300 pb-2">Your Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-center text-gray-600 p-8 bg-white rounded-lg shadow-md">
            No tasks yet. Get started by adding your first task above!
          </p>
        ) : (
          <TaskList
            tasks={sortedTasks}
            onSuggestSubtasks={handleSuggestSubtasks}
          />
        )}
      </main>

      <footer className="bg-gray-800 text-white p-4 text-center mt-10">
        <p>&copy; {new Date().getFullYear()} Smart Task Manager. All rights reserved.</p>
        <p className="text-sm mt-1">Built with Next.js, TypeScript, Tailwind CSS, Redux Toolkit, and Google Gemini AI.</p>
      </footer>
    </div>
  );
}
