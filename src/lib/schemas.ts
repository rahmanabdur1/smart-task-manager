

import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z.string().min(1, 'Task title is required.').max(100, 'Title cannot exceed 100 characters.'),
  description: z.string().max(500, 'Description cannot exceed 500 characters.').optional().or(z.literal('')),
  dueDate: z.string().optional().refine(
    (date) => !date || !isNaN(new Date(date).getTime()),
    'Invalid due date format.'
  ).or(z.literal('')), 
});

export type TaskFormInputs = z.infer<typeof taskFormSchema>;