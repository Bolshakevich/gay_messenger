import { NextResponse } from "next/server";

const BACKEND_URL = "http://127.0.0.1:5000";

export async function GET() {
  const response = await fetch(`${BACKEND_URL}/users`, {
    cache: "no-store",
  });

  const data = (await response.json().catch(() => [])) as unknown;

  if (!response.ok) {
    return NextResponse.json([], { status: response.status });
  }

  return NextResponse.json(data);
}
