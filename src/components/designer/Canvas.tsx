"use client";

import React from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { FormElement } from "@/types/form-elements";
import { ElementRenderer } from "./ElementRenderer";
import { X } from "lucide-react";

interface CanvasProps {
  elements: FormElement[];
  selectedElement: FormElement | null;
  onSelectElement: (element: FormElement | null) => void;
  onUpdateElement: (element: FormElement) => void;
  onDeleteElement: (elementId: string) => void;
}

interface DraggableElementProps {
  element: FormElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (element: FormElement) => void;
  onDelete: () => void;
}

function DeleteButton({
  onDelete,
  elementId,
  isSelected,
}: {
  onDelete: () => void;
  elementId: string;
  isSelected?: boolean;
}) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Delete button clicked for element:", elementId);
    onDelete();
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={`absolute -top-2 -right-2 w-8 h-8 sm:w-6 sm:h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 z-50 ${
        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      }`}
      title="Delete element"
      type="button"
      style={{
        pointerEvents: "auto",
        touchAction: "none",
      }}
      data-no-dnd="true"
    >
      <X size={14} />
    </button>
  );
}

interface CanvasProps {
  elements: FormElement[];
  selectedElement: FormElement | null;
  onSelectElement: (element: FormElement | null) => void;
  onUpdateElement: (element: FormElement) => void;
  onDeleteElement: (elementId: string) => void;
}

interface DraggableElementProps {
  element: FormElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (element: FormElement) => void;
  onDelete: () => void;
}

function DraggableElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: DraggableElementProps) {
  const [dragDisabled, setDragDisabled] = React.useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `element-${element.id}`,
      disabled: dragDisabled,
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    left: element.position.x,
    top: element.position.y,
  };

  const handleDelete = () => {
    onDelete();
  };

  const handleSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect();
  };

  // Filtrar listeners para excluir el botón de eliminar
  const filteredListeners = dragDisabled
    ? {}
    : {
        ...listeners,
        onPointerDown: (e: React.PointerEvent) => {
          const target = e.target as HTMLElement;
          if (
            target.closest('[data-no-dnd="true"]') ||
            target.closest('[data-selection="true"]')
          ) {
            return;
          }
          listeners?.onPointerDown?.(e);
        },
      };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        absolute select-none transition-transform duration-200
        ${isDragging ? "opacity-50 z-50 cursor-grabbing scale-105" : "z-10"}
        ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""}
        ${dragDisabled ? "cursor-pointer" : "cursor-move"}
        p-1 sm:p-0
      `}
      {...filteredListeners}
      {...attributes}
    >
      <div className="relative group">
        <button
          onClick={handleSelection}
          onMouseEnter={() => setDragDisabled(true)}
          onMouseLeave={() => setDragDisabled(false)}
          onTouchStart={() => setDragDisabled(true)}
          onTouchEnd={() => setDragDisabled(false)}
          className="absolute inset-0 cursor-pointer z-10 bg-transparent border-none touch-manipulation"
          style={{ pointerEvents: "auto" }}
          data-selection="true"
          title="Click to select element"
        />

        <div
          style={{
            width: element.dimensions?.width || 300,
            height: element.dimensions?.height || 120,
            minWidth: "280px", // Ensure minimum width on mobile
          }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <ElementRenderer
            element={element}
            isPreview={false}
            onUpdate={onUpdate}
          />
        </div>

        {/* Delete button */}
        <DeleteButton
          onDelete={handleDelete}
          elementId={element.id}
          isSelected={isSelected}
        />
      </div>
    </div>
  );
}

export function Canvas({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
}: CanvasProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "canvas",
  });

  return (
    <div className="h-full w-full">
      <div
        ref={setNodeRef}
        className={`
          w-full h-full relative bg-white
          ${isOver ? "bg-blue-50" : ""}
          min-h-full
        `}
        onClick={() => onSelectElement(null)}
        style={{
          backgroundImage: `
            radial-gradient(circle, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      >
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-gray-400 text-4xl sm:text-6xl mb-4">📋</div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                Start Building Your Survey
              </h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-md">
                <span className="hidden sm:inline">
                  Drag elements from the left sidebar to create your NPS survey.
                </span>
                <span className="sm:hidden">
                  Tap the + button to add elements to your survey.
                </span>{" "}
                Click on elements to customize their properties.
              </p>
            </div>
          </div>
        )}

        {elements.map((element) => (
          <DraggableElement
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
            onSelect={() => onSelectElement(element)}
            onUpdate={onUpdateElement}
            onDelete={() => onDeleteElement(element.id)}
          />
        ))}

        {/* Canvas guidelines */}
        <div className="absolute top-4 left-4 text-xs text-gray-400 pointer-events-none">
          Canvas: {elements.length} element{elements.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
