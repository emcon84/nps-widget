"use client";

import { useState, useCallback } from "react";

export interface FormSettings {
  submitEndpoint: string;
  submitMethod: "POST" | "PUT" | "PATCH";
  webhookHeaders: Record<string, string>;
  successMessage: string;
  errorMessage: string;
}

/**
 * Hook para manejar configuración del formulario
 * Principio SRP: Una sola responsabilidad - gestión de configuración
 */
export function useFormConfiguration() {
  const [formSettings, setFormSettings] = useState<FormSettings>({
    submitEndpoint: "",
    submitMethod: "POST",
    webhookHeaders: {},
    successMessage: "¡Gracias por tu feedback!",
    errorMessage: "Error al enviar. Por favor intenta de nuevo.",
  });

  const updateFormSettings = useCallback((settings: FormSettings) => {
    setFormSettings(settings);
  }, []);

  return {
    formSettings,
    updateFormSettings,
  };
}
