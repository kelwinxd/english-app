/** Três bolinhas pulando — o "fulano está digitando…". */
export function TypingIndicator() {
  return (
    <div className="self-start flex items-center gap-1 rounded-2xl rounded-bl-sm border bg-card px-4 py-3">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}
