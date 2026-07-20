"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main className="flex flex-1 items-center justify-center bg-background">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-md border border-border bg-surface p-8 text-center">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Clarity-PM</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Gestión de proyectos de Persuasivo
          </p>
        </div>
        <button
          onClick={handleLogin}
          className="w-full rounded-md border border-border-strong bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-accent-soft"
        >
          Continuar con Google
        </button>
      </div>
    </main>
  );
}
