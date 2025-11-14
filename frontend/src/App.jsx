// src/App.jsx
import React from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Vote from "./pages/Vote";
import Results from "./pages/Results";
import { setToken } from "./services/api";
import Footer from "./pages/Footer";
import logo from "./assets/image.jpg"; // ajuste caminho se necessário

function Navbar() {
  const token = localStorage.getItem("voting_token");
  const user = JSON.parse(localStorage.getItem("voting_user"));
  const nav = useNavigate();

  const logout = () => {
    setToken(null);
    localStorage.removeItem("voting_user");
    localStorage.removeItem("voting_token");
    nav("/");
  };

  return (
    <header className="navbar">
      <div className="nav-left">
        <div className="logo">
          <img src={logo} alt="Logo" />
        </div>
        <div>
          <div style={{ fontWeight: 800 }}>Voting App</div>
          <div className="small">Painel de votação</div>
        </div>
      </div>

      <div className="nav-links">
        <Link to="/vote">Votação</Link>
        <Link to="/results">Resultados</Link>

        {/* Exibe link Admin apenas se o usuário for admin */}
        {user?.role === "admin" && <Link to="/admin">Admin</Link>}

        {!token && <Link to="/login">Login</Link>}
      </div>

      <div className="nav-actions">
        {token && (
          <button className="btn btn-ghost" onClick={logout}>
            Sair
          </button>
        )}
      </div>
    </header>
  );
}

// 🔒 Bloqueio geral para páginas que precisam de login
function RequireAuth({ children }) {
  const token = localStorage.getItem("voting_token");
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// 🔒 Bloqueio exclusivo para o painel admin
function AdminOnly({ children }) {
  const user = JSON.parse(localStorage.getItem("voting_user"));
  const token = localStorage.getItem("voting_token");
  if (!token) return <Navigate to="/login" replace />;
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const sticky = true; // controla se o footer é "sticky" em mobile

  return (
    <div
      className="app-frame"
      style={{
        overflowX: "hidden",
        paddingBottom: window.innerWidth <= 760 && sticky ? "110px" : 0, // reserva espaço no mobile
      }}
    >
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/results" element={<Results />} />

        <Route
          path="/vote"
          element={
            <RequireAuth>
              <Vote />
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminOnly>
              <AdminDashboard />
            </AdminOnly>
          }
        />
      </Routes>

      <Footer stickyOnMobile={sticky} />
    </div>
  );
}

function Home() {
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: 320 }}>
      <div className="card center" style={{ maxWidth: 760 }}>
        <h2 style={{ color: "#eaffff" }}>Bem-vindo ao Voting App</h2>
        <p className="small" style={{ marginTop: 8 }}>
          Use a aba Votação para avaliar candidatos ou faça login como admin
          para gerenciar critérios e candidatos.
        </p>
      </div>
    </div>
  );
}
