import { useCart } from "../context/CartContext";
import PropTypes from "prop-types";
import axios from "../config/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartPlus,
  faCartShopping,
  faMinusCircle,
  faPlusCircle,
  faHeart as fasHeart,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons";
import "../styles/ProductCard.css";
import { useLikes } from "../context/LikedProductsContext";
import { useAuth } from "../context/useAuth";
import { useLocation } from "react-router-dom";

function ProductCard({ producto, carrito, onClick }) {
  const { toggleCarrito, actualizarCantidad } = useCart();
  const { likedProducts, addLike, removeLike, loading } = useLikes();
  const { isAuthenticated, userRole } = useAuth();
  const [likes, setLikes] = useState(producto.likes);
  const location = useLocation();

  const isMisComprasPage = location.pathname === "/mis-compras";

  if (loading) return <p>Cargando productos liked...</p>;

  useEffect(() => {
    setLikes(producto.likes);
  }, [producto.likes]);

  const handleLike = (producto) => {
    if (!isAuthenticated || userRole !== "cliente") {
      alert("Debe estar logueado para dar Like o esta logueado como Admin");
      return;
    }

    try {
      let updatedLikes = likes;

      if (likedProducts.has(producto.id)) {
        removeLike(producto.id);
        updatedLikes -= 1; 
      } else {
        addLike(producto.id);
        updatedLikes += 1; 
      }

      setLikes(updatedLikes); 
    } catch (error) {
      console.error("Error al actualizar los likes:", error);
    }
  };

  return (
    <div className="producto-card" onClick={onClick}>
      <img src={producto.image} alt={producto.name} />
      <h3>{producto.name}</h3>

      <div className="card-bottom">
        <p className="precio">${producto.price.toLocaleString()}</p>

        {!isMisComprasPage ? (
          <>
            {isAuthenticated && userRole === "cliente" && (
              <div className="producto-actions">
                <div className="carrito-contenedor">
                  <button
                    className={`carrito-btn ${
                      carrito[producto.id] ? "en-carrito" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCarrito(producto);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={carrito[producto.id] ? faCartShopping : faCartPlus}
                    />
                    {!carrito[producto.id] && " Agregar al carrito"}
                  </button>
                  {carrito[producto.id] && (
                    <div className="carrito-controles">
                      <button
                        className="cantidad-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          actualizarCantidad(
                            producto.id,
                            carrito[producto.id]?.cantidad - 1 || 1
                          );
                        }}
                        disabled={carrito[producto.id]?.cantidad <= 1}
                      >
                        <FontAwesomeIcon icon={faMinusCircle} />
                      </button>
                      <span className="cantidad">
                        {carrito[producto.id]?.cantidad || 0}
                      </span>
                      <button
                        className="cantidad-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          actualizarCantidad(
                            producto.id,
                            (carrito[producto.id]?.cantidad || 0) + 1
                          );
                        }}
                      >
                        <FontAwesomeIcon icon={faPlusCircle} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="like-container">
                  <button
                    className="like-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(producto);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={
                        likedProducts.has(producto.id) ? fasHeart : farHeart
                      }
                      className="icon"
                    />
                  </button>
                  <span className="likes-count">
                  {likes}
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="producto-actions">
            <button
              className="comentar-btn"
              onClick={(e) => {
                e.stopPropagation();
                onClick(producto);
              }}
            >
              ¡Comentanos!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

ProductCard.propTypes = {
  producto: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
  carrito: PropTypes.object.isRequired,
  onClick: PropTypes.func,
};

export default ProductCard;
