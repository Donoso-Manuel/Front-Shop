import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import logo from "../assets/logo.png";
import axios from "../config/axios";

function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    direccion: "",
    ciudad: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    rol: "cliente", // Rol por defecto
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.confirmPassword) {
      setError("❌ Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await axios.post("/api/users", formData, {
        withCredentials: true, //Asegura que las cookies del token se almacenen
      });

      const userData = response.data.data;
      const token = response.data.token; //Recibimos el token generado

      if (!userData) {
        setError("❌ Error al registrar el usuario.");
        return;
      }

      if (userData.rol === "admin") {
        if (!token) {
          setError("❌ No se recibió un token de autenticación.");
          return;
        }

        // Redirigir a crear contraseña
        navigate(`/create-password/${userData.id}`);
      } else {
        setSuccess("✅ Usuario creado exitosamente.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.error || "Error al crear el usuario");
    }
  };

  return (
    <div className="auth-container">
      <div className="logoclass">
        <img src={logo} alt="Logoclass" className="imglog" />
      </div>

      <div className="auth-form-container">
        <h2>Crear Cuenta</h2>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Nombre completo"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={formData.correo}
              onChange={(e) =>
                setFormData({ ...formData, correo: e.target.value })
              }
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Dirección"
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
              className="input"
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Ciudad"
              value={formData.ciudad}
              onChange={(e) =>
                setFormData({ ...formData, ciudad: e.target.value })
              }
              className="input"
            />
          </div>

          <div className="form-group">
            <input
              type="tel"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              className="input"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="input"
              required
            />
          </div>

          <button type="submit" className="button submit-button">
            Registrarse
          </button>
        </form>

        <div className="auth-links">
          <p>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="link">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
