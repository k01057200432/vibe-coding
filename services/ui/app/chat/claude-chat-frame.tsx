"use client";

export function ClaudeChatFrame({ url }: { url: string }) {
  return (
    <div className="-m-4 flex h-[calc(100dvh-3.5rem)] md:h-dvh">
      <iframe
        src={url}
        className="h-full w-full border-0"
        title="Claude Chat"
        allow="clipboard-write"
      />
    </div>
  );
}
