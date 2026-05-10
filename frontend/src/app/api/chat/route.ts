import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://127.0.0.1:5000";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userA = searchParams.get("userA");
  const userB = searchParams.get("userB");

  if (!userA || !userB) {
    return NextResponse.json(
      { error: "Нужны query-параметры userA и userB" },
      { status: 400 },
    );
  }

  const response = await fetch(`${BACKEND_URL}/chat/${userA}/${userB}`, {
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as unknown;

  return NextResponse.json(data, { status: response.status });
}
