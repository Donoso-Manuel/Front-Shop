import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import axios from "../config/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencilAlt,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Perfil.css";

function Perfil({ isAuthenticated }) {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    direction: "",
    city: "",
    phone: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/users/profile");
        setUserData(response.data);
        setTempData(response.data);
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setTempData({ ...userData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempData(userData);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put("/api/users/updateProfile", tempData);
      setUserData(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar datos:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Layout>
      <div className="perfil-container">
        <h1 className="perfil-title">Mi Perfil</h1>

        <div className="perfil-form">
          <div className="form-group">
            <input
              type="text"
              id="name"
              name="name"
              value={isEditing ? tempData.name : userData.name}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder=" "
            />
            <label htmlFor="nombre">Nombre</label>
          </div>

          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              value={isEditing ? tempData.email : userData.email}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder=" "
            />
            <label htmlFor="correo">Correo Electrónico</label>
          </div>

          <div className="form-group">
            <input
              type="text"
              id="direction"
              name="direction"
              value={isEditing ? tempData.direction : userData.direction}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder=" "
            />
            <label htmlFor="direccion">Dirección</label>
          </div>

          <div className="form-group">
            <input
              type="text"
              id="city"
              name="city"
              value={isEditing ? tempData.city : userData.city}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder=" "
            />
            <label htmlFor="ciudad">Ciudad</label>
          </div>

          <div className="form-group">
            <input
              type="tel"
              id="phone"
              name="phone"
              value={isEditing ? tempData.phone : userData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder=" "
            />
            <label htmlFor="telefono">Teléfono</label>
          </div>

          <div className="perfil-actions">
            {!isEditing ? (
              <button className="edit-btn" onClick={handleEdit}>
                <FontAwesomeIcon icon={faPencilAlt} /> Actualizar Datos
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSave}>
                  <FontAwesomeIcon icon={faSave} /> Guardar
                </button>
                <button className="cancel-btn" onClick={handleCancel}>
                  <FontAwesomeIcon icon={faTimes} /> Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Perfil;
