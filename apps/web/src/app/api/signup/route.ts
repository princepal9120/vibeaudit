import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const SIGNUPS_FILE = path.join(process.cwd(), "data", "signups.json");

interface Signup {
  email: string;
  createdAt: string;
  source: string;
}

async function ensureDataDir() {
  const dataDir = path.dirname(SIGNUPS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function getSignups(): Promise<Signup[]> {
  try {
    const data = await fs.readFile(SIGNUPS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveSignups(signups: Signup[]) {
  await ensureDataDir();
  await fs.writeFile(SIGNUPS_FILE, JSON.stringify(signups, null, 2));
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const signups = await getSignups();

    const existingSignup = signups.find((s) => s.email === normalizedEmail);
    if (existingSignup) {
      return NextResponse.json(
        { message: "You're already on the list!", alreadySignedUp: true },
        { status: 200 }
      );
    }

    const newSignup: Signup = {
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
      source: "landing_page",
    };

    signups.push(newSignup);
    await saveSignups(signups);

    console.log(`New signup: ${normalizedEmail} (Total: ${signups.length})`);

    return NextResponse.json(
      {
        message: "Successfully signed up!",
        signupCount: signups.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const signups = await getSignups();
    return NextResponse.json({
      count: signups.length,
      message: `${signups.length} people have signed up`,
    });
  } catch (error) {
    console.error("Error fetching signups:", error);
    return NextResponse.json(
      { error: "Failed to fetch signup count" },
      { status: 500 }
    );
  }
}
