import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import "../styles/MisCompras.css";
import axios from "../config/axios";

function MisCompras() {
  const [historialCompras, setHistorialCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const comprasPorPagina = 10;

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await axios.get("/api/historial-compras", {
          withCredentials: true,
        });

        if (response.data && Array.isArray(response.data)) {
          setHistorialCompras(
            response.data.sort(
              (a, b) => new Date(b.purchase_date) - new Date(a.purchase_date)
            )
          );
        } else {
          setHistorialCompras([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener el historial:", error);
        setError(
          error.response?.data?.message || "Error al cargar el historial"
        );
        setLoading(false);
      }
    };

    fetchHistorial();
  }, []);

  if (loading) return <div>Cargando historial de compras...</div>;
  if (error) return <div>Error: {error}</div>;

  const indexOfLastCompra = currentPage * comprasPorPagina;
  const indexOfFirstCompra = indexOfLastCompra - comprasPorPagina;
  const comprasActuales = historialCompras.slice(
    indexOfFirstCompra,
    indexOfLastCompra
  );

  const totalPages = Math.ceil(historialCompras.length / comprasPorPagina);

  return (
    <Layout>
      <div className="mis-compras-container">
        <h1 className="mis-compras-title">Mis Compras</h1>

        {historialCompras.length === 0 ? (
          <p className="empty-message">No tienes compras registradas.</p>
        ) : (
          <>
            <div className="compras-grid">
              {comprasActuales.map((compra, index) => (
                <div key={index} className="compra-card">
                  <h3>Compra realizada el {" "}         
                    {new Date(compra.purchase_date).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    })}</h3>
                  <p>Total: ${compra.purchase_total.toLocaleString()}</p>
                  <div className="producto-info">
                    <p>Producto: {compra.name}</p>
                    <p>Precio: ${compra.price.toLocaleString()}</p>
                    <p>Cantidad: {compra.amount}</p>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  {"<"}
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      className={`pagination-btn ${
                        page === currentPage ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  {">"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default MisCompras;
