import { useState } from "react";
import AdminMessageConsole from "@/pages/AdminMessageConsole";
import Home from "@/pages/Home";
import ArrangementPage from "@/pages/Arrangement";
import { PreferencesProvider } from "@/settings/preferences";

export type PageType = "records" | "insight" | "mine" | "arrangement";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("records");
  const isAdminConsole =
    typeof window !== "undefined" && window.location.pathname === "/sendtest";
  const isArrangement =
    typeof window !== "undefined" && window.location.pathname === "/arrangement";

  return (
    <PreferencesProvider>
      {isAdminConsole ? (
        <AdminMessageConsole />
      ) : isArrangement ? (
        <ArrangementPage />
      ) : (
        <Home currentPage={currentPage} onNavigate={setCurrentPage} />
      )}
    </PreferencesProvider>
  );
}

