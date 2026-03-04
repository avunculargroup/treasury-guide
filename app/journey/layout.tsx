import { ChatPanel } from '@/components/chat/chat-panel';

export default function JourneyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <ChatPanel />
    </>
  );
}
