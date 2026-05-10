"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AUTH_USER_KEY } from "../lib/auth";
import { UserCard } from "./user-card";

type BackendUser = {
  id: number;
  username: string;
  display_name: string | null;
};

export function ChatsScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [currentUsername, setCurrentUsername] = useState("");

  useEffect(() => {
    const savedUser = window.localStorage.getItem(AUTH_USER_KEY);

    if (!savedUser) {
      router.replace("/");
      return;
    }

    startTransition(() => {
      setCurrentUsername(savedUser);
      setIsCheckingAuth(false);
    });
  }, [router]);

  useEffect(() => {
    if (isCheckingAuth) {
      return;
    }

    const loadUsers = async () => {
      try {
        const response = await fetch("/api/users", {
          cache: "no-store",
        });

        if (!response.ok) {
          setUsers([]);
          return;
        }

        const data = (await response.json()) as BackendUser[];
        setUsers(data);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    void loadUsers();
  }, [isCheckingAuth]);

  const handleLogout = () => {
    window.localStorage.removeItem(AUTH_USER_KEY);
    router.replace("/");
  };

  const visibleUsers = users.filter((user) => user.username !== currentUsername);

  if (isCheckingAuth) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff6db_0%,#f7f1e3_42%,#efe7d6_100%)] px-4 py-10 text-stone-900 sm:px-6">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="rounded-[32px] border border-black/5 bg-white/80 p-6 shadow-[0_24px_80px_rgba(73,53,24,0.12)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700/80">
            Messenger MVP
          </p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Чаты
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
                Вошли как <span className="font-semibold">{currentUsername}</span>.
                Выберите пользователя, чтобы начать диалог 1 на 1.
              </p>
            </div>

            <button
              className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              onClick={handleLogout}
              type="button"
            >
              Выйти
            </button>
          </div>
        </div>

        <div className="rounded-[32px] border border-black/5 bg-white/85 p-3 shadow-[0_24px_80px_rgba(73,53,24,0.12)] backdrop-blur">
          {isLoadingUsers ? (
            <div className="px-4 py-8 text-sm text-stone-500">
              Загружаем пользователей...
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {visibleUsers.map((user) => (
                <li key={user.id}>
                  <UserCard
                    href={`/chats/${user.id}`}
                    name={user.display_name || user.username}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
