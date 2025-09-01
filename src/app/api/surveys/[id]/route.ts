import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/surveys/[id] - Obtener survey específico
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const survey = await db.survey.findFirst({
      where: {
        id: params.id,
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

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    return NextResponse.json(survey);
  } catch (error) {
    console.error("Error fetching survey:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/surveys/[id] - Actualizar survey
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, elements, settings, style, isActive } =
      await req.json();

    const existingSurvey = await db.survey.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingSurvey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    const survey = await db.survey.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        description,
        elements,
        settings,
        style,
        isActive,
        version: existingSurvey.version + 1, // Increment version for cache busting
      },
      include: {
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    return NextResponse.json(survey);
  } catch (error) {
    console.error("Error updating survey:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/surveys/[id] - Eliminar survey
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingSurvey = await db.survey.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingSurvey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    await db.survey.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Survey deleted successfully" });
  } catch (error) {
    console.error("Error deleting survey:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
