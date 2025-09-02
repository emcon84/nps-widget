"use client";

import { useState, useCallback } from "react";

/**
 * Hook para manejar el estado de la UI
 * Principio SRP: Una sola responsabilidad - gestión de estado de UI
 */
export function useUIState() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showCodeExport, setShowCodeExport] = useState(false);
  const [showFormSettings, setShowFormSettings] = useState(false);

  const togglePreviewMode = useCallback(() => {
    setIsPreviewMode((prev) => !prev);
  }, []);

  const openCodeExport = useCallback(() => {
    setShowCodeExport(true);
  }, []);

  const closeCodeExport = useCallback(() => {
    setShowCodeExport(false);
  }, []);

  const toggleFormSettings = useCallback(() => {
    setShowFormSettings((prev) => !prev);
  }, []);

  const closeFormSettings = useCallback(() => {
    setShowFormSettings(false);
  }, []);

  return {
    activeId,
    setActiveId,
    isPreviewMode,
    showCodeExport,
    showFormSettings,
    togglePreviewMode,
    openCodeExport,
    closeCodeExport,
    toggleFormSettings,
    closeFormSettings,
  };
}
