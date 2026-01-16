import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Simple database query
    const userCount = await prisma.user.count();
    const grantCount = await prisma.grant.count();

    return NextResponse.json({
      success: true,
      users: userCount,
      grants: grantCount,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
        dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 30),
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      success: false,
      error: errorMessage,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
        dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 30),
      }
    }, { status: 500 });
  }
}
