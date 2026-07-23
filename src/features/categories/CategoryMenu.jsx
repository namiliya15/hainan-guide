import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableCategoryPill } from './SortableCategoryPill';

export function CategoryMenu({ categoryOrder, activeCategory, counts, onSelect, onReorder }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = categoryOrder.indexOf(active.id);
        const newIndex = categoryOrder.indexOf(over.id);
        onReorder(arrayMove(categoryOrder, oldIndex, newIndex));
      }}
    >
      <SortableContext items={categoryOrder} strategy={horizontalListSortingStrategy}>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 pt-7">
          {categoryOrder.map((category) => (
            <SortableCategoryPill
              key={category}
              category={category}
              active={activeCategory === category}
              count={counts[category] || 0}
              onSelect={onSelect}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
