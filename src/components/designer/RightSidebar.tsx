"use client";

import React from "react";
import {
  FormElement,
  NPSElement,
  TextInputElement,
  TextAreaElement,
  SelectElement,
  ButtonElement,
  HeadingElement,
  TextElement,
} from "@/types/form-elements";

interface RightSidebarProps {
  selectedElement: FormElement | null;
  onUpdateElement: (element: FormElement) => void;
}

export function RightSidebar({
  selectedElement,
  onUpdateElement,
}: RightSidebarProps) {
  if (!selectedElement) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6 h-full min-h-screen">
        <div className="text-center text-gray-500 mt-12">
          <div className="text-4xl mb-4">⚙️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Element Properties
          </h3>
          <p className="text-sm">
            Select an element on the canvas to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const updateElement = (updates: Partial<FormElement>) => {
    const updatedElement = { ...selectedElement, ...updates } as FormElement;
    onUpdateElement(updatedElement);
  };

  const renderProperties = () => {
    switch (selectedElement.type) {
      case "nps":
        return (
          <NPSProperties
            element={selectedElement as NPSElement}
            onUpdate={updateElement}
          />
        );
      case "text-input":
        return (
          <TextInputProperties
            element={selectedElement as TextInputElement}
            onUpdate={updateElement}
          />
        );
      case "textarea":
        return (
          <TextAreaProperties
            element={selectedElement as TextAreaElement}
            onUpdate={updateElement}
          />
        );
      case "select":
        return (
          <SelectProperties
            element={selectedElement as SelectElement}
            onUpdate={updateElement}
          />
        );
      case "button":
        return (
          <ButtonProperties
            element={selectedElement as ButtonElement}
            onUpdate={updateElement}
          />
        );
      case "heading":
        return (
          <HeadingProperties
            element={selectedElement as HeadingElement}
            onUpdate={updateElement}
          />
        );
      case "text":
        return (
          <TextProperties
            element={selectedElement as TextElement}
            onUpdate={updateElement}
          />
        );
      default:
        return <div>No properties available</div>;
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto h-full min-h-screen">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Properties</h2>
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
          {selectedElement.type.replace("-", " ").toUpperCase()}
        </div>
      </div>

      {/* Common Properties */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">General</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={selectedElement.label}
              onChange={(e) => updateElement({ label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={selectedElement.required === true}
              onChange={(e) => updateElement({ required: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="required"
              className="ml-2 block text-sm text-gray-700"
            >
              Required field
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showBorder"
              checked={selectedElement.showBorder !== false}
              onChange={(e) => updateElement({ showBorder: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="showBorder"
              className="ml-2 block text-sm text-gray-700"
            >
              Show border
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showShadow"
              checked={selectedElement.showShadow === true}
              onChange={(e) => updateElement({ showShadow: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="showShadow"
              className="ml-2 block text-sm text-gray-700"
            >
              Show shadow
            </label>
          </div>

          {/* Dimension Controls */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (px)
              </label>
              <input
                type="number"
                min="100"
                max="1000"
                value={selectedElement.dimensions?.width || 300}
                onChange={(e) =>
                  updateElement({
                    dimensions: {
                      ...selectedElement.dimensions,
                      width: parseInt(e.target.value) || 300,
                      height: selectedElement.dimensions?.height || 120,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (px)
              </label>
              <input
                type="number"
                min="50"
                max="500"
                value={selectedElement.dimensions?.height || 120}
                onChange={(e) =>
                  updateElement({
                    dimensions: {
                      width: selectedElement.dimensions?.width || 300,
                      height: parseInt(e.target.value) || 120,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Element Specific Properties */}
      {renderProperties()}
    </div>
  );
}

function NPSProperties({
  element,
  onUpdate,
}: {
  element: NPSElement;
  onUpdate: (updates: Partial<FormElement>) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">NPS Settings</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Value
            </label>
            <input
              type="number"
              value={element.minValue}
              onChange={(e) => onUpdate({ minValue: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Value
            </label>
            <input
              type="number"
              value={element.maxValue}
              onChange={(e) => onUpdate({ maxValue: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Label
          </label>
          <input
            type="text"
            value={element.minLabel || ""}
            onChange={(e) => onUpdate({ minLabel: e.target.value })}
            placeholder="e.g., Not likely"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Label
          </label>
          <input
            type="text"
            value={element.maxLabel || ""}
            onChange={(e) => onUpdate({ maxLabel: e.target.value })}
            placeholder="e.g., Very likely"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Type
          </label>
          <select
            value={element.displayType || "numbers"}
            onChange={(e) =>
              onUpdate({ displayType: e.target.value as "numbers" | "emojis" })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
          >
            <option value="numbers">Numbers (0, 1, 2...)</option>
            <option value="emojis">Emojis (😤, 😞, 😐...)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function TextInputProperties({
  element,
  onUpdate,
}: {
  element: TextInputElement;
  onUpdate: (updates: Partial<FormElement>) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Input Settings
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placeholder
          </label>
          <input
            type="text"
            value={element.placeholder || ""}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Length
          </label>
          <input
            type="number"
            value={element.maxLength || ""}
            onChange={(e) =>
              onUpdate({
                maxLength: e.target.value
                  ? parseInt(e.target.value)
                  : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
          />
        </div>
      </div>
    </div>
  );
}

function TextAreaProperties({
  element,
  onUpdate,
}: {
  element: TextAreaElement;
  onUpdate: (updates: Partial<FormElement>) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Textarea Settings
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placeholder
          </label>
          <input
            type="text"
            value={element.placeholder || ""}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rows
          </label>
          <input
            type="number"
            value={element.rows || 4}
            onChange={(e) => onUpdate({ rows: parseInt(e.target.value) })}
            min="1"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Length
          </label>
          <input
            type="number"
            value={element.maxLength || ""}
            onChange={(e) =>
              onUpdate({
                maxLength: e.target.value
                  ? parseInt(e.target.value)
                  : undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
          />
        </div>
      </div>
    </div>
  );
}

function SelectProperties({
  element,
  onUpdate,
}: {
  element: SelectElement;
  onUpdate: (updates: Partial<FormElement>) => void;
}) {
  const addOption = () => {
    const newOptions = [
      ...element.options,
      `Option ${element.options.length + 1}`,
    ];
    onUpdate({ options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...element.options];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = element.options.filter((_, i) => i !== index);
    onUpdate({ options: newOptions });
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Select Settings
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placeholder
          </label>
          <input
            type="text"
            value={element.placeholder || ""}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Options
            </label>
            <button
              onClick={addOption}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              Add Option
            </button>
          </div>
          <div className="space-y-2">
            {element.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                />
                <button
                  onClick={() => removeOption(index)}
                  className="text-red-600 hover:text-red-800 px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ButtonProperties({
  element,
  onUpdate,
}: {
  element: ButtonElement;
  onUpdate: (updates: Partial<FormElement>) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Button Settings
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Button Text
          </label>
          <input
            type="text"
            value={element.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Variant
          </label>
          <select
            value={element.variant}
            onChange={(e) =>
              onUpdate({ variant: e.target.value as "primary" | "secondary" })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action
          </label>
          <select
            value={element.action}
            onChange={(e) =>
              onUpdate({
                action: e.target.value as "submit" | "reset" | "custom",
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
          >
            <option value="submit">Submit</option>
            <option value="reset">Reset</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function HeadingProperties({
  element,
  onUpdate,
}: {
  element: HeadingElement;
  onUpdate: (updates: Partial<FormElement>) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Heading Settings
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text
          </label>
          <input
            type="text"
            value={element.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heading Level
          </label>
          <select
            value={element.level}
            onChange={(e) =>
              onUpdate({
                level: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
          >
            <option value={1}>H1 - Large Title</option>
            <option value={2}>H2 - Section Title</option>
            <option value={3}>H3 - Subsection</option>
            <option value={4}>H4 - Small Title</option>
            <option value={5}>H5 - Smaller Title</option>
            <option value={6}>H6 - Smallest Title</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function TextProperties({
  element,
  onUpdate,
}: {
  element: TextElement;
  onUpdate: (updates: Partial<FormElement>) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Text Settings
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text
          </label>
          <textarea
            value={element.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Size
          </label>
          <select
            value={element.size}
            onChange={(e) =>
              onUpdate({ size: e.target.value as "sm" | "md" | "lg" })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </div>
      </div>
    </div>
  );
}
