import { useState, useEffect } from "react";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";
import "../styles/product-management.css";
import Layout from "../components/Layout";

const ProductManagement = () => {
  const [productList, setProductList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState(null);
  const [newStock, setNewStock] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios
      .get("/api/products")
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          const sortedProducts = response.data.sort((a, b) => a.id - b.id);
          setProductList(sortedProducts);
          setError(null);
        } else {
          setError("Sin productos disponibles");
        }
      })
      .catch((err) => {
        setError("Servidor fuera de línea");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleEdit = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  const handleStock = (productId) => {
    const product = productList.find((p) => p.id === productId);
    setNewStock(product.stock.toString());
    setEditingStock(productId);
  };

  const handleStockSubmit = async (productId) => {
    try {
      const stockValue = parseInt(newStock);
      if (isNaN(stockValue) || stockValue < 0) {
        setError("El stock debe ser un número válido mayor o igual a 0");
        return;
      }

      const response = await axios.patch(`/api/products/${productId}`, {
        stock: stockValue,
      });

      if (response.data) {
        setEditingStock(null);
        fetchProducts();
        setError(null);
      } else {
        setError(
          "Error al actualizar el stock: Respuesta inválida del servidor"
        );
      }
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      setError(error.response?.data?.message || "Error al actualizar el stock");
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await axios.delete(`/api/products/${productId}`);
        fetchProducts();
      } catch (error) {
        setError("Error al eliminar el producto");
        console.error("Error:", error);
      }
    }
  };

  return (
    <Layout>
      <div className="product-management">
        <div className="header-section">
          <h2>Gestión de Productos</h2>
          <button
            className="add-product-btn"
            onClick={() => navigate("/create-product")}
          >
            Agregar Producto
          </button>
        </div>

        <div className="products-section">
          {loading && <p>Cargando productos...</p>}
          {error && <p>{error}</p>}
          {!loading && !error && (
            <div className="products-grid">
              {productList.length > 0 ? (
                productList.map((product) => (
                  <div key={product.id} className="producto-item">
                    <div className="producto-image-container">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="producto-image"
                      />
                    </div>
                    <div className="producto-info">
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <p className="stock-info">
                        Stock actual: {product.stock}
                      </p>
                    </div>
                    <div className="product-actions">
                      {editingStock === product.id ? (
                        <div className="stock-edit-container">
                          <input
                            type="number"
                            value={newStock}
                            onChange={(e) => setNewStock(e.target.value)}
                            min="0"
                            className="stock-input"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleStockSubmit(product.id);
                              }
                            }}
                          />
                          <button
                            className="action-btn stock-btn stock-save-btn"
                            onClick={() => handleStockSubmit(product.id)}
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <button
                          className="action-btn stock-btn"
                          onClick={() => handleStock(product.id)}
                        >
                          Stock
                        </button>
                      )}
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(product.id)}
                      >
                        Editar
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(product.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>Sin productos disponibles</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductManagement;
