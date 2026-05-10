import { FunnyAuthForm } from "../components/funny-auth-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff6db_0%,#f7f1e3_42%,#efe7d6_100%)] px-4 py-10 text-stone-900 sm:px-6">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="rounded-[32px] border border-black/5 bg-white/80 p-6 shadow-[0_24px_80px_rgba(73,53,24,0.12)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700/80">
            Messenger MVP
          </p>
          <div className="mt-3">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Вход
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
                Сначала войдите, и только потом откроется страница с чатами.
              </p>
            </div>
          </div>
        </div>

        <FunnyAuthForm />
      </section>
    </main>
  );
}
