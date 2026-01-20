import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const NPS_FILE = path.join(process.cwd(), "data", "nps.json");

interface NPSResponse {
  email?: string;
  score: number;
  feedback?: string;
  createdAt: string;
  source: string;
}

interface NPSStats {
  totalResponses: number;
  promoters: number;
  passives: number;
  detractors: number;
  npsScore: number;
}

async function ensureDataDir() {
  const dataDir = path.dirname(NPS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function getNPSResponses(): Promise<NPSResponse[]> {
  try {
    const data = await fs.readFile(NPS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveNPSResponses(responses: NPSResponse[]) {
  await ensureDataDir();
  await fs.writeFile(NPS_FILE, JSON.stringify(responses, null, 2));
}

function calculateNPS(responses: NPSResponse[]): NPSStats {
  if (responses.length === 0) {
    return {
      totalResponses: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
      npsScore: 0,
    };
  }

  let promoters = 0;
  let passives = 0;
  let detractors = 0;

  for (const response of responses) {
    if (response.score >= 9) {
      promoters++;
    } else if (response.score >= 7) {
      passives++;
    } else {
      detractors++;
    }
  }

  const total = responses.length;
  const npsScore = Math.round(((promoters - detractors) / total) * 100);

  return {
    totalResponses: total,
    promoters,
    passives,
    detractors,
    npsScore,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, score, feedback } = body;

    if (typeof score !== "number" || score < 0 || score > 10) {
      return NextResponse.json(
        { error: "Score must be a number between 0 and 10" },
        { status: 400 }
      );
    }

    const responses = await getNPSResponses();

    const newResponse: NPSResponse = {
      score,
      createdAt: new Date().toISOString(),
      source: "landing_page",
    };

    if (email && typeof email === "string") {
      newResponse.email = email.toLowerCase().trim();
    }

    if (feedback && typeof feedback === "string") {
      newResponse.feedback = feedback.trim();
    }

    responses.push(newResponse);
    await saveNPSResponses(responses);

    const stats = calculateNPS(responses);

    console.log(
      `New NPS response: ${score} (NPS: ${stats.npsScore}, Total: ${stats.totalResponses})`
    );

    return NextResponse.json(
      {
        message: "Thank you for your feedback!",
        npsScore: stats.npsScore,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("NPS submission error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const responses = await getNPSResponses();
    const stats = calculateNPS(responses);

    return NextResponse.json({
      ...stats,
      target: 30,
      meetsTarget: stats.npsScore > 30,
      message:
        stats.totalResponses > 0
          ? `NPS Score: ${stats.npsScore} (${stats.totalResponses} responses)`
          : "No responses yet",
    });
  } catch (error) {
    console.error("Error fetching NPS stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch NPS stats" },
      { status: 500 }
    );
  }
}
