import { Box } from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState, type MouseEvent } from 'react';
import type { Todo } from '../../../shared/types/api';
import { SortableTodoRow } from './SortableTodoRow';
import { TodoRow } from './TodoRow';

interface TodoListProps {
  todos: Todo[];
  onTodoClick: (todo: Todo) => void;
  onReorder?: (todoId: string, newPosition: number) => void;
  onMoveClick?: (todo: Todo, event: MouseEvent<HTMLButtonElement>) => void;
  isDragDisabled?: boolean;
}

export function TodoList({ todos, onTodoClick, onReorder, onMoveClick, isDragDisabled = false }: TodoListProps) {
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const todo = todos.find((t) => t.id === active.id);
    setActiveTodo(todo || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTodo(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1 && onReorder) {
      onReorder(active.id as string, newIndex);
    }
  };

  const handleDragCancel = () => {
    setActiveTodo(null);
  };

  const handleMoveToTop = (todo: Todo) => {
    if (onReorder) {
      onReorder(todo.id, 0);
    }
  };

  const handleMoveToBottom = (todo: Todo) => {
    if (onReorder) {
      onReorder(todo.id, todos.length - 1);
    }
  };

  if (isDragDisabled || !onReorder) {
    // Render without drag-and-drop
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {todos.map((todo) => (
          <TodoRow
            key={todo.id}
            todo={todo}
            onClick={() => onTodoClick(todo)}
            onMoveClick={onMoveClick ? (e) => onMoveClick(todo, e) : undefined}
            showMoveButton={!!onMoveClick}
          />
        ))}
      </Box>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {todos.map((todo) => (
            <SortableTodoRow
              key={todo.id}
              todo={todo}
              onClick={() => onTodoClick(todo)}
              onMoveToTop={() => handleMoveToTop(todo)}
              onMoveToBottom={() => handleMoveToBottom(todo)}
              onMoveClick={onMoveClick ? (e) => onMoveClick(todo, e) : undefined}
            />
          ))}
        </Box>
      </SortableContext>

      <DragOverlay>
        {activeTodo ? (
          <Box
            sx={{
              opacity: 0.9,
              transform: 'scale(1.02)',
              '@media (prefers-reduced-motion: reduce)': {
                transform: 'none',
              },
            }}
          >
            <TodoRow todo={activeTodo} onClick={() => {}} />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

