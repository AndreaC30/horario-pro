import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoHelpCircleOutline, IoMoonOutline, IoSunnyOutline } from "react-icons/io5";

import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { TYPE_BODY, TYPE_DISPLAY, TYPE_EYEBROW } from "../lib/typography";
import { changePassword, updateMe } from "../services/authService";
import { ApiError } from "../services/apiClient";

export function AccountPage() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();

  const [displayName, setDisplayName] = useState(user?.display_name ?? "");
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setProfileMsg(null);
    setProfileError(null);
    setSavingProfile(true);
    try {
      const updated = await updateMe({ display_name: displayName.trim() || null });
      setUser(updated);
      setProfileMsg("Nombre actualizado");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordMsg(null);
    setPasswordError(null);
    if (newPassword.length < 8) {
      setPasswordError("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (newPassword !== newPassword2) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setNewPassword2("");
      setPasswordMsg("Contraseña cambiada");
    } catch (err) {
      setPasswordError(
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : "No se pudo cambiar",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const greeting = user?.display_name?.trim() || user?.email || "cuenta";

  return (
    <div className="space-y-8 pb-8">
      <section className="space-y-1">
        <p className={TYPE_EYEBROW}>Perfil</p>
        <h2 className={TYPE_DISPLAY}>Hola, {greeting}</h2>
        <p className={TYPE_BODY}>{user?.email}</p>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">Nombre para mostrar</h3>
        <form className="space-y-3" onSubmit={(e) => void handleSaveProfile(e)}>
          <div>
            <Label htmlFor="display_name">Nombre</Label>
            <Input
              id="display_name"
              value={displayName}
              placeholder="Tu nombre"
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={120}
            />
          </div>
          {profileError ? <p className="text-sm text-danger">{profileError}</p> : null}
          {profileMsg ? <p className="text-sm text-text-secondary">{profileMsg}</p> : null}
          <Button type="submit" loading={savingProfile}>
            Guardar nombre
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">Cambiar contraseña</h3>
        <form className="space-y-3" onSubmit={(e) => void handleChangePassword(e)}>
          <div>
            <Label htmlFor="current_password">Contraseña actual</Label>
            <Input
              id="current_password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="new_password">Nueva contraseña</Label>
            <Input
              id="new_password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <Label htmlFor="new_password2">Repetir nueva</Label>
            <Input
              id="new_password2"
              type="password"
              autoComplete="new-password"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {passwordError ? <p className="text-sm text-danger">{passwordError}</p> : null}
          {passwordMsg ? <p className="text-sm text-text-secondary">{passwordMsg}</p> : null}
          <Button type="submit" variant="secondary" loading={savingPassword}>
            Cambiar contraseña
          </Button>
        </form>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-text-primary">Preferencias</h3>
        <button
          type="button"
          className="flex min-h-touch w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-text-primary transition hover:bg-[var(--bg-soft)]"
          onClick={() => toggleTheme()}
        >
          {theme === "dark" ? <IoSunnyOutline className="h-5 w-5" /> : <IoMoonOutline className="h-5 w-5" />}
          {theme === "dark" ? "Modo claro" : "Modo oscuro"}
        </button>
        <button
          type="button"
          className="flex min-h-touch w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-text-primary transition hover:bg-[var(--bg-soft)]"
          onClick={() => navigate("/dashboard", { state: { openTour: true } })}
        >
          <IoHelpCircleOutline className="h-5 w-5" />
          Ver guía
        </button>
        <p className={`${TYPE_BODY} px-3`}>
          <Link to="/calendario" className="font-medium text-primary no-underline hover:text-primary-hover">
            Abrir calendario
          </Link>
        </p>
      </section>

      <Button type="button" variant="ghost" className="w-full text-danger" onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </div>
  );
}
