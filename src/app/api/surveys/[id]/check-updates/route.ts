import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params;
    const url = new URL(request.url);
    const currentVersion = url.searchParams.get("version");
    const lastUpdated = url.searchParams.get("lastUpdated");

    // Buscar la encuesta en la base de datos
    const survey = await db.survey.findUnique({
      where: {
        id: surveyId,
        isActive: true,
      },
      select: {
        version: true,
        updatedAt: true,
      },
    });

    if (!survey) {
      return NextResponse.json(
        { error: "Survey not found or inactive" },
        { status: 404 }
      );
    }

    const hasUpdates =
      !currentVersion ||
      !lastUpdated ||
      survey.version !== parseInt(currentVersion) ||
      survey.updatedAt.toISOString() !== lastUpdated;

    const response = NextResponse.json({
      hasUpdates,
      currentVersion: survey.version,
      lastUpdated: survey.updatedAt.toISOString(),
    });

    // Headers CORS
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );

    return response;
  } catch (error) {
    console.error("Error checking survey updates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Para manejar requests OPTIONS (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
