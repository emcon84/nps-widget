"use client";

import React from "react";
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

interface ElementWrapperProps {
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
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Delete button clicked for element:", elementId);
    onDelete();
  };

  return (
    <button
      onClick={handleClick}
      className={`absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 z-50 ${
        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      }`}
      title="Delete element"
      type="button"
    >
      <X size={14} />
    </button>
  );
}

function ElementWrapper({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: ElementWrapperProps) {
  const handleSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect();
  };

  const handleDelete = () => {
    onDelete();
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <div className="flex justify-center">
        <div
          className="relative group"
          style={{
            width: element.dimensions?.width || 400,
            maxWidth: "100%",
          }}
        >
          <button
            onClick={handleSelection}
            className="absolute inset-0 cursor-pointer z-10 bg-transparent border-none"
            title="Click to select element"
          />

          <div
            className={`
              bg-white rounded-lg transition-all duration-200
              ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""}
            `}
            style={{
              width: "100%",
              minHeight: element.dimensions?.height || 120,
            }}
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
  return (
    <div className="h-full w-full">
      <div
        className="w-full h-full bg-white overflow-y-auto"
        onClick={() => onSelectElement(null)}
      >
        {elements.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Start Building Your Survey
              </h3>
              <p className="text-base text-gray-600 max-w-md">
                Click elements from the left sidebar to add them to your survey.
                Elements will appear in the order you select them.
              </p>
            </div>
          </div>
        ) : (
          <div className="py-8 px-4">
            {elements.map((element, index) => (
              <ElementWrapper
                key={element.id}
                element={element}
                isSelected={selectedElement?.id === element.id}
                onSelect={() => onSelectElement(element)}
                onUpdate={onUpdateElement}
                onDelete={() => onDeleteElement(element.id)}
              />
            ))}
          </div>
        )}

        {/* Survey info */}
        {elements.length > 0 && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-sm text-gray-600 pointer-events-none z-10">
            {elements.length} element{elements.length !== 1 ? "s" : ""} in
            survey
          </div>
        )}
      </div>
    </div>
  );
}
