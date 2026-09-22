import axios from "axios";
import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:3001/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      alert("Bienvenido 🔥");
      window.location.href = "/dashboard";
    } catch (err) {
      alert("Datos incorrectos ❌");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="logo">🏆 TorneosApp</h1>
        <p className="subtitle">Organizá y competí como un pro</p>

        <input
          className="input"
          type="text"
          placeholder="Usuario"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Contraseña"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn" onClick={handleLogin}>
          Ingresar
        </button>

        <p className="footer">Sistema de torneos • 2026</p>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', sans-serif;
        }

        .container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #0f172a, #1e3a8a, #0ea5e9);
        }

        /* fondo decorativo tipo cancha */
        .container::before {
          content: "";
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(14,165,233,0.4), transparent);
          filter: blur(100px);
        }

        .card {
          width: 340px;
          padding: 35px;
          border-radius: 16px;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
          text-align: center;
          z-index: 2;
        }

        .logo {
          color: #38bdf8;
          font-size: 26px;
          margin-bottom: 5px;
        }

        .subtitle {
          color: #cbd5f5;
          font-size: 13px;
          margin-bottom: 20px;
        }

        .input {
          width: 100%;
          padding: 12px;
          margin: 8px 0;
          border-radius: 8px;
          border: none;
          outline: none;
          background: rgba(255,255,255,0.1);
          color: white;
          transition: 0.3s;
        }

        .input:focus {
          background: rgba(255,255,255,0.2);
          box-shadow: 0 0 8px #38bdf8;
        }

        .btn {
          width: 100%;
          padding: 12px;
          margin-top: 15px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(90deg, #0ea5e9, #38bdf8);
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: 0.3s;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(56,189,248,0.5);
        }

        .footer {
          margin-top: 15px;
          font-size: 11px;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}