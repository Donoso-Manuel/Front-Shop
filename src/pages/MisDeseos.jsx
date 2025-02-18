import { useState, useEffect } from "react";
import { useLikes } from "../context/LikedProductsContext";
import { useCart } from "../context/CartContext";
import Layout from "../components/Layout";
import ProductCard from "../components/ProductCard";
import "../styles/MisDeseos.css";
import axios from "../config/axios";

function MisDeseos() {
  const { addLike, removeLike } = useLikes();
  const { carrito, toggleCarrito, actualizarCantidad } = useCart();
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoritos = async () => {
      try {
        const response = await axios.get("/api/users/productsLiked");
        setFavoritos(response.data);
      } catch (error) {
        console.error("Error al obtener los productos favoritos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoritos();
  }, []);

  const handleRemoveFromWishlist = (productoId) => {
    removeLike(productoId);
  };

  if (loading) {
    return <div>Cargando productos favoritos...</div>;
  }

  return (
    <Layout>
      <div className="misdeseos-container">
        <h1 className="misdeseos-title">Mis Productos Favoritos</h1>

        <div className="misdeseos-grid">
          {favoritos.length > 0 ? (
            favoritos.map((producto) => (
              <ProductCard
                key={producto.id}
                producto={producto}
                onRemoveFromWishlist={handleRemoveFromWishlist}
                carrito={carrito}
                likedProducts={favoritos}
                onToggleCarrito={toggleCarrito}
                onUpdateCantidad={actualizarCantidad}
                handleRemoveFavorito={handleRemoveFromWishlist}
              />
            ))
          ) : (
            <div className="empty-message">
              No tienes productos favoritos aún
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default MisDeseos;
