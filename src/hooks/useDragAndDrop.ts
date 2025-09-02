"use client";

import { useCallback } from "react";
import { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { FormElement, ElementType } from "@/types/form-elements";
import { FormElementFactory } from "../lib/FormElementFactory";

/**
 * Hook para manejar drag and drop
 * Principio SRP: Una sola responsabilidad - gestión de DnD
 */
export function useDragAndDrop(
  elements: FormElement[],
  addElement: (element: FormElement) => void,
  updateElement: (element: FormElement) => void
) {
  const handleDragStart = useCallback((event: DragStartEvent) => {
    return event.active.id as string;
  }, []);

  const handleDragEnd = useCallback(
    (
      event: DragEndEvent,
      activeId: string | null,
      setActiveId: (id: string | null) => void
    ) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      // Crear nuevo elemento desde sidebar
      if (
        over.id === "canvas" &&
        typeof active.id === "string" &&
        !active.id.startsWith("element-")
      ) {
        const elementType = active.id as ElementType;
        const newElement = FormElementFactory.createElement(
          elementType,
          elements
        );
        if (newElement) {
          addElement(newElement);
        }
      }

      // Mover elemento existente
      if (
        over.id === "canvas" &&
        typeof active.id === "string" &&
        active.id.startsWith("element-")
      ) {
        const elementId = active.id.replace("element-", "");
        const element = elements.find((el) => el.id === elementId);

        if (element && event.delta) {
          const updatedElement = {
            ...element,
            position: {
              x: element.position.x + event.delta.x,
              y: element.position.y + event.delta.y,
            },
          };
          updateElement(updatedElement);
        }
      }
    },
    [elements, addElement, updateElement]
  );

  return {
    handleDragStart,
    handleDragEnd,
  };
}
