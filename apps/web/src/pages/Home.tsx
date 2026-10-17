import { MenuButtons, ApiStatusBadge, useHomeStatus } from '@/features/home';

export function Home() {
  const { status } = useHomeStatus();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-8">
      <header className="mb-10 flex items-center gap-3">
        <img src="/logo.png" alt="Bikuda" className="h-24 w-24 shrink-0 object-contain" />
        <div>
          <h1 className="font-nunito text-3xl font-bold tracking-tight text-[#0145af]">Bikuda</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Seu inglês, aterrado no CEFR-J. Sem streak, sem liga.
          </p>
        </div>
      </header>

      <MenuButtons />

      <ApiStatusBadge status={status} />
    </main>
  );
}
