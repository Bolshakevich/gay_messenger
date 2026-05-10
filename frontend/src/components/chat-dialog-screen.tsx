"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AUTH_USER_KEY } from "../lib/auth";

type ChatDialogScreenProps = {
  targetUserId: number;
};

type BackendUser = {
  id: number;
  username: string;
  display_name: string | null;
};

type ChatMessage = {
  id: number;
  dialog_id: number;
  user_send_id: number;
  message: string;
  sent_at: string;
};

type ChatResponse = {
  dialog: {
    id: number;
    user_1_id: number;
    user_2_id: number;
  };
  messages: ChatMessage[];
};

export function ChatDialogScreen({ targetUserId }: ChatDialogScreenProps) {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<BackendUser | null>(null);
  const [targetUser, setTargetUser] = useState<BackendUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUsername = window.localStorage.getItem(AUTH_USER_KEY);

    if (!savedUsername) {
      router.replace("/");
      return;
    }

    const loadChat = async () => {
      try {
        const usersResponse = await fetch("/api/users", {
          cache: "no-store",
        });

        if (!usersResponse.ok) {
          setError("Не удалось загрузить пользователей");
          return;
        }

        const users = (await usersResponse.json()) as BackendUser[];
        const me = users.find((user) => user.username === savedUsername) ?? null;
        const otherUser = users.find((user) => user.id === targetUserId) ?? null;

        if (!me) {
          window.localStorage.removeItem(AUTH_USER_KEY);
          router.replace("/");
          return;
        }

        if (!otherUser) {
          setError("Пользователь не найден");
          return;
        }

        const chatResponse = await fetch(
          `/api/chat?userA=${me.id}&userB=${otherUser.id}`,
          {
            cache: "no-store",
          },
        );

        const chatData = (await chatResponse.json().catch(() => null)) as
          | ChatResponse
          | { error?: string }
          | null;

        if (!chatResponse.ok) {
          setError(chatData && "error" in chatData ? chatData.error ?? "Не удалось загрузить чат" : "Не удалось загрузить чат");
          return;
        }

        startTransition(() => {
          setCurrentUser(me);
          setTargetUser(otherUser);
          setMessages(chatData && "messages" in chatData ? chatData.messages : []);
        });
      } finally {
        setIsCheckingAuth(false);
        setIsLoading(false);
      }
    };

    void loadChat();
  }, [router, targetUserId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentUser || !targetUser || !text.trim()) {
      return;
    }

    setIsSending(true);
    setError("");

    try {
      const response = await fetch("/api/messages", {
        body: JSON.stringify({
          from_user_id: currentUser.id,
          message: text.trim(),
          to_user_id: targetUser.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string; message?: ChatMessage }
        | null;

      if (!response.ok) {
        setError(data?.error ?? "Не удалось отправить сообщение");
        return;
      }

      if (data?.message) {
        setMessages((currentMessages) => [...currentMessages, data.message as ChatMessage]);
      }
      setText("");
    } finally {
      setIsSending(false);
    }
  };

  if (isCheckingAuth) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff6db_0%,#f7f1e3_42%,#efe7d6_100%)] px-4 py-10 text-stone-900 sm:px-6">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="rounded-[32px] border border-black/5 bg-white/85 p-6 shadow-[0_24px_80px_rgba(73,53,24,0.12)] backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700/80">
                Private Chat
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {targetUser?.display_name || targetUser?.username || "Диалог"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {currentUser ? `Пишете от имени ${currentUser.display_name || currentUser.username}.` : "Загружаем диалог..."}
              </p>
            </div>

            <Link
              className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              href="/chats"
            >
              Назад
            </Link>
          </div>
        </div>

        <div className="rounded-[32px] border border-black/5 bg-white/85 p-4 shadow-[0_24px_80px_rgba(73,53,24,0.12)] backdrop-blur">
          {isLoading ? (
            <div className="px-4 py-12 text-sm text-stone-500">Загружаем сообщения...</div>
          ) : (
            <div className="flex min-h-[360px] flex-col gap-3">
              {messages.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-[24px] border border-dashed border-stone-200 bg-stone-50/80 px-6 py-10 text-center text-sm leading-6 text-stone-500">
                  Сообщений пока нет. Можно начать разговор первым.
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {messages.map((message) => {
                    const isMine = message.user_send_id === currentUser?.id;

                    return (
                      <li
                        key={message.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-[24px] px-4 py-3 text-sm leading-6 shadow-sm ${
                            isMine
                              ? "bg-stone-900 text-amber-50"
                              : "bg-amber-50 text-stone-800"
                          }`}
                        >
                          <p>{message.message}</p>
                          <p
                            className={`mt-2 text-xs ${
                              isMine ? "text-amber-100/80" : "text-stone-500"
                            }`}
                          >
                            {new Date(message.sent_at).toLocaleString("ru-RU")}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        <form
          className="rounded-[32px] border border-black/5 bg-white/85 p-4 shadow-[0_24px_80px_rgba(73,53,24,0.12)] backdrop-blur"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-3">
            <textarea
              className="min-h-28 rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-300 focus:bg-white"
              onChange={(event) => setText(event.target.value)}
              placeholder="Напиши что-нибудь смешное..."
              value={text}
            />

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="flex justify-end">
              <button
                className="inline-flex items-center justify-center rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-amber-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSending || !currentUser || !targetUser || !text.trim()}
                type="submit"
              >
                {isSending ? "Отправляем..." : "Отправить"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
