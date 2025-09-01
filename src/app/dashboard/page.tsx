"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Settings,
  BarChart3,
  LogOut,
  Edit,
  Copy,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

interface Survey {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    responses: number;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchSurveys();
    }
  }, [status, router]);

  const fetchSurveys = async () => {
    try {
      const response = await fetch("/api/surveys");
      if (response.ok) {
        const data = await response.json();
        setSurveys(data);
      } else {
        console.error("Failed to fetch surveys");
      }
    } catch (error) {
      console.error("Error fetching surveys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (surveyId: string) => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}/duplicate`, {
        method: "POST",
      });
      if (response.ok) {
        fetchSurveys(); // Refresh the list
      } else {
        alert("Failed to duplicate survey");
      }
    } catch (error) {
      console.error("Error duplicating survey:", error);
      alert("Error duplicating survey");
    }
  };

  const handleDelete = async (surveyId: string) => {
    if (!confirm("Are you sure you want to delete this survey?")) {
      return;
    }

    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchSurveys(); // Refresh the list
      } else {
        alert("Failed to delete survey");
      }
    } catch (error) {
      console.error("Error deleting survey:", error);
      alert("Error deleting survey");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                NPS Widget Designer
              </h1>
              <p className="text-gray-600">
                Welcome back, {session.user?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => signOut()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/dashboard/new"
              className="group block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Plus className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                    Create New Survey
                  </h3>
                  <p className="text-sm text-gray-500">
                    Design a new NPS survey from scratch
                  </p>
                </div>
              </div>
            </Link>

            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Analytics
                  </h3>
                  <p className="text-sm text-gray-500">
                    View your survey performance
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Settings className="h-8 w-8 text-gray-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Settings
                  </h3>
                  <p className="text-sm text-gray-500">
                    Manage your account settings
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Surveys */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Your Surveys ({surveys.length})
              </h2>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">
                    Loading surveys...
                  </p>
                </div>
              ) : surveys.length === 0 ? (
                <div className="text-center py-12">
                  <Plus className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No surveys yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first NPS survey.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/dashboard/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Survey
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {surveys.map((survey) => (
                    <div
                      key={survey.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      {/* Survey Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {survey.title}
                          </h3>
                          {survey.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {survey.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center ml-2">
                          {survey.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Eye className="w-3 h-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Draft
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Survey Stats */}
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        <span>{survey._count.responses} responses</span>
                        <span className="mx-2">•</span>
                        <span>v{survey.version}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/dashboard/edit/${survey.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Link>

                        <button
                          onClick={() => handleDuplicate(survey.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Duplicate
                        </button>

                        <Link
                          href={`/dashboard/results/${survey.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Results
                        </Link>

                        <button
                          onClick={() => handleDelete(survey.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </button>
                      </div>

                      {/* Created Date */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                          Created{" "}
                          {new Date(survey.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
