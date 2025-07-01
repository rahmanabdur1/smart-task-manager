

import { Task } from '@/lib/types';
import TaskItem from './TaskItem';
import { memo } from 'react';

interface TaskListProps {
  tasks: Task[];
  onSuggestSubtasks: (task: Task) => Promise<void>;
}

// Memoize TaskList. It only re-renders if 'tasks' array reference or functions change.
const TaskList = memo(function TaskList({ tasks, onSuggestSubtasks }: TaskListProps) {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onSuggestSubtasks={onSuggestSubtasks}
        />
      ))}
    </div>
  );
});

export default TaskList;