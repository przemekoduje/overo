import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";
import "./styles.scss";
import LoginPage from "./pages/LoginPage/LoginPage"; // <-- 2. Import
import EditorPage from "./pages/EditorPage/EditorPage";

import S1 from "./sections/S1";
import S2 from "./sections/S2";
import S3 from "./sections/S3";
import S4 from "./sections/S4";
import S5 from "./sections/S5";
import S6 from "./sections/S6";

// jeśli masz już stronę edytora:

function ProtectedRoute({ children }) {
  const { currentUser, isAdmin } = useAuth(); // Pobieramy też informację o adminie
  // Wpuść tylko, jeśli ktoś jest zalogowany I JEST ADMINEM
  return currentUser && isAdmin ? children : <Navigate to="/login" />;
}


function Home() {
  return (
    <main className="page">
      <S1 />
      <S2 />
      <S3 />
      <S4 />
      <S5 />
      <S6 />
    </main>
  );
}

export default function App() {
  return (
    // AuthProvider musi być na zewnątrz BrowserRouter, aby kontekst był dostępny wszędzie.
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Trasa publiczna - strona główna */}
          <Route path="/" element={<Home />} />

          {/* Trasa publiczna - strona logowania */}
          <Route path="/login" element={<LoginPage />} />

          {/* Trasa chroniona - strona edytora */}
          <Route
            path="/editor"
            element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            }
          />

          {/* Przekierowanie dla nieznalezionych ścieżek */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
