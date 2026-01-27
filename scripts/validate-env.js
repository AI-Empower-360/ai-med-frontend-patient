#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates environment variables before build/start
 */

const fs = require("fs");
const path = require("path");

function validateEnv() {
  console.log("🔍 Validating environment configuration...\n");

  const envLocalPath = path.join(process.cwd(), ".env.local");
  const envExamplePath = path.join(process.cwd(), ".env.example");

  // Check if .env.local exists
  if (!fs.existsSync(envLocalPath)) {
    console.warn("⚠️  .env.local file not found!");
    console.warn("   Run: npm run setup");
    console.warn("   Or copy .env.example to .env.local\n");
    process.exit(1);
  }

  // Load environment variables
  require("dotenv").config({ path: envLocalPath });

  const requiredVars = ["NEXT_PUBLIC_API_BASE_URL"];
  const missingVars = [];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:");
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error("\n   Please update your .env.local file.\n");
    process.exit(1);
  }

  // Validate URL format
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  try {
    new URL(apiUrl);
  } catch {
    console.error(`❌ Invalid NEXT_PUBLIC_API_BASE_URL: "${apiUrl}"`);
    console.error("   Must be a valid URL (e.g., http://localhost:3001)\n");
    process.exit(1);
  }

  console.log("✅ Environment configuration is valid\n");
  console.log("📋 Configuration:");
  console.log(`   API URL: ${apiUrl}`);
  console.log(
    `   Demo Mode: ${process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "1" ? "Enabled" : "Disabled"}`
  );
  if (process.env.NEXT_PUBLIC_WS_BASE_URL) {
    console.log(`   WebSocket URL: ${process.env.NEXT_PUBLIC_WS_BASE_URL}`);
  }
  console.log();
}

// Only run if dotenv is available (optional dependency)
try {
  require("dotenv");
  validateEnv();
} catch {
  console.log("⚠️  dotenv package not found. Skipping validation.");
  console.log("   Install it with: npm install --save-dev dotenv\n");
}
