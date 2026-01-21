import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const PREORDERS_FILE = path.join(process.cwd(), "data", "preorders.json");

interface Preorder {
  email: string;
  plan: "single" | "triple" | "waitlist" | "current";
  price: number;
  createdAt: string;
  source: string;
}

async function ensureDataDir() {
  const dataDir = path.dirname(PREORDERS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function getPreorders(): Promise<Preorder[]> {
  try {
    const data = await fs.readFile(PREORDERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function savePreorders(preorders: Preorder[]) {
  await ensureDataDir();
  await fs.writeFile(PREORDERS_FILE, JSON.stringify(preorders, null, 2));
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, plan } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!plan || !["single", "triple", "waitlist", "current"].includes(plan)) {
      return NextResponse.json(
        { error: "Please select a valid plan" },
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

    const preorders = await getPreorders();

    const existingPreorder = preorders.find((p) => p.email === normalizedEmail);
    if (existingPreorder) {
      return NextResponse.json(
        { message: "You've already reserved your spot!", alreadyPreordered: true },
        { status: 200 }
      );
    }

    const price = plan === "single" ? 25 : plan === "triple" ? 60 : 0;

    const newPreorder: Preorder = {
      email: normalizedEmail,
      plan: plan as Preorder["plan"],
      price,
      createdAt: new Date().toISOString(),
      source: "landing_page_preorder",
    };

    preorders.push(newPreorder);
    await savePreorders(preorders);

    // Send confirmation email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: "VibeAudit <notifications@vibeaudit.dev>",
          to: normalizedEmail,
          subject: "You're on the VibeAudit waitlist!",
          html: `
            <h1>Welcome to the VibeAudit Waitlist!</h1>
            <p>Thanks for joining the waitlist for the <strong>${plan}</strong> plan.</p>
            <p>We'll notify you as soon as we're ready for more users.</p>
            <p>Best,<br/>The VibeAudit Team</p>
          `,
        });
        console.log(`Confirmation email sent to ${normalizedEmail}`);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the whole request if email fails
      }
    } else {
      console.warn("RESEND_API_KEY not found, skipping email notification");
    }

    console.log(`New preorder: ${normalizedEmail} - ${plan} plan ($${price}) (Total: ${preorders.length})`);

    return NextResponse.json(
      {
        message: "Successfully reserved!",
        preorderCount: preorders.length,
        plan,
        price,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Preorder error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    const preorders = await getPreorders();
    const totalRevenue = preorders.reduce((sum, p) => sum + p.price, 0);
    return NextResponse.json({
      count: preorders.length,
      totalRevenue,
      message: `${preorders.length} people have pre-ordered ($${totalRevenue} in committed revenue)`,
    });
  } catch (error) {
    console.error("Error fetching preorders:", error);
    return NextResponse.json(
      { error: "Failed to fetch preorder count" },
      { status: 500 }
    );
  }
}
