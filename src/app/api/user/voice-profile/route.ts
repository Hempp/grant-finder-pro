import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { extractVoiceProfile, getVoiceProfile } from "@/lib/voice-profile/extract";

/** GET — load the current user's stored voice profile. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getVoiceProfile(session.user.id);
  return NextResponse.json({ profile });
}

/**
 * POST — re-extract voice from the user's current Content Library.
 * Rate-limited under the "ai" bucket since it calls Claude.
 *
 * Returns 422 (not 400) when the user has fewer than 3 content blocks —
 * that's not a request error, it's a "you don't have enough signal yet"
 * state the UI should handle by prompting the user to add more content.
 */
export async function POST(_request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimitResult = await rateLimit("ai", `user:${session.user.id}`);
  if (!rateLimitResult.success && rateLimitResult.response) {
    return rateLimitResult.response;
  }

  try {
    const profile = await extractVoiceProfile(session.user.id);
    if (!profile) {
      return NextResponse.json(
        {
          error:
            "Not enough writing yet. Add at least 3 content blocks (mission, team bios, past performance) and try again.",
          code: "INSUFFICIENT_SIGNAL",
        },
        { status: 422 }
      );
    }
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Voice profile extraction failed:", error);
    return NextResponse.json(
      { error: "Failed to extract voice profile. Please try again." },
      { status: 500 }
    );
  }
}
