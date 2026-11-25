import type { Metadata } from "next";
import ChatRoom from "./ChatRoom";

export const metadata: Metadata = {
  title: "Chat Global",
  robots: { index: false, follow: true },
};

export default function ChatPage() {
  return (
    <main className="mx-auto flex h-[100svh] max-w-3xl flex-col px-4 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-6">
      <ChatRoom />
    </main>
  );
}
