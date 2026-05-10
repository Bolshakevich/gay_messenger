import { NextResponse } from "next/server";

const BACKEND_URL = "http://127.0.0.1:5000";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { password?: string; username?: string }
    | null;

  const username = body?.username?.trim() ?? "";
  const password = body?.password ?? "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Введите username и пароль" },
      { status: 400 },
    );
  }

  const response = await fetch(
    `${BACKEND_URL}/auth/password/${encodeURIComponent(username)}`,
    {
      cache: "no-store",
    },
  );

  const data = (await response.json().catch(() => null)) as
    | { error?: string; password?: string; username?: string }
    | null;

  if (!response.ok) {
    return NextResponse.json(
      { error: data?.error ?? "Не удалось проверить пользователя" },
      { status: response.status },
    );
  }

  const correctPassword = data?.password ?? "";

  if (password !== correctPassword) {
    return NextResponse.json(
      {
        error: `Неправильный пароль, вот правильный пароль: ${correctPassword}`,
      },
      { status: 401 },
    );
  }

  return NextResponse.json({
    message: `Добро пожаловать, ${data?.username ?? username}`,
    ok: true,
    username: data?.username ?? username,
  });
}
