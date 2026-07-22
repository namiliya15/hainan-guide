import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableCategoryPill({ category, active, count, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={() => onSelect(category)}
      {...attributes}
      {...listeners}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'border-lagoon bg-lagoon text-white dark:border-aqua dark:bg-aqua dark:text-night'
          : 'border-sand-300 bg-white text-slate-600 hover:bg-sand-200 dark:border-night-surface2 dark:bg-night-surface dark:text-mist dark:hover:bg-night-surface2'
      } ${isDragging ? 'opacity-70' : ''}`}
    >
      {category}
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          active ? 'bg-white/20' : 'bg-sand-200 text-slate-600 dark:bg-night-surface2 dark:text-mist'
        }`}
      >
        {count}
      </span>
    </button>
  );
}
