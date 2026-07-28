import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AccountPage } from "./pages/AccountPage";
import { CalendarPage } from "./pages/CalendarPage";
import { ClientFormPage } from "./pages/ClientFormPage";
import { ClientsPage } from "./pages/ClientsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HistoryPage } from "./pages/HistoryPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { ShiftFormPage } from "./pages/ShiftFormPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/jornada/nueva" element={<ShiftFormPage />} />
        <Route path="/jornada/:id" element={<ShiftFormPage />} />
        <Route path="/historial" element={<HistoryPage />} />
        <Route path="/calendario" element={<CalendarPage />} />
        <Route path="/clientes" element={<ClientsPage />} />
        <Route path="/clientes/nuevo" element={<ClientFormPage />} />
        <Route path="/clientes/:id/editar" element={<ClientFormPage />} />
        <Route path="/cuenta" element={<AccountPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
