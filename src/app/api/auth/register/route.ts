import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const steps: string[] = [];

  try {
    steps.push("1. Getting raw body");
    const rawBody = await request.text();
    steps.push("2. Raw body length: " + rawBody.length);
    steps.push("3. Raw body preview: " + rawBody.substring(0, 100));

    steps.push("4. Parsing JSON");
    const body = JSON.parse(rawBody);
    const { email, password, name } = body;
    steps.push("5. Body parsed: " + email);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    steps.push("6. Checking if user exists");
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    steps.push("7. User check complete: " + (existingUser ? "exists" : "not found"));

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    steps.push("8. Hashing password");
    const hashedPassword = await bcrypt.hash(password, 12);
    steps.push("9. Password hashed");

    steps.push("10. Creating user");
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
      },
    });
    steps.push("11. User created: " + user.id);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Registration error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      {
        error: "Failed to create account",
        details: errorMessage,
        stack: errorStack?.split("\n").slice(0, 5),
        steps,
        debug: {
          hasDbUrl: !!process.env.DATABASE_URL,
          hasPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
          hasPostgresUrl: !!process.env.POSTGRES_URL,
        }
      },
      { status: 500 }
    );
  }
}
