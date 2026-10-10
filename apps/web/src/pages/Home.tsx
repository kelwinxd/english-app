import { MenuButtons, ApiStatusBadge, useHomeStatus } from '@/features/home';

export function Home() {
  const { status } = useHomeStatus();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">English App</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Seu inglês, aterrado no CEFR-J. Sem streak, sem liga.
        </p>
      </header>

      <MenuButtons />

      <ApiStatusBadge status={status} />
    </main>
  );
}
