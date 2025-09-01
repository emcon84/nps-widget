import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a test user for development
  const hashedPassword = await bcrypt.hash("123456", 12);

  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
      password: hashedPassword,
    },
  });

  console.log("✅ Created test user:", user.email);
  console.log("📧 Email: test@example.com");
  console.log("🔑 Password: 123456");

  // Create a sample survey
  const survey = await prisma.survey.upsert({
    where: { id: "sample-survey" },
    update: {},
    create: {
      id: "sample-survey",
      title: "Sample NPS Survey",
      description: "A sample survey for testing",
      isActive: true,
      userId: user.id,
      elements: [
        {
          id: "nps-1",
          type: "nps",
          label: "How likely are you to recommend us?",
          position: { x: 100, y: 100 },
          dimensions: { width: 500, height: 120 },
          minValue: 0,
          maxValue: 10,
          minLabel: "Not likely",
          maxLabel: "Very likely",
          displayType: "numbers",
        },
        {
          id: "submit-btn",
          type: "button",
          label: "Submit",
          text: "Submit Feedback",
          position: { x: 100, y: 250 },
          dimensions: { width: 200, height: 50 },
          variant: "primary",
          action: "submit",
        },
      ],
      settings: {
        submitEndpoint: "",
        submitMethod: "POST",
        successMessage: "¡Gracias por tu feedback!",
        errorMessage: "Error al enviar. Por favor intenta de nuevo.",
      },
      style: {},
    },
  });

  console.log("✅ Created sample survey:", survey.title);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
