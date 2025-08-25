// src/App.js

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useScrollDirection } from "./hooks/useScrollDirection"; // Import naszego nowego hooka
import React, { useRef, useState, useEffect } from 'react';  // <-- 1. Zaimportuj useRef
import Header from "./components/Header/Header";
import { useElementOnScreen } from "./hooks/useElementOnScreen";
import "./App.css";
import "./styles.scss";

// Importy stron i sekcji
import LoginPage from "./pages/LoginPage/LoginPage";
import EditorPage from "./pages/EditorPage/EditorPage";
import S1 from "./sections/S1";
import S2 from "./sections/S2";
import S3 from "./sections/S3";
import S4 from "./sections/S4";
import S5 from "./sections/S5";
import S6 from "./sections/S6";

/**
 * Komponent "Strażnik" (ProtectedRoute) - bez zmian
 */
function ProtectedRoute({ children }) {
  const { currentUser, isAdmin } = useAuth();
  return currentUser && isAdmin ? children : <Navigate to="/login" />;
}

/**
 * Komponent strony głównej - bez zmian
 */
function Home({ scrollRef, s3Ref }) {
  return (
    <main className="page" ref={scrollRef}>
      <S1 />
      <S2 />
      <S3 ref={s3Ref} />
      <S4 />
      <S5 />
      <S6 />
    </main>
  );
}

/**
 * Nowy komponent-wrapper, który pozwala nam używać hooka useScrollDirection
 * razem z komponentami routera.
 */
function AppContent() {
  const scrollContainerRef = useRef(null);
  const s3Ref = useRef(null);
  const scrollDirection = useScrollDirection(scrollContainerRef);
  console.log("Kierunek przewijania:", scrollDirection);

  const isS3OnScreen = useElementOnScreen(s3Ref);
  
  const isHeaderVisible = !isS3OnScreen && scrollDirection !== 'down';

  return (
    <>
      <Header isVisible={isHeaderVisible} />
      <Routes>
      <Route path="/" element={<Home scrollRef={scrollContainerRef} s3Ref={s3Ref} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

/**
 * Główny komponent aplikacji - teraz znacznie prostszy
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}