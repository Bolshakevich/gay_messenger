"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { AUTH_USER_KEY } from "../lib/auth";

type AuthState = {
  message: string;
  tone: "idle" | "error" | "success";
};

const initialState: AuthState = {
  message: "",
  tone: "idle",
};

export function FunnyAuthForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<AuthState>(initialState);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setState(initialState);

    try {
      const response = await fetch("/api/funny-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string; message?: string; username?: string }
        | null;

      if (!response.ok) {
        setState({
          message: data?.error ?? "Что-то пошло не так",
          tone: "error",
        });
        return;
      }

      setState({
        message: data?.message ?? "Успешный вход",
        tone: "success",
      });
      window.localStorage.setItem(
        AUTH_USER_KEY,
        data?.username ?? username.trim(),
      );
      router.push("/chats");
    } finally {
      setIsLoading(false);
    }
  };

  const messageClassName =
    state.tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : state.tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "hidden";

  return (
    <div className="rounded-[32px] border border-black/5 bg-white/85 p-6 shadow-[0_24px_80px_rgba(73,53,24,0.12)] backdrop-blur">
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700/80">
          Funny Auth
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
          Шуточная авторизация
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Если ввести неверный пароль, приложение любезно подскажет
          правильный.
        </p>
      </div>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-700">Username</span>
          <input
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:bg-white"
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Например, artem"
            value={username}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-stone-700">Пароль</span>
          <input
            className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:bg-white"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Введите любой пароль"
            type="password"
            value={password}
          />
        </label>

        <button
          className="mt-2 inline-flex items-center justify-center rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-amber-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Проверяем..." : "Войти"}
        </button>

        <div
          className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${messageClassName}`}
        >
          {state.message}
        </div>
      </form>
    </div>
  );
}
