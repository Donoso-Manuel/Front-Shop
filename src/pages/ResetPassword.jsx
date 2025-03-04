import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../config/axios";
import "../styles/Auth.css";
import logo from "../assets/logo.png";
import {useNavigate} from "react-router-dom"

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const useNavigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Realizar la solicitud POST al backend

      const response = await axios.post(
        "http://localhost:3000/api/reset-password",
        { email }
      );

      // Si la respuesta es exitosa, se puede manejar el éxito
      setSuccess(true);
      setError(null); // Limpiar errores anteriores si es exitoso
      console.log("Instrucciones enviadas:", response.data); // Aquí puedes manejar la respuesta del backend
    } catch (err) {
      // En caso de error, manejarlo aquí
      setError("Hubo un error al enviar las instrucciones. Intenta de nuevo.");
      setSuccess(false);
      console.error("Error al enviar la solicitud:", err);
    }
  };

  return (
    <div className="auth-container">
      <div className="logoclass">
        <img src={logo} alt="logoclass" className="imglog" onClick={()=> navigate("/home")}/>
      </div>

      <div className="auth-form-container">
        <h2>Recuperar Contraseña</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>

          <button type="submit" className="button submit-button">
            Enviar instrucciones
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}{" "}
        {/* Mostrar mensaje de error */}
        {success && (
          <div className="success-message">
            Revisa tu correo para las instrucciones
          </div>
        )}{" "}
        {/* Mensaje de éxito */}
        <div className="auth-links">
          <Link to="/login" className="link">
            Volver a inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
