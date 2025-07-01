export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  dueDate?: string; 
  subtasks?: string[]; 
}


export type FormState = {
  errors?: {
    title?: string[];
    description?: string[];
    dueDate?: string[];
    _form?: string[];
  };
  message?: string;
  success?: boolean;
  newTask?: Task;
  updatedTask?: Partial<Task>;
  newStatus?: 'pending' | 'completed';
};