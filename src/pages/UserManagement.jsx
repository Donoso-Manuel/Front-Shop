import { useState, useEffect } from "react";
import axios from "../config/axios";
import "../styles/UserManagement.css";
import Layout from "../components/Layout";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("/api/users")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          setUsers([]);
        }
      })
      .catch((error) => {
        setError("Error al obtener usuarios", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleActiveStatus = async (id, currentStatus) => {
    try {
      const updatedUser = { status: !currentStatus };
      console.log(updatedUser)
      await axios.patch(`/api/userState/${id}`, updatedUser);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, status: !user.status } : user
        )
      );
    } catch (error) {
      console.error("Error al actualizar el estado del usuario:", error);
    }
  };

  const showLikedProducts = async (user) => {
    const response =  await axios.get(`/api/users/${user.id}/liked-products`)
    setSelectedUser({...user, likedProducts: response.data});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  return (
    <Layout>
      <div className="user-management">
        <h2>Gestión de Usuarios</h2>

        {loading ? <p>Cargando usuarios...</p> : null}
        {error ? <p className="error">{error}</p> : null}

        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Inversión</th>
              <th>Última Compra</th>
              <th>Estado</th>
              <th colSpan="2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users && Array.isArray(users) ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>${user.investment?.toLocaleString() || "0"}</td>
                  <td>{user.lastPurchase || "No disponible"}</td>
                  <td className={user.status ? "active" : "inactive"}>
                    {user.status ? "Activo" : "Inactivo"}
                  </td>
                  <td>
                    <button
                      className="toggle-btn"
                      onClick={() => toggleActiveStatus(user.id, user.status)}
                    >
                      {user.status ? "Deshabilitar" : "Habilitar"}
                    </button>
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => showLikedProducts(user)}
                    >
                      Ver Favoritos
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No hay usuarios disponibles</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Productos Favoritos de {selectedUser.name}</h3>
            <ul className="modal-list">
             {Array.isArray(selectedUser.likedProducts) &&
                selectedUser.likedProducts.length > 0 ? (
                selectedUser.likedProducts.map((product, index) => (
         <li key={index} className="modal-list-item">
        <strong>{product.name}</strong> - ${product.price}
      </li>
    ))
  ) : (
    <li className="modal-list-item">No hay productos favoritos.</li>
  )}
</ul>
            <button className="close-btn" onClick={closeModal}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UserManagement;
