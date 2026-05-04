"use client";

/**
 * SortableStepList — dnd-kit-powered drag-to-reorder for the
 * recipe-authoring step list. The W23 `reorderSteps` helper
 * does the array manipulation + 1..N renumbering; this
 * component handles the gesture (pointer / touch / keyboard).
 *
 * W38 from STAGE-3-VIBECODE-AUTONOMOUS-12MO.md (Sprint H W37-W41).
 * `dnd-kit` was queued as the master pick in
 * `docs/LIBRARY-RECOMMENDATIONS.md` since H1; W38 is the first
 * UI consumer.
 *
 * Drag-handle pattern: a dedicated grip zone (GripVertical icon)
 * is the only element that initiates a drag. The textarea body
 * stays free for typing — important because the user is mid-
 * authoring when they reorder.
 *
 * Touch + keyboard accessibility comes free with dnd-kit:
 * PointerSensor handles mouse/touch, KeyboardSensor binds Space
 * to pick-up + arrows to move + Space to drop.
 */

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { reorderSteps } from "@/lib/recipe-authoring/recipe-draft";
import type { UserStep } from "@/types/user-recipe";
import { cn } from "@/lib/utils/cn";

export interface SortableStepListProps {
  /** Stable RHF field ids keyed alongside each step. */
  fieldIds: ReadonlyArray<string>;
  steps: ReadonlyArray<UserStep>;
  /** Render the textarea + register the RHF field. The parent
   *  owns the form so it doesn't have to pass `register` /
   *  `control` through. */
  renderStepInstruction: (idx: number) => React.ReactNode;
  /** W41 optional details slot. When provided, each step gets a
   *  chevron toggle that expands an inline details panel under
   *  the textarea (timer, mistake warning, quick hack, cuisine
   *  fact, doneness cue, image URL). The parent renders the
   *  fields so it stays the single owner of `form.register`. */
  renderStepDetails?: (idx: number) => React.ReactNode;
  /** Called with the reordered + renumbered list. Caller
   *  forwards into `useFieldArray.replace`. */
  onReorder: (next: UserStep[]) => void;
  onRemove: (idx: number) => void;
  canRemove: boolean;
}

export function SortableStepList({
  fieldIds,
  steps,
  renderStepInstruction,
  renderStepDetails,
  onReorder,
  onRemove,
  canRemove,
}: SortableStepListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Small activation distance so single-tap to focus the
      // textarea doesn't accidentally start a drag.
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIdx = fieldIds.indexOf(active.id as string);
    const toIdx = fieldIds.indexOf(over.id as string);
    if (fromIdx === -1 || toIdx === -1) return;
    onReorder(reorderSteps(steps, fromIdx, toIdx));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={[...fieldIds]}
        strategy={verticalListSortingStrategy}
      >
        <ol className="space-y-2">
          {fieldIds.map((id, idx) => (
            <SortableItem
              key={id}
              id={id}
              idx={idx}
              renderStepInstruction={renderStepInstruction}
              renderStepDetails={renderStepDetails}
              onRemove={() => onRemove(idx)}
              canRemove={canRemove}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({
  id,
  idx,
  renderStepInstruction,
  renderStepDetails,
  onRemove,
  canRemove,
}: {
  id: string;
  idx: number;
  renderStepInstruction: (idx: number) => React.ReactNode;
  renderStepDetails?: (idx: number) => React.ReactNode;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const [detailsOpen, setDetailsOpen] = useState(false);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-neutral-100 bg-neutral-50/60 p-2 transition-shadow",
        isDragging && "z-10 shadow-lg",
      )}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle — only this zone initiates the drag, so the
            textarea body stays free for typing. */}
        <button
          type="button"
          aria-label={`Reorder step ${idx + 1}`}
          className="flex h-6 w-6 shrink-0 cursor-grab items-center justify-center rounded-md text-neutral-300 hover:text-neutral-500 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
        <span className="mt-1.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--nourish-green)]/10 text-[11px] font-semibold text-[var(--nourish-green)]">
          {idx + 1}
        </span>
        {renderStepInstruction(idx)}
        {renderStepDetails && (
          <button
            type="button"
            onClick={() => setDetailsOpen((v) => !v)}
            aria-expanded={detailsOpen}
            aria-label={`${detailsOpen ? "Hide" : "Show"} details for step ${idx + 1}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-[var(--nourish-dark)]"
          >
            <ChevronDown
              size={14}
              className={cn(
                "transition-transform",
                detailsOpen && "rotate-180",
              )}
            />
          </button>
        )}
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove step ${idx + 1}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-[var(--nourish-dark)]"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
      {renderStepDetails && detailsOpen && (
        <div className="mt-2 border-t border-neutral-100 pt-2 pl-8">
          {renderStepDetails(idx)}
        </div>
      )}
    </li>
  );
}
