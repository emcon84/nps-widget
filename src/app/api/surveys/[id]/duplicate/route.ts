import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/surveys/[id]/duplicate - Duplicar survey
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const originalSurvey = await db.survey.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!originalSurvey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    // Create duplicate with "Copy of" prefix
    const duplicatedSurvey = await db.survey.create({
      data: {
        title: `Copy of ${originalSurvey.title}`,
        description: originalSurvey.description,
        elements: originalSurvey.elements as any,
        settings: originalSurvey.settings as any,
        style: originalSurvey.style as any,
        isActive: false, // Duplicates start as inactive
        version: 1,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    return NextResponse.json(duplicatedSurvey);
  } catch (error) {
    console.error("Error duplicating survey:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
