'use server';

import { Task, FormState } from './types';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { revalidatePath } from 'next/cache';
import { taskFormSchema } from './schemas';
import { ZodError } from 'zod';

let serverTasks: Task[] = [];

if (serverTasks.length === 0) {
  serverTasks.push({ id: uuidv4(), title: "MY Friend Birthday", description: "Plan a surprise birthday party for your friend, including gifts, cake, and decorations.", status: "pending", dueDate: "2025-07-15" });
  serverTasks.push({ id: uuidv4(), title: "MY Sister Birthday", description: "Organize a memorable birthday celebration for your sister, complete with a special dinner and thoughtful presents.", status: "completed", dueDate: "2025-06-28" });
  serverTasks.push({ id: uuidv4(), title: "AI Birthday", description: "Celebrate the 'birthday' of an AI model, perhaps by running a fun simulation or generating creative content.", status: "pending", dueDate: "2025-07-10" });
}

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export async function getGeminiSuggestions(prompt: string): Promise<{ suggestions: string | null; error: string | null }> {
  if (!genAI) {
    return { suggestions: null, error: 'AI service not available. My AI API key is not configured. Please wait or contact support.' };
  }

  if (!prompt) {
    return { suggestions: null, error: 'Prompt is required for AI suggestions.' };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return { suggestions: text, error: null };
  } catch (error: any) {
    console.error('SERVER ACTION: Gemini API Error:', error);
    let errorMessage = 'Failed to get suggestions from AI.';

    if (error.response && error.response.status) {
      if (error.response.status === 403) {
        errorMessage = 'AI service not available. My AI API key is not valid. Please wait.';
      } else if (error.response.status === 429) {
        errorMessage = 'AI service is busy due to high traffic. Please try again in a moment.';
      } else if (error.response.status === 404 && error.message.includes('models/gemini-pro is not found')) {
        errorMessage = 'AI model temporarily unavailable or incorrect version. Please try again later.';
      } else {
        errorMessage = `AI service encountered an issue (${error.response.status}). Please try again.`;
      }
    } else if (error.message && error.message.includes('API key not valid')) {
      errorMessage = 'AI service not available. My AI API key is not valid. Please wait.';
    } else {
      errorMessage = 'Network error or AI service is unreachable. Please check your internet connection.';
    }

    if (errorMessage.includes('API key is not valid') || errorMessage.includes('API key is not configured')) {
      errorMessage += ' My AI API key not available for you. plz wait';
    }

    return { suggestions: null, error: errorMessage };
  }
}

export async function addTaskAction(
  prevState: FormState, 
  formData: FormData
): Promise<FormState & { newTask?: Task }> { 
  const parsed = taskFormSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    dueDate: formData.get('dueDate'),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: 'Failed to add task due to validation errors.',
      success: false,
    };
  }

  const newTask: Task = {
    id: uuidv4(), 
    title: parsed.data.title,
    description: parsed.data.description,
    status: 'pending',
    dueDate: parsed.data.dueDate,
  };

  serverTasks.push(newTask);
  revalidatePath('/'); 

  return { message: 'Task added successfully!', success: true, newTask };
}

export async function updateTaskAction(
  taskId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState & { updatedTask?: Partial<Task> }> {
  const parsed = taskFormSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    dueDate: formData.get('dueDate'),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: 'Failed to update task due to validation errors.',
      success: false,
    };
  }

  const taskIndex = serverTasks.findIndex(task => task.id === taskId);
  if (taskIndex > -1) {
    const updatedFields: Partial<Task> = {
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: parsed.data.dueDate,
    };
    serverTasks[taskIndex] = { ...serverTasks[taskIndex], ...updatedFields };
    revalidatePath('/');
    return { message: 'Task updated successfully!', success: true, updatedTask: updatedFields };
  }

  return { message: 'Task not found for update.', success: false };
}

export async function deleteTaskAction(taskId: string): Promise<FormState> {
  const initialLength = serverTasks.length;
  serverTasks = serverTasks.filter((task) => task.id !== taskId);
  if (serverTasks.length < initialLength) {
    revalidatePath('/');
    return { message: 'Task deleted successfully!', success: true };
  }
  return { message: 'Task not found for deletion.', success: false };
}

export async function toggleTaskStatusAction(
  taskId: string,
  currentStatus: 'pending' | 'completed'
): Promise<FormState & { newStatus?: 'pending' | 'completed' }> {
  const taskIndex = serverTasks.findIndex(task => task.id === taskId);
  if (taskIndex > -1) {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    serverTasks[taskIndex].status = newStatus;
    revalidatePath('/');
    return { message: 'Status updated!', success: true, newStatus };
  }
  return { message: 'Task not found.', success: false };
}

export async function getInitialTasksAction(): Promise<Task[]> {
  return serverTasks;
}
