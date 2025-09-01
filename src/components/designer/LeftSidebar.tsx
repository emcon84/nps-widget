"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  MessageSquare,
  Type,
  TextCursor,
  List,
  MousePointer,
  Heading,
  AlignLeft,
} from "lucide-react";

interface ElementButtonProps {
  type: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

function ElementButton({ type, label, icon, description }: ElementButtonProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: type,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        flex flex-col items-center p-4 bg-white border-2 border-gray-200 rounded-lg cursor-grab hover:border-blue-300 hover:shadow-md transition-all
        ${isDragging ? "opacity-50" : ""}
      `}
    >
      <div className="text-blue-600 mb-2">{icon}</div>
      <span className="text-sm font-medium text-gray-900 text-center">
        {label}
      </span>
      <span className="text-xs text-gray-500 text-center mt-1">
        {description}
      </span>
    </div>
  );
}

export function LeftSidebar() {
  const elements = [
    {
      type: "nps",
      label: "NPS Scale",
      icon: <MessageSquare size={24} />,
      description: "0-10 rating scale",
    },
    {
      type: "text-input",
      label: "Text Input",
      icon: <TextCursor size={24} />,
      description: "Single line input",
    },
    {
      type: "textarea",
      label: "Text Area",
      icon: <AlignLeft size={24} />,
      description: "Multi-line input",
    },
    {
      type: "select",
      label: "Select",
      icon: <List size={24} />,
      description: "Dropdown selection",
    },
    {
      type: "button",
      label: "Button",
      icon: <MousePointer size={24} />,
      description: "Action button",
    },
    {
      type: "heading",
      label: "Heading",
      icon: <Heading size={24} />,
      description: "Section title",
    },
    {
      type: "text",
      label: "Text",
      icon: <Type size={24} />,
      description: "Static text",
    },
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Elements</h2>
        <p className="text-sm text-gray-600">
          Drag elements to the canvas to build your survey
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {elements.map((element) => (
          <ElementButton
            key={element.type}
            type={element.type}
            label={element.label}
            icon={element.icon}
            description={element.description}
          />
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Tips</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Drag elements to the canvas</li>
          <li>• Click elements to edit properties</li>
          <li>• Use NPS scale for rating questions</li>
          <li>• Export your design when finished</li>
        </ul>
      </div>
    </div>
  );
}
