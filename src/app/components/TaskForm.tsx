'use client';

import { useEffect, useRef, memo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskFormSchema, TaskFormInputs } from '@/lib/schemas';
import { useActionState } from 'react';
import { addTaskAction, updateTaskAction } from '@/lib/actions';
import { FormState, Task } from '@/lib/types';
import { useAppDispatch } from '@/redux/hooks';
import { addTask, updateTask } from '@/redux/features/tasks/tasksSlice';

interface TaskFormProps {
  initialTask?: Task; 
  onCancelEdit?: () => void; 
}

const TaskForm = memo(function TaskForm({ initialTask, onCancelEdit }: TaskFormProps) {
  const dispatch = useAppDispatch();
  const formRef = useRef<HTMLFormElement>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const submitAction = initialTask
    ? updateTaskAction.bind(null, initialTask.id) 
    : addTaskAction;

  const [formState, formAction] = useActionState<FormState, FormData>(
    submitAction,
    {} 
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty }, 
    setError,
  } = useForm<TaskFormInputs>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialTask?.title || '',
      description: initialTask?.description || '',
      dueDate: initialTask?.dueDate || '',
    },
  });

  useEffect(() => {
    if (initialTask) {
      reset({
        title: initialTask.title,
        description: initialTask.description,
        dueDate: initialTask.dueDate,
      });
    } else {
      if (formState.success && !isDirty) { 
          reset();
      }
    }
  }, [initialTask, formState.success, isDirty, reset]);

  useEffect(() => {
    if (formState?.errors) {
      for (const [field, messages] of Object.entries(formState.errors)) {
        if (field in errors) {
          setError(field as keyof TaskFormInputs, { type: 'server', message: messages?.[0] });
        } else {
          setGeneralError(messages?.[0] || 'An unexpected error occurred.');
        }
      }
    }

    if (formState.success) {
      if (initialTask && formState.updatedTask) {
        dispatch(updateTask({ id: initialTask.id, updatedFields: formState.updatedTask }));
      } else if (formState.newTask) {
        dispatch(addTask(formState.newTask));
      }
    }
  }, [formState, dispatch, initialTask, errors, setError, reset]);

  const onSubmitForm = handleSubmit(async (data: TaskFormInputs) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('dueDate', data.dueDate || '');

    formAction(formData);
  });

  return (
    <form ref={formRef} onSubmit={onSubmitForm} className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {initialTask ? 'Edit Task' : 'Add New Task'}
      </h2>
      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
          Task Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          {...register('title')}
          placeholder="e.g., Plan birthday party"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        {errors.title && <p className="text-red-500 text-xs italic mt-1">{errors.title.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          placeholder="e.g., Book venue, send invitations, order cake"
          rows={3}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        ></textarea>
        {errors.description && <p className="text-red-500 text-xs italic mt-1">{errors.description.message}</p>}
      </div>

      <div className="mb-6">
        <label htmlFor="dueDate" className="block text-gray-700 text-sm font-bold mb-2">
          Due Date (Optional)
        </label>
        <input
          type="date"
          id="dueDate"
          {...register('dueDate')}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        {errors.dueDate && <p className="text-red-500 text-xs italic mt-1">{errors.dueDate.message}</p>}
      </div>

      {formState.message && formState.success && (
        <p className="text-green-600 text-sm mb-4">{formState.message}</p>
      )}
      {generalError && (
        <p className="text-red-600 text-sm mb-4">{generalError}</p>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-end sm:justify-between gap-3">
        {initialTask && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="w-full sm:w-auto bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
            disabled={isSubmitting}
          >
            Cancel Edit
          </button>
        )}
        <button
          type="submit"
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
          disabled={isSubmitting}
        >
          {isSubmitting ? (initialTask ? 'Updating...' : 'Adding...') : (initialTask ? 'Update Task' : 'Add Task')}
        </button>
      </div>
    </form>
  );
});

export default TaskForm;