"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormDesignerWithSave } from "@/components/designer/FormDesignerWithSave";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewSurveyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const handleSaveRequest = (data: any) => {
    // Store the form data and show name dialog
    setFormData(data);
    setShowNameDialog(true);
  };

  const handleFinalSave = async () => {
    if (!title.trim()) {
      alert("Please enter a survey title");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          elements: formData?.elements || [],
          settings: formData?.settings || {
            submitEndpoint: "",
            submitMethod: "POST",
            webhookHeaders: {},
            successMessage: "¡Gracias por tu feedback!",
            errorMessage: "Error al enviar. Por favor intenta de nuevo.",
          },
          style: formData?.style || {
            backgroundColor: "#ffffff",
            textColor: "#1f2937",
            primaryColor: "#3b82f6",
            borderRadius: 8,
            fontFamily: "Inter",
          },
          isActive: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create survey");
      }

      const survey = await response.json();
      router.push(`/dashboard/edit/${survey.id}`);
    } catch (error) {
      console.error("Error creating survey:", error);
      alert("Error creating survey. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Link>
              <div className="h-6 border-l border-gray-300" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Create New Survey
                </h1>
                <p className="text-sm text-gray-500">
                  Design your NPS survey using the visual editor
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Draft
              </span>
            </div>
          </div>
        </div>

        {/* Form Designer */}
        <div className="flex-1">
          <FormDesignerWithSave
            onSave={handleSaveRequest}
            saveButtonText="Save Survey"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Name Dialog Modal */}
      {showNameDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Save Survey
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Survey Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter survey title..."
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter survey description..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowNameDialog(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalSave}
                  disabled={isLoading || !title.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Save Survey"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
