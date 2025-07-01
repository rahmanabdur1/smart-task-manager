
'use client';

import { useState, memo, useEffect, useCallback } from 'react';
import { Task, FormState } from '@/lib/types';
import TaskForm from './TaskForm';
import { useActionState } from 'react';
import { deleteTaskAction, toggleTaskStatusAction } from '@/lib/actions';
import { useAppDispatch } from '@/redux/hooks';
import { deleteTask, updateTask } from '@/redux/features/tasks/tasksSlice';

interface TaskItemProps {
  task: Task;
  onSuggestSubtasks: (task: Task) => Promise<void>;
}

const TaskItem = memo(function TaskItem({ task, onSuggestSubtasks }: TaskItemProps) {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingSubtasks, setIsLoadingSubtasks] = useState(false);
  const [subtaskError, setSubtaskError] = useState<string | null>(null);

  const [deleteState, deleteAction] = useActionState<FormState, FormData>(
    (prevState, formData) => deleteTaskAction(formData.get('taskId') as string),
    {}
  );

  const [toggleStatusState, toggleStatusAction] = useActionState<FormState, FormData>(
    (prevState, formData) => toggleTaskStatusAction(
      formData.get('taskId') as string,
      formData.get('currentStatus') as 'pending' | 'completed'
    ),
    {}
  );

  useEffect(() => {
    if (deleteState.success) {
      dispatch(deleteTask(task.id));
    }
    if (toggleStatusState.success && toggleStatusState.newStatus) {
      dispatch(updateTask({ id: task.id, updatedFields: { status: toggleStatusState.newStatus } }));
    }
  }, [deleteState, toggleStatusState, dispatch, task.id]);

  const handleToggleStatus = useCallback(() => {
    const formData = new FormData();
    formData.append('taskId', task.id);
    formData.append('currentStatus', task.status);
    toggleStatusAction(formData);
  }, [task.id, task.status, toggleStatusAction]);

  const handleDelete = useCallback(() => {
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      const formData = new FormData();
      formData.append('taskId', task.id);
      deleteAction(formData);
    }
  }, [task.id, deleteAction]);

  const handleSuggest = useCallback(async () => {
    setIsLoadingSubtasks(true);
    setSubtaskError(null);
    try {
      await onSuggestSubtasks(task);
    } catch (error: any) {
      setSubtaskError(error.message || 'Could not fetch subtasks. Please try again.');
    } finally {
      setIsLoadingSubtasks(false);
    }
  }, [task, onSuggestSubtasks]);

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md transition-all duration-200 ease-in-out
      ${task.status === 'completed' ? 'opacity-75 border-l-4 border-green-500' : 'border-l-4 border-blue-500'}`}>
      {isEditing ? (
        <TaskForm
          initialTask={task}
          onCancelEdit={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
            <h3 className={`text-xl font-semibold break-words pr-2 ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.title}</h3>
            <span className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap
              ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span>
          </div>

          {task.description && (
            <p className="text-gray-600 mb-2 whitespace-pre-wrap">{task.description}</p>
          )}

          {task.dueDate && (
            <p className="text-sm text-gray-500 mb-2">
              <span className="font-medium">Due Date:</span> {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <h4 className="font-semibold text-blue-700 text-sm mb-2">Suggested Subtasks:</h4>
              <ul className="list-disc list-inside text-blue-800 text-sm">
                {task.subtasks.map((subtask, index) => (
                  <li key={index}>{subtask}</li>
                ))}
              </ul>
            </div>
          )}

          {subtaskError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md" role="alert">
              <p className="font-bold">Error:</p>
              <p>{subtaskError}</p>
              <p className="text-xs mt-1">Please check your API key, internet connection, or try a different prompt.</p>
            </div>
          )}

          {deleteState.message && !deleteState.success && (
            <p className="text-red-500 text-sm mt-2">{deleteState.message}</p>
          )}
          {toggleStatusState.message && !toggleStatusState.success && (
            <p className="text-red-500 text-sm mt-2">{toggleStatusState.message}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2 justify-end">
            <button
              onClick={handleToggleStatus}
              className={`py-1 px-3 rounded text-sm font-medium transition duration-150 ease-in-out
                ${task.status === 'completed' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
              disabled={Boolean(deleteState.message && !deleteState.success) || Boolean(toggleStatusState.message && !toggleStatusState.success)}
            >
              Mark as {task.status === 'completed' ? 'Pending' : 'Completed'}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="py-1 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition duration-150 ease-in-out"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="py-1 px-3 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition duration-150 ease-in-out"
              disabled={Boolean(deleteState.message && !deleteState.success)}
            >
              Delete
            </button>
            <button
              onClick={handleSuggest}
              disabled={isLoadingSubtasks}
              className="py-1 px-3 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {isLoadingSubtasks ? 'Suggesting...' : 'Suggest Subtasks (AI)'}
            </button>
          </div>
        </>
      )}
    </div>
  );
});

export default TaskItem;