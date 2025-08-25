// src/components/Header/Header.jsx

import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./header.scss";

// Importujemy ikony z biblioteki react-icons
import { FiMenu, FiX, FiInstagram, FiFacebook, FiTwitter } from "react-icons/fi";

export default function Header({ isVisible }) {
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Stan do zarządzania menu

  // Funkcja, która zamyka menu (przydatne przy kliknięciu linku)
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* Główny nagłówek */}
      <header className={`main-header ${isVisible ? "is-visible" : "is-hidden"}`}>
        <div className="header-content">
          {/* Hamburger, który zastępuje logo */}
          <button className="hamburger-btn" onClick={() => setIsMenuOpen(true)} aria-label="Otwórz menu">
            <FiMenu />
          </button>
          
          {/* Ikony Social Media (dawne .main-nav) */}
          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FiInstagram /></a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FiFacebook /></a>
            
          </div>

          {/* Przycisk Admina zostaje na desktopie dla wygody */}
          <div className="admin-actions-desktop">
            {currentUser ? (
              <button onClick={logout} className="admin-btn">Wyloguj</button>
            ) : (
              <Link to="/login" className="admin-btn">Admin</Link>
            )}
          </div>
        </div>
      </header>

      {/* Panel Menu Off-canvas */}
      <div className={`offcanvas-menu ${isMenuOpen ? "is-open" : ""}`}>
        <div className="offcanvas-header">
          <Link to="/" className="logo-menu" onClick={closeMenu}>
            OVERO
          </Link>
          <button className="close-btn" onClick={closeMenu} aria-label="Zamknij menu">
            <FiX />
          </button>
        </div>
        <nav className="offcanvas-nav">
          <NavLink to="/#s3">Lookbooks</NavLink> {/* Załóżmy, że S3 to sekcja lookbooków */}
          <NavLink to="/#kontakt">Contact</NavLink>
          <div className="admin-actions-mobile">
            {currentUser ? (
              <button onClick={() => { logout(); closeMenu(); }} className="admin-btn">Wyloguj</button>
            ) : (
              <Link to="/login" onClick={closeMenu} className="admin-btn">Admin</Link>
            )}
          </div>
        </nav>
      </div>
      {/* Tło, które przyciemnia stronę, gdy menu jest otwarte */}
      {isMenuOpen && <div className="backdrop" onClick={closeMenu}></div>}
    </>
  );
}