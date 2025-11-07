import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "@/pages/DashboardPage";
import AssignmentsPage from "@/pages/AssignmentsPage";
import SurveyPage from "@/pages/SurveyPage";
import SavedSurveysPage from "@/pages/SavedSurveysPage";
import ReportsPage from "@/pages/ReportsPage";
import LoginPage from "@/pages/LoginPage";
import { TopNav } from "@/components/layout/TopNav";
import SurveyBuilderPage from "@/pages/SurveyBuilderPage";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // demo: true

  if (!isLoggedIn) {
    return <LoginPage onSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav onLogout={() => setIsLoggedIn(false)} />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/survey" element={<SurveyPage />} />
        <Route path="/saved" element={<SavedSurveysPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/survey-builder" element={<SurveyBuilderPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="border-t border-zinc-200 bg-white/60">
        <div className="px-8 py-3 text-xs text-zinc-500 flex items-center justify-between">
          <span>© 2025 Kurum A.Ş.</span>
          <span>Gizlilik • Kullanım Koşulları</span>
        </div>
      </footer>
    </div>
  );
}
