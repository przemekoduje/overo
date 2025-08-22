// src/pages/LoginPage/LoginPage.jsx

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./loginPage.scss";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // Pobieramy obie metody logowania z naszego kontekstu
  const { login, signInWithGoogle } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch {
      setError("Nie udało się zalogować. Sprawdź dane.");
    }
  };

  // NOWA funkcja do obsługi logowania przez Google
  const handleGoogleSignIn = async () => {
    setError("");
    try {
      await signInWithGoogle();
      navigate("/"); // Po sukcesie, przekieruj na stronę główną
    } catch {
      setError("Nie udało się zalogować przez Google.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-form-container">
        <h2>Panel Administratora</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          {/* ... inputy email i hasło bez zmian ... */}
        </form>
        
        {/* Separator */}
        <div className="separator">lub</div>

        {/* NOWY przycisk logowania przez Google */}
        <button onClick={handleGoogleSignIn} className="google-btn">
          Zaloguj się z Google
        </button>
      </div>
    </div>
  );
}