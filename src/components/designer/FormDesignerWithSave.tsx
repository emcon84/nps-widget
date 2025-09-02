"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { Settings, Eye, Copy, Plus } from "lucide-react";

import { RightSidebar } from "./RightSidebar";
import { Canvas } from "./Canvas";
import { FormElement, ElementType } from "@/types/form-elements";
import { LeftSidebar } from "./LeftSidebar";
import { PreviewMode } from "./PreviewMode";
import { CodeExport } from "./CodeExport";
import { FormSettings } from "./FormSettings";

// =================== TYPES ===================
interface FormDesignerWithSaveProps {
  onSave?: (data: FormSaveData) => void;
  onChange?: (data: FormSaveData) => void;
  saveButtonText?: string;
  isLoading?: boolean;
  initialElements?: FormElement[];
  initialSettings?: FormSettingsData;
  initialStyle?: StyleData;
  surveyId?: string;
}

interface FormSaveData {
  elements: FormElement[];
  settings: FormSettingsData;
  style: StyleData;
}

interface FormSettingsData {
  submitEndpoint: string;
  submitMethod: "POST" | "PUT" | "PATCH";
  webhookHeaders: Record<string, string>;
  successMessage: string;
  errorMessage: string;
}

interface StyleData {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  borderRadius: string;
  fontFamily: string;
}

// =================== CUSTOM HOOKS FOR SAVE FUNCTIONALITY ===================

/**
 * Hook para manejar estado persistente con auto-save
 * Principio SRP: Gestión de persistencia y auto-save
 */
function usePersistentFormState(
  initialElements: FormElement[],
  initialSettings: FormSettingsData,
  initialStyle: StyleData,
  onChange?: (data: FormSaveData) => void
) {
  const [elements, setElements] = useState<FormElement[]>(initialElements);
  const [settings, setSettings] = useState<FormSettingsData>(initialSettings);
  const [style, setStyle] = useState<StyleData>(initialStyle);

  // Auto-save cuando cambia algo
  useEffect(() => {
    if (onChange) {
      onChange({ elements, settings, style });
    }
  }, [elements, settings, style, onChange]);

  const updateElements = useCallback((newElements: FormElement[]) => {
    setElements(newElements);
  }, []);

  const updateSettings = useCallback((newSettings: FormSettingsData) => {
    setSettings(newSettings);
  }, []);

  const updateStyle = useCallback((newStyle: StyleData) => {
    setStyle(newStyle);
  }, []);

  return {
    elements,
    settings,
    style,
    updateElements,
    updateSettings,
    updateStyle,
  };
}

/**
 * Hook para manejar operaciones de elementos del formulario
 * Principio SRP: Una sola responsabilidad - gestión de elementos
 */
function useFormElementOperations(
  elements: FormElement[],
  updateElements: (elements: FormElement[]) => void
) {
  const [selectedElement, setSelectedElement] = useState<FormElement | null>(
    null
  );

  const addElement = useCallback(
    (element: FormElement) => {
      updateElements([...elements, element]);
    },
    [elements, updateElements]
  );

  const updateElement = useCallback(
    (updatedElement: FormElement) => {
      const newElements = elements.map((el) =>
        el.id === updatedElement.id ? updatedElement : el
      );
      updateElements(newElements);
      setSelectedElement(updatedElement);
    },
    [elements, updateElements]
  );

  const deleteElement = useCallback(
    (elementId: string) => {
      const newElements = elements.filter((el) => el.id !== elementId);
      updateElements(newElements);
      setSelectedElement((prev) => (prev?.id === elementId ? null : prev));
    },
    [elements, updateElements]
  );

  const clearAllElements = useCallback(() => {
    updateElements([]);
    setSelectedElement(null);
  }, [updateElements]);

  const selectElement = useCallback((element: FormElement | null) => {
    setSelectedElement(element);
  }, []);

  const duplicateElement = useCallback(
    (elementId: string) => {
      const elementToDuplicate = elements.find((el) => el.id === elementId);
      if (elementToDuplicate) {
        const duplicatedElement = {
          ...elementToDuplicate,
          id: `${elementToDuplicate.type}-${Date.now()}`,
          position: {
            x: elementToDuplicate.position.x + 20,
            y: elementToDuplicate.position.y + 20,
          },
        };
        addElement(duplicatedElement);
      }
    },
    [elements, addElement]
  );

  return {
    selectedElement,
    addElement,
    updateElement,
    deleteElement,
    clearAllElements,
    selectElement,
    duplicateElement,
  };
}

