import React from "react";
import { FormElement } from "@/types/form-elements";
import { FormSettings } from "@/hooks/useFormConfiguration";
import { CodeExport } from "./CodeExport";
import { FormSettings as FormSettingsComponent } from "./FormSettings";

/**
 * Componente Modals - Principio SRP
 */
interface FormDesignerModalsProps {
  showCodeExport: boolean;
  showFormSettings: boolean;
  elements: FormElement[];
  formSettings: FormSettings;
  onCloseCodeExport: () => void;
  onCloseFormSettings: () => void;
  onSaveSettings: (settings: FormSettings) => void;
}

export function FormDesignerModals({
  showCodeExport,
  showFormSettings,
  elements,
  formSettings,
  onCloseCodeExport,
  onCloseFormSettings,
  onSaveSettings,
}: FormDesignerModalsProps) {
  return (
    <>
      {showCodeExport && (
        <CodeExport
          isOpen={showCodeExport}
          elements={elements}
          formSettings={formSettings}
          onClose={onCloseCodeExport}
        />
      )}
      {showFormSettings && (
        <FormSettingsComponent
          isOpen={showFormSettings}
          formSettings={formSettings}
          onClose={onCloseFormSettings}
          onSave={onSaveSettings}
        />
      )}
    </>
  );
}
