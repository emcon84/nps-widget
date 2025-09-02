"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { FormDesignerWithSave } from "@/components/designer/FormDesignerWithSave";
import Link from "next/link";
import { ArrowLeft, Save, Eye, ExternalLink, BarChart3 } from "lucide-react";

interface Survey {
  id: string;
  title: string;
  description: string | null;
  elements: any;
  settings: any;
  style: any;
  isActive: boolean;
  version: number;
  _count: {
    responses: number;
  };
}

export default function EditSurveyPage() {
  const router = useRouter();
  const params = useParams();
  const surveyId = params.id as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    fetchSurvey();
  }, [surveyId]);

  const fetchSurvey = async () => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/dashboard");
          return;
        }
        throw new Error("Failed to fetch survey");
      }

      const surveyData = await response.json();
      setSurvey(surveyData);
      setTitle(surveyData.title);
      setDescription(surveyData.description || "");
    } catch (error) {
      console.error("Error fetching survey:", error);
      alert("Error loading survey. Redirecting to dashboard.");
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormDataChange = useCallback((data: any) => {
    setFormData(data);
  }, []);

  const handleSave = async () => {
    if (!survey) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          elements: formData?.elements || survey.elements,
          settings: formData?.settings || survey.settings,
          style: formData?.style || survey.style,
          isActive: survey.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update survey");
      }

      const updatedSurvey = await response.json();
      setSurvey(updatedSurvey);
      alert("Survey saved successfully!");
    } catch (error) {
      console.error("Error saving survey:", error);
      alert("Error saving survey. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!survey) return;

    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          elements: formData?.elements || survey.elements,
          settings: formData?.settings || survey.settings,
          style: formData?.style || survey.style,
          isActive: !survey.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update survey status");
      }

      const updatedSurvey = await response.json();
      setSurvey(updatedSurvey);
    } catch (error) {
      console.error("Error updating survey status:", error);
      alert("Error updating survey status. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-900">Survey not found</p>
          <Link
            href="/dashboard"
            className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex-shrink-0">
        {/* Added flex-shrink-0 */}
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
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-0 p-0"
                placeholder="Survey title"
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block text-sm text-gray-500 bg-transparent border-none outline-none focus:ring-0 p-0 mt-1"
                placeholder="Survey description (optional)"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={toggleActive}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                survey.isActive
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <Eye className="h-4 w-4 mr-2" />
              {survey.isActive ? "Active" : "Inactive"}
            </button>

            <Link
              href={`/dashboard/results/${surveyId}`}
              className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-200"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Results ({survey._count.responses})
            </Link>
          </div>
        </div>
      </div>

      {/* Form Designer */}
      <div className="flex-1 overflow-hidden">
        <FormDesignerWithSave
          initialElements={survey?.elements || []}
          initialSettings={survey?.settings || {}}
          initialStyle={survey?.style || {}}
          surveyId={survey?.id}
          onChange={handleFormDataChange}
          saveButtonText="Update Survey"
          isLoading={isSaving}
        />
      </div>
    </div>
  );
}
