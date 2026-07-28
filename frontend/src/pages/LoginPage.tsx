import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { BrandLogo } from "../components/ui/BrandLogo";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { useAuth } from "../hooks/useAuth";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { TYPE_BODY, TYPE_DISPLAY } from "../lib/typography";
import { ApiError } from "../services/apiClient";
import { OFFLINE_MESSAGE } from "../utils/network";

type Mode = "login" | "register";

function modeFromSearch(raw: string | null): Mode {
  return raw === "register" ? "register" : "login";
}

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isLoading, login, register } = useAuth();
  const [mode, setMode] = useState<Mode>(() => modeFromSearch(searchParams.get("mode")));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const online = useOnlineStatus();

  useEffect(() => {
    setMode(modeFromSearch(searchParams.get("mode")));
  }, [searchParams]);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setPassword("");
    setPassword2("");
    setSearchParams(next === "register" ? { mode: "register" } : {}, { replace: true });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (mode === "register") {
      if (password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres");
        return;
      }
      if (password !== password2) {
        setError("Las contraseñas no coinciden");
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === "register") {
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 401
          ? "Email o contraseña incorrectos"
          : err instanceof ApiError && err.status === 409
            ? "Ya existe una cuenta con ese email"
            : err instanceof ApiError
              ? err.message
              : err instanceof Error
                ? err.message
                : mode === "register"
                  ? "No se pudo crear la cuenta"
                  : "No se pudo iniciar sesión";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link
          to="/"
          className="text-sm font-medium text-text-muted no-underline transition hover:text-primary"
        >
          ← Volver a WorkShift
        </Link>
      </div>
      <div className="mb-8 flex w-full flex-col items-center gap-3">
        <BrandLogo size="xl" showText={false} />
        <h1 className={`${TYPE_DISPLAY} text-center text-primary`}>WorkShift</h1>
        <p className={`${TYPE_BODY} text-center`}>Registra tus jornadas y controla tus ingresos.</p>
      </div>

      <div className="card">
        <div
          className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-border bg-[var(--bg-soft)] p-1"
          role="tablist"
          aria-label="Acceso"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={`min-h-11 rounded-lg px-3 text-sm font-medium transition ${
              mode === "login"
                ? "bg-surface text-text-primary shadow-card"
                : "text-text-muted hover:text-text-primary"
            }`}
            onClick={() => switchMode("login")}
          >
            Entrar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            className={`min-h-11 rounded-lg px-3 text-sm font-medium transition ${
              mode === "register"
                ? "bg-surface text-text-primary shadow-card"
                : "text-text-muted hover:text-text-primary"
            }`}
            onClick={() => switchMode("register")}
          >
            Crear cuenta
          </button>
        </div>

        <p className={`mb-4 ${TYPE_BODY}`}>
          {mode === "login" ? "Accede a tu cuenta" : "Crea una cuenta nueva"}
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">
              {mode === "register" ? "Contraseña (mín. 8)" : "Contraseña"}
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              required
              minLength={mode === "register" ? 8 : undefined}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {mode === "register" ? (
            <div>
              <Label htmlFor="password2">Repetir contraseña</Label>
              <Input
                id="password2"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="••••••••"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
            </div>
          ) : null}

          {!online ? <p className="text-sm text-warning">{OFFLINE_MESSAGE}</p> : null}
          {error ? (
            <div className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          ) : null}

          <Button type="submit" className="w-full" loading={submitting} disabled={!online}>
            {mode === "register" ? "Crear cuenta" : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
