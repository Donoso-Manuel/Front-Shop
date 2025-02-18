import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../config/axios";
import "../styles/Auth.css"; // Importa los estilos

const ResetPasswordForm = () => {
  const { token } = useParams(); // Extraer el token de la URL
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/api/reset-password/${token}`,
        { newPassword }
      );
      setSuccess(response.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setError("Hubo un error al actualizar la contraseña.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Restablecer Contraseña</h2>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="password"
              placeholder="Nueva Contraseña"
              value={newPassword}
              onChange={handlePasswordChange}
              required
              className="input"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
              className="input"
            />
          </div>

          <button type="submit" className="submit-button">
            Actualizar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