/**
 * Factory mejorado para crear elementos con mejor configuración
 * Principio OCP: Abierto para extensión, cerrado para modificación
 */
class EnhancedFormElementFactory {
  private static calculatePosition(existingElements: FormElement[]) {
    const baseY = 100 + existingElements.length * 150;
    const baseX = 100 + (existingElements.length % 3) * 150;
    return { x: baseX, y: baseY };
  }

  private static createBaseElement(
    type: string,
    existingElements: FormElement[]
  ) {
    return {
      id: `${type}-${Date.now()}`,
      label: `${type} element`,
      position: this.calculatePosition(existingElements),
      dimensions: { width: 400, height: 120 },
      showBorder: true,
      showShadow: false,
    };
  }

  static createElement(
    type: ElementType,
    existingElements: FormElement[]
  ): FormElement | null {
    const baseProps = this.createBaseElement(type, existingElements);

    const elementConfigs = {
      nps: {
        ...baseProps,
        type: "nps" as const,
        label: "NPS Question",
        minValue: 0,
        maxValue: 10,
        minLabel: "Not likely",
        maxLabel: "Very likely",
        displayType: "numbers" as const,
        dimensions: { width: 500, height: 120 },
      },
      "text-input": {
        ...baseProps,
        type: "text-input" as const,
        label: "Text Input",
        placeholder: "Enter text...",
      },
      textarea: {
        ...baseProps,
        type: "textarea" as const,
        label: "Text Area",
        placeholder: "Enter your feedback...",
        rows: 4,
        dimensions: { width: 400, height: 150 },
      },
      select: {
        ...baseProps,
        type: "select" as const,
        label: "Select Option",
        options: ["Option 1", "Option 2", "Option 3"],
        placeholder: "Choose an option...",
      },
      button: {
        ...baseProps,
        type: "button" as const,
        label: "Button",
        text: "Submit",
        variant: "primary" as const,
        action: "submit" as const,
        dimensions: { width: 200, height: 50 },
      },
      heading: {
        ...baseProps,
        type: "heading" as const,
        label: "Heading",
        text: "Survey Title",
        level: 2 as const,
        dimensions: { width: 400, height: 80 },
      },
      text: {
        ...baseProps,
        type: "text" as const,
        label: "Text",
        text: "Add your text here",
        size: "md" as const,
        dimensions: { width: 400, height: 60 },
      },
    };

    return elementConfigs[type] || null;
  }
}

/**
 * Componente FormDesignerWithSave refactorizado
 * Principio SRP: Solo se encarga de la composición y renderizado
 * Principio DIP: Depende de abstracciones (hooks) no de implementaciones concretas
 */
