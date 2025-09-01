// This script helps switch between SQLite (development) and PostgreSQL (production)
// Run with: pnpm run db:dev or pnpm run db:prod

const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "prisma", "schema.prisma");
const envLocalPath = path.join(__dirname, ".env.local");

// Base schema content (everything except datasource)
const baseSchema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}`;

// PostgreSQL datasource (for production)
const postgresqlDatasource = `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`;

// SQLite datasource (for development)
const sqliteDatasource = `
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`;

// Read the current schema and extract models
const currentSchema = fs.readFileSync(schemaPath, "utf8");
const modelsSection =
  currentSchema.split("// NextAuth.js required models")[1] || "";

function updateSchema(datasource, environment) {
  const newSchema =
    baseSchema +
    datasource +
    "\n\n// NextAuth.js required models" +
    modelsSection;

  fs.writeFileSync(schemaPath, newSchema);
  console.log(`✅ Schema updated for ${environment} environment`);
  console.log(
    `   Provider: ${datasource.includes("postgresql") ? "PostgreSQL" : "SQLite"}`
  );
}

function ensureLocalEnv() {
  const localEnvContent = `# Local development with SQLite
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
`;

  if (!fs.existsSync(envLocalPath)) {
    fs.writeFileSync(envLocalPath, localEnvContent);
    console.log("✅ Created .env.local for development");
  } else {
    // Ensure DATABASE_URL is SQLite in .env.local
    let envLocal = fs.readFileSync(envLocalPath, "utf8");
    if (!envLocal.includes("file:./prisma/dev.db")) {
      envLocal = envLocal.replace(
        /DATABASE_URL=.*/g,
        'DATABASE_URL="file:./prisma/dev.db"'
      );
      fs.writeFileSync(envLocalPath, envLocal);
      console.log("✅ Updated .env.local for SQLite");
    }
  }
}

const command = process.argv[2];

switch (command) {
  case "dev":
    ensureLocalEnv();
    updateSchema(sqliteDatasource, "development");
    break;
  case "prod":
    updateSchema(postgresqlDatasource, "production");
    break;
  default:
    console.log("Usage: node switch-db.js [dev|prod]");
    console.log("  dev  - Switch to SQLite for local development");
    console.log("  prod - Switch to PostgreSQL for production");
    process.exit(1);
}
