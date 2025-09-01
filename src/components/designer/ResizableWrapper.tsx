"use client";

import React, { useState, useRef } from "react";
import { FormElement } from "@/types/form-elements";

interface ResizableWrapperProps {
  element: FormElement;
  isSelected: boolean;
  onUpdate: (element: FormElement) => void;
  children: React.ReactNode;
}

export function ResizableWrapper({
  element,
  isSelected,
  onUpdate,
  children,
}: ResizableWrapperProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>("");
  const resizeStartRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const dimensions = element.dimensions || { width: 300, height: 120 };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setResizeDirection(direction);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: dimensions.width,
      height: dimensions.height,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current) return;

      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;

      let newWidth = resizeStartRef.current.width;
      let newHeight = resizeStartRef.current.height;

      // Calcular nuevas dimensiones basadas en la dirección
      if (direction.includes("right")) {
        newWidth = Math.max(100, resizeStartRef.current.width + deltaX);
      }
      if (direction.includes("left")) {
        newWidth = Math.max(100, resizeStartRef.current.width - deltaX);
      }
      if (direction.includes("bottom")) {
        newHeight = Math.max(60, resizeStartRef.current.height + deltaY);
      }
      if (direction.includes("top")) {
        newHeight = Math.max(60, resizeStartRef.current.height - deltaY);
      }

      onUpdate({
        ...element,
        dimensions: { width: newWidth, height: newHeight },
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection("");
      resizeStartRef.current = null;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const renderResizeHandle = (direction: string, className: string) => (
    <div
      className={`absolute bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-${direction.includes("n") || direction.includes("s") ? "ns" : direction.includes("e") || direction.includes("w") ? "ew" : "nwse"}-resize pointer-events-auto ${className}`}
      onMouseDown={(e) => handleResizeStart(e, direction)}
      data-no-dnd="true"
      style={{ zIndex: 60 }}
    />
  );

  return (
    <div
      className={`group relative ${isSelected ? "outline-2 outline-blue-500" : ""}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        minWidth: 100,
        minHeight: 60,
      }}
    >
      {/* Content - permitir drag & drop directo */}
      <div className="w-full h-full">{children}</div>

      {/* Resize handles - only show when selected */}
      {isSelected && (
        <>
          {/* Corner handles */}
          {renderResizeHandle("top-left", "w-3 h-3 -top-1 -left-1")}
          {renderResizeHandle("top-right", "w-3 h-3 -top-1 -right-1")}
          {renderResizeHandle("bottom-left", "w-3 h-3 -bottom-1 -left-1")}
          {renderResizeHandle("bottom-right", "w-3 h-3 -bottom-1 -right-1")}

          {/* Edge handles */}
          {renderResizeHandle("top", "w-full h-1 -top-1 left-0")}
          {renderResizeHandle("bottom", "w-full h-1 -bottom-1 left-0")}
          {renderResizeHandle("left", "w-1 h-full top-0 -left-1")}
          {renderResizeHandle("right", "w-1 h-full top-0 -right-1")}

          {/* Visual indicators for corner handles */}
          <div className="absolute w-2 h-2 bg-blue-500 -top-1 -left-1 rounded-sm pointer-events-none" />
          <div className="absolute w-2 h-2 bg-blue-500 -top-1 -right-1 rounded-sm pointer-events-none" />
          <div className="absolute w-2 h-2 bg-blue-500 -bottom-1 -left-1 rounded-sm pointer-events-none" />
          <div className="absolute w-2 h-2 bg-blue-500 -bottom-1 -right-1 rounded-sm pointer-events-none" />
        </>
      )}
    </div>
  );
}
