#!/usr/bin/env node

/**
 * Setup Script for AI Med Patient Portal
 * Helps initialize the development environment
 */

const fs = require("fs");
const path = require("path");

const ENV_EXAMPLE = ".env.example";
const ENV_LOCAL = ".env.local";

function setup() {
  console.log("🚀 Setting up AI Med Patient Portal...\n");

  const envExamplePath = path.join(process.cwd(), ENV_EXAMPLE);
  const envLocalPath = path.join(process.cwd(), ENV_LOCAL);

  // Check if .env.local already exists
  if (fs.existsSync(envLocalPath)) {
    console.log("✅ .env.local already exists");
    console.log("   If you want to recreate it, delete .env.local and run this script again.\n");
    return;
  }

  // Check if .env.example exists
  if (!fs.existsSync(envExamplePath)) {
    console.error("❌ .env.example file not found!");
    console.error("   Please ensure .env.example exists in the project root.\n");
    process.exit(1);
  }

  // Copy .env.example to .env.local
  try {
    const envExampleContent = fs.readFileSync(envExamplePath, "utf8");
    fs.writeFileSync(envLocalPath, envExampleContent);
    console.log("✅ Created .env.local from .env.example");
    console.log("   Please update .env.local with your configuration values.\n");
  } catch (error) {
    console.error("❌ Error creating .env.local:", error.message);
    process.exit(1);
  }

  // Check if node_modules exists
  const nodeModulesPath = path.join(process.cwd(), "node_modules");
  if (!fs.existsSync(nodeModulesPath)) {
    console.log("📦 Installing dependencies...");
    console.log("   Run: npm install\n");
  } else {
    console.log("✅ Dependencies are installed\n");
  }

  console.log("✨ Setup complete!");
  console.log("\n📝 Next steps:");
  console.log("   1. Edit .env.local with your configuration");
  console.log("   2. Run: npm run dev");
  console.log("   3. Open http://localhost:3000\n");
}

setup();
