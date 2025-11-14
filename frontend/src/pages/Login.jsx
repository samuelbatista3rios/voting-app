// src/pages/Login.jsx
import React, { useState } from "react";
import api, { setToken } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      setToken(res.data.token);
      localStorage.setItem("voting_user", JSON.stringify(res.data.user));
      if (res.data.user?.role === "admin") nav("/admin");
      else nav("/vote");
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || "Erro no login",
      });
    }
  };

  return (
    <div style={{ display: "grid", placeItems: "center" }}>
      <div style={{ width: 380 }}>
        <div className="card">
          <h2>Login</h2>
          <p className="small">Acesse sua conta de jurado ou admin</p>

          <form onSubmit={submit} style={{ marginTop: 12 }}>
            <div className="form-row">
              <label>Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            <div className="form-row">
              <label>Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 12,
              }}
            >
              <button type="submit" className="btn btn-primary">
                Entrar
              </button>
            </div>

            {msg && (
              <div
                className={`msg ${msg.type === "error" ? "error" : "info"}`}
                style={{ marginTop: 12 }}
              >
                {msg.text}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
