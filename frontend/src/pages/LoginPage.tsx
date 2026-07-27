import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { BrandLogo } from "../components/ui/BrandLogo";
import { AuroraText } from "../components/effects/AuroraText";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { useAuth } from "../hooks/useAuth";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { ApiError } from "../services/apiClient";
import { OFFLINE_MESSAGE } from "../utils/network";

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const online = useOnlineStatus();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 401
          ? "Email o contraseña incorrectos"
          : err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "No se pudo iniciar sesión";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-6 py-8">
      <div className="mb-10 flex w-full flex-col items-center gap-3">
        <BrandLogo size="xl" showText={false} />
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          <AuroraText>WorkShift</AuroraText>
        </h1>
      </div>

      <div className="card">
        <p className="mb-5 text-sm text-text-secondary">Registra tus jornadas y controla tus ingresos.</p>

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
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {!online ? <p className="text-sm text-warning">{OFFLINE_MESSAGE}</p> : null}
          {error ? (
            <div className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          ) : null}

          <Button type="submit" className="w-full" loading={submitting} disabled={!online}>
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