export function FormDesignerWithSave({
  onSave,
  onChange,
  saveButtonText = "Save",
  isLoading = false,
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
    borderRadius: "8px",
    fontFamily: "Inter",
  },
  surveyId,
}: FormDesignerWithSaveProps) {
  // Uso de hooks para separar responsabilidades
  const {
    elements,
    settings,
    style,
    updateElements,
    updateSettings,
    updateStyle,
  } = usePersistentFormState(
    initialElements,
    initialSettings,
    initialStyle,
    onChange
  );

  const {
    selectedElement,
    addElement,
    updateElement,
    deleteElement,
    clearAllElements,
    selectElement,
    duplicateElement,
  } = useFormElementOperations(elements, updateElements);

  // Estado de UI
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showCodeExport, setShowCodeExport] = useState(false);
  const [showFormSettings, setShowFormSettings] = useState(false);
  const [showMobileElementsPanel, setShowMobileElementsPanel] = useState(false);
  const [showMobilePropertiesPanel, setShowMobilePropertiesPanel] =
    useState(false);

  // Event handlers - Principio SRP
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave({ elements, settings, style });
    }
  }, [onSave, elements, settings, style]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
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
        const newElement = EnhancedFormElementFactory.createElement(
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

  const togglePreviewMode = useCallback(() => {
    setIsPreviewMode((prev) => !prev);
  }, []);

  const toggleFormSettings = useCallback(() => {
    setShowFormSettings((prev) => !prev);
  }, []);

  const openCodeExport = useCallback(() => {
    setShowCodeExport(true);
  }, []);

  const closeCodeExport = useCallback(() => {
    setShowCodeExport(false);
  }, []);

  const closeFormSettings = useCallback(() => {
    setShowFormSettings(false);
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedElement) {
      deleteElement(selectedElement.id);
    }
  }, [selectedElement, deleteElement]);

  const handleDuplicateSelected = useCallback(() => {
    if (selectedElement) {
      duplicateElement(selectedElement.id);
    }
  }, [selectedElement, duplicateElement]);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-gray-50 relative">
        {/* Left Sidebar - Desktop */}
        {!isPreviewMode && (
          <div className="hidden lg:block">
            <LeftSidebar />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Enhanced Toolbar */}
          <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {isPreviewMode ? "Survey Preview" : "NPS Survey Designer"}
            </h1>
            <div className="flex gap-2">
              {!isPreviewMode && selectedElement && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Delete Selected
                </button>
              )}
              {!isPreviewMode && (
                <button
                  onClick={clearAllElements}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={togglePreviewMode}
                className={`px-4 py-2 text-sm font-medium border border-transparent rounded-md ${
                  isPreviewMode
                    ? "text-white bg-green-600 hover:bg-green-700"
                    : "text-white bg-gray-600 hover:bg-gray-700"
                }`}
              >
                {isPreviewMode ? "Exit Preview" : "Preview"}
              </button>
              {!isPreviewMode && (
                <>
                  <button
                    onClick={toggleFormSettings}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
                  >
                    Configuración
                  </button>
                  <button
                    onClick={openCodeExport}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Generar Script
                  </button>
                </>
              )}
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

          {/* Content Area */}
          {isPreviewMode ? (
            <div className="flex-1 overflow-auto">
              <PreviewMode elements={elements} />
            </div>
          ) : (
            <Canvas
              elements={elements}
              selectedElement={selectedElement}
              onSelectElement={selectElement}
              onUpdateElement={updateElement}
              onDeleteElement={deleteElement}
            />
          )}
        </div>

        {/* Right Sidebar - Desktop */}
        {!isPreviewMode && (
          <div className="hidden lg:block">
            <RightSidebar
              selectedElement={selectedElement}
              onUpdateElement={updateElement}
            />
          </div>
        )}

        {/* Mobile Elements Panel */}
        {showMobileElementsPanel && (
          <div className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-50">
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Add Elements
                  </h3>
                  <button
                    onClick={() => setShowMobileElementsPanel(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto">
                <LeftSidebar />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Properties Panel */}
        {showMobilePropertiesPanel && selectedElement && (
          <div className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-50">
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Properties
                  </h3>
                  <button
                    onClick={() => setShowMobilePropertiesPanel(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto">
                <RightSidebar
                  selectedElement={selectedElement}
                  onUpdateElement={updateElement}
                />
              </div>
            </div>
          </div>
        )}

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-lg">
              {activeId}
            </div>
          ) : null}
        </DragOverlay>

        {/* Modals */}
        {showCodeExport && (
          <CodeExport
            isOpen={showCodeExport}
            elements={elements}
            formSettings={settings}
            onClose={closeCodeExport}
            surveyId={surveyId}
          />
        )}
        {showFormSettings && (
          <FormSettings
            isOpen={showFormSettings}
            formSettings={settings}
            onClose={closeFormSettings}
            onSave={updateSettings}
          />
        )}
      </div>
    </DndContext>
  );
}
