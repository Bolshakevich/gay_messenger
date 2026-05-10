import { ChatDialogScreen } from "../../../components/chat-dialog-screen";

type ChatPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  const targetUserId = Number(id);

  if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff6db_0%,#f7f1e3_42%,#efe7d6_100%)] px-4 py-10 text-stone-900 sm:px-6">
        <section className="mx-auto max-w-3xl rounded-[32px] border border-black/5 bg-white/85 p-8 shadow-[0_24px_80px_rgba(73,53,24,0.12)] backdrop-blur">
          <h1 className="text-3xl font-semibold tracking-tight">Некорректный чат</h1>
        </section>
      </main>
    );
  }

  return <ChatDialogScreen targetUserId={targetUserId} />;
}
