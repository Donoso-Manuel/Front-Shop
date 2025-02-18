import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/Auth.css";
import axios from "../config/axios";

const CreatePassword = () => {
  const { id: urlUserId } = useParams(); // ID en la URL
  const [userId, setUserId] = useState(null); // ID del usuario autenticado
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [userExists, setUserExists] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await axios.get("/api/auth/verify", {
          withCredentials: true,
        });

        if (
          !response.data.authenticated ||
          response.data.user.rol !== "admin"
        ) {
          navigate("/login"); // Si no es admin, redirigir a login
          return;
        }

        const authenticatedUserId = response.data.user.id;
        setUserId(authenticatedUserId);

        // 🔹 Si el ID en la URL no coincide con el usuario autenticado, redirigir automáticamente
        if (urlUserId !== authenticatedUserId.toString()) {
          navigate(`/create-password/${authenticatedUserId}`, {
            replace: true,
          });
          return;
        }

        setUserExists(true);
      } catch (error) {
        console.error("❌ Error al verificar usuario:", error);
        setError("Error de autenticación. Vuelve a iniciar sesión.");
        navigate("/login"); // Redirigir en caso de error
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [urlUserId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.password.length < 6) {
      setError("❌ La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (passwords.password !== passwords.confirmPassword) {
      setError("❌ Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await axios.post("/api/create-admin-password", {
        userId, // Usar el ID autenticado, no el de la URL
        password: passwords.password,
      });

      if (response.status === 200) {
        alert("✅ Contraseña establecida correctamente.");
        navigate("/perfil"); // Redirigir al perfil del usuario
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setError(
        error.response?.data?.message || "Error al establecer la contraseña."
      );
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Crear Contraseña de Administrador</h2>

        {error && <p className="error-message">{error}</p>}

        {userExists ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Ingrese nueva contraseña"
                value={passwords.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Reingrese nueva contraseña"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button type="submit" className="submit-button">
              Establecer Contraseña
            </button>
          </form>
        ) : (
          <p className="error-message">No se puede cargar el formulario.</p>
        )}
      </div>
    </div>
  );
};

export default CreatePassword;
