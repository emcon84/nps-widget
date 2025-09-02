"use client";

import { useState, useCallback } from "react";
import { FormElement } from "@/types/form-elements";

/**
 * Hook para manejar el estado de los elementos del formulario
 * Principio SRP: Una sola responsabilidad - gestión de elementos
 */
export function useFormElements() {
  const [elements, setElements] = useState<FormElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<FormElement | null>(
    null
  );

  const addElement = useCallback((element: FormElement) => {
    setElements((prev) => [...prev, element]);
  }, []);

  const updateElement = useCallback((updatedElement: FormElement) => {
    setElements((prev) =>
      prev.map((el) => (el.id === updatedElement.id ? updatedElement : el))
    );
    setSelectedElement(updatedElement);
  }, []);

  const deleteElement = useCallback((elementId: string) => {
    setElements((prev) => prev.filter((el) => el.id !== elementId));
    setSelectedElement((prev) => (prev?.id === elementId ? null : prev));
  }, []);

  const clearAllElements = useCallback(() => {
    setElements([]);
    setSelectedElement(null);
  }, []);

  const selectElement = useCallback((element: FormElement | null) => {
    setSelectedElement(element);
  }, []);

  return {
    elements,
    selectedElement,
    addElement,
    updateElement,
    deleteElement,
    clearAllElements,
    selectElement,
  };
}
