import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const SHIPPING_INTENT_FILE = path.join(process.cwd(), "data", "shipping-intent.json");

interface ShippingIntentResponse {
  wouldUseBeforeShipping: boolean;
  feedback?: string;
  createdAt: string;
  source: string;
}

interface ShippingIntentStats {
  totalResponses: number;
  wouldUse: number;
  wouldNotUse: number;
  percentageWouldUse: number;
  meetsTarget: boolean;
  target: number;
}

async function ensureDataDir() {
  const dataDir = path.dirname(SHIPPING_INTENT_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function getResponses(): Promise<ShippingIntentResponse[]> {
  try {
    const data = await fs.readFile(SHIPPING_INTENT_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveResponses(responses: ShippingIntentResponse[]) {
  await ensureDataDir();
  await fs.writeFile(SHIPPING_INTENT_FILE, JSON.stringify(responses, null, 2));
}

function calculateStats(responses: ShippingIntentResponse[]): ShippingIntentStats {
  const target = 50; // Target: 50%+ say "I'd use this before shipping"

  if (responses.length === 0) {
    return {
      totalResponses: 0,
      wouldUse: 0,
      wouldNotUse: 0,
      percentageWouldUse: 0,
      meetsTarget: false,
      target,
    };
  }

  const wouldUse = responses.filter(r => r.wouldUseBeforeShipping).length;
  const wouldNotUse = responses.length - wouldUse;
  const percentageWouldUse = Math.round((wouldUse / responses.length) * 100);

  return {
    totalResponses: responses.length,
    wouldUse,
    wouldNotUse,
    percentageWouldUse,
    meetsTarget: percentageWouldUse >= target,
    target,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wouldUseBeforeShipping, feedback } = body;

    if (typeof wouldUseBeforeShipping !== "boolean") {
      return NextResponse.json(
        { error: "wouldUseBeforeShipping must be a boolean" },
        { status: 400 }
      );
    }

    const responses = await getResponses();

    const newResponse: ShippingIntentResponse = {
      wouldUseBeforeShipping,
      createdAt: new Date().toISOString(),
      source: "landing_page",
    };

    if (feedback && typeof feedback === "string") {
      newResponse.feedback = feedback.trim();
    }

    responses.push(newResponse);
    await saveResponses(responses);

    const stats = calculateStats(responses);

    console.log(
      `Shipping intent: ${wouldUseBeforeShipping ? "Yes" : "No"} (${stats.percentageWouldUse}% would use, ${stats.totalResponses} total)`
    );

    return NextResponse.json(
      {
        message: "Thank you for your feedback!",
        stats: {
          percentageWouldUse: stats.percentageWouldUse,
          meetsTarget: stats.meetsTarget,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Shipping intent submission error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const responses = await getResponses();
    const stats = calculateStats(responses);

    return NextResponse.json({
      ...stats,
      message:
        stats.totalResponses > 0
          ? `${stats.percentageWouldUse}% would use before shipping (${stats.totalResponses} responses)`
          : "No responses yet",
    });
  } catch (error) {
    console.error("Error fetching shipping intent stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping intent stats" },
      { status: 500 }
    );
  }
}
