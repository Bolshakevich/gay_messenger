import { NextResponse } from "next/server";

const BACKEND_URL = "http://127.0.0.1:5000";

export async function POST(request: Request) {
  const body = await request.text();

  const response = await fetch(`${BACKEND_URL}/messages`, {
    body,
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const data = (await response.json().catch(() => null)) as unknown;

  return NextResponse.json(data, { status: response.status });
}
