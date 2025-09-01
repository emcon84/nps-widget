"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";

import { RightSidebar } from "./RightSidebar";
import { Canvas } from "./Canvas";
import { FormElement, ElementType } from "@/types/form-elements";
import { LeftSidebar } from "./LeftSidebar";
import { PreviewMode } from "./PreviewMode";
import { CodeExport } from "./CodeExport";
import { FormSettings } from "./FormSettings";

interface FormDesignerProps {
  initialElements?: FormElement[];
  initialSettings?: any;
  initialStyle?: any;
  onSave?: (data: {
    elements: FormElement[];
    settings: any;
    style: any;
  }) => void;
  saveButtonText?: React.ReactNode;
  isLoading?: boolean;
}

export function FormDesignerWithProps({
  initialElements = [],
  initialSettings = {
    submitEndpoint: "",
    submitMethod: "POST" as "POST" | "PUT" | "PATCH",
    webhookHeaders: {},
    successMessage: "¡Gracias por tu feedback!",
    errorMessage: "Error al enviar. Por favor intenta de nuevo.",
  },
  initialStyle = {
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    primaryColor: "#3b82f6",
    borderRadius: 8,
    fontFamily: "Inter",
  },
  onSave,
  saveButtonText = "Save",
  isLoading = false,
}: FormDesignerProps) {
  const [elements, setElements] = useState<FormElement[]>(initialElements);
  const [selectedElement, setSelectedElement] = useState<FormElement | null>(
    null
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showCodeExport, setShowCodeExport] = useState(false);
  const [showFormSettings, setShowFormSettings] = useState(false);
  const [formSettings, setFormSettings] = useState(initialSettings);
  const [formStyle, setFormStyle] = useState(initialStyle);

  // Update state when props change
  useEffect(() => {
    setElements(initialElements);
  }, [initialElements]);

  useEffect(() => {
    setFormSettings(initialSettings);
  }, [initialSettings]);

  useEffect(() => {
    setFormStyle(initialStyle);
  }, [initialStyle]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Si se está arrastrando desde el sidebar izquierdo al canvas
    if (over.id === "canvas" && typeof active.id === "string") {
      const elementType = active.id;
      const newElement = createNewElement(elementType as ElementType);

      if (newElement) {
        setElements((prev) => [...prev, newElement]);
      }
    }

    // Si se está moviendo un elemento dentro del canvas
    if (
      over.id === "canvas" &&
      typeof active.id === "string" &&
      active.id.startsWith("element-")
    ) {
      const elementId = active.id.replace("element-", "");
      const element = elements.find((el) => el.id === elementId);

      if (element && event.delta) {
        setElements((prev) =>
          prev.map((el) =>
            el.id === elementId
              ? {
                  ...el,
                  position: {
                    x: el.position.x + event.delta.x,
                    y: el.position.y + event.delta.y,
                  },
                }
              : el
          )
        );
      }
    }
  };

  const createNewElement = (type: string): FormElement | null => {
    const id = `${type}-${Date.now()}`;
    // Calcular posición basada en elementos existentes para evitar encimado
    const baseY = 100 + elements.length * 150; // Separar elementos verticalmente
    const baseX = 100 + (elements.length % 3) * 150; // Alternar horizontalmente cada 3 elementos

    const baseProps = {
      id,
      label: `${type} element`,
      position: { x: baseX, y: baseY },
      dimensions: { width: 400, height: 120 }, // Ancho mayor por defecto
      showBorder: true, // Border por defecto
      showShadow: false, // Sin sombra por defecto
    };

    switch (type) {
      case "nps":
        return {
          type: "nps",
          ...baseProps,
          label: "¿Qué tan probable es que recomiendes nuestro producto?",
          minValue: 0,
          maxValue: 10,
          minLabel: "Nada probable",
          maxLabel: "Muy probable",
          displayType: "numbers" as const,
          required: true,
        };
      case "text-input":
        return {
          type: "text-input",
          ...baseProps,
          label: "Campo de texto",
          placeholder: "Ingresa texto...",
          required: false,
        };
      case "textarea":
        return {
          type: "textarea",
          ...baseProps,
          label: "Comentarios adicionales",
          placeholder: "Escribe tus comentarios...",
          required: false,
          rows: 4,
        };
      case "select":
        return {
          type: "select",
          ...baseProps,
          label: "Selecciona una opción",
          options: ["Opción 1", "Opción 2", "Opción 3"],
          required: false,
          placeholder: "Selecciona...",
        };
      case "text":
        return {
          type: "text",
          ...baseProps,
          label: "Texto",
          text: "Texto de ejemplo",
          size: "md" as const,
        };
      default:
        return null;
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        elements,
        settings: formSettings,
        style: formStyle,
      });
    }
  };

  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Preview Mode</h2>
              <button
                onClick={() => setIsPreviewMode(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Exit Preview
              </button>
            </div>
          </div>
          <PreviewMode elements={elements} />
        </div>
      </div>
    );
  }

  if (showCodeExport) {
    return (
      <CodeExport
        elements={elements}
        isOpen={true}
        onClose={() => setShowCodeExport(false)}
        formSettings={formSettings}
      />
    );
  }

  if (showFormSettings) {
    return (
      <FormSettings
        isOpen={true}
        formSettings={formSettings}
        onClose={() => setShowFormSettings(false)}
        onSave={(settings) => {
          setFormSettings(settings);
          setShowFormSettings(false);
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Toolbar */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Form Designer
              </h2>
              <span className="text-sm text-gray-500">
                {elements.length} element{elements.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFormSettings(true)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Settings
              </button>
              <button
                onClick={() => setIsPreviewMode(true)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Preview
              </button>
              <button
                onClick={() => setShowCodeExport(true)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Export
              </button>
              {onSave && (
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : saveButtonText}
                </button>
              )}
            </div>
          </div>

          {/* Canvas */}
          <Canvas
            elements={elements}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            onUpdateElement={(element: FormElement) => {
              setElements((prev) =>
                prev.map((el) => (el.id === element.id ? element : el))
              );
            }}
            onDeleteElement={(elementId: string) =>
              setElements((prev) => prev.filter((el) => el.id !== elementId))
            }
          />
        </div>

        {/* Right Sidebar */}
        <RightSidebar
          selectedElement={selectedElement}
          onUpdateElement={(updatedElement: FormElement) => {
            setElements((prev) =>
              prev.map((el) =>
                el.id === updatedElement.id ? updatedElement : el
              )
            );
          }}
        />

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="p-2 bg-blue-100 rounded">Dragging</div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
