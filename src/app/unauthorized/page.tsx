export default function UnauthorizedPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-background">
      <div className="max-w-sm rounded-md border border-border bg-surface p-8 text-center">
        <h1 className="text-lg font-semibold text-text-primary">
          Acceso no autorizado
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Esta cuenta de Google no tiene acceso a Clarity-PM.
        </p>
      </div>
    </main>
  );
}
