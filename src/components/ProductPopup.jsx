import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faTimes,
  faPlus,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";

function ProductPopup({ producto, onClose, carrito, onToggleCarrito }) {
  const cantidad = carrito[producto.id]?.cantidad || 0;
  console.log(
    "ProductPopup - cantidad para producto",
    producto.id,
    "=",
    cantidad
  );

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="popup-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="popup-grid">
          <div className="popup-image">
            <img src={producto.image} alt={producto.name} />
          </div>

          <div className="popup-details">
            <h2>{producto.name}</h2>
            <p className="popup-description">{producto.description}</p>
            <p className="precio">${producto.price}</p>

            <div className="producto-actions">
              {cantidad > 0 ? (
                <div className="carrito-controles">
                  <button
                    className="cantidad-btn"
                    onClick={() => {
                      onToggleCarrito(producto, cantidad - 1);
                      console.log(
                        "Disminuyendo, nueva cantidad:",
                        cantidad - 1
                      );
                    }}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <span className="cantidad">{cantidad}</span>
                  <button
                    className="cantidad-btn"
                    onClick={() => {
                      onToggleCarrito(producto, cantidad + 1);
                      console.log("Aumentando, nueva cantidad:", cantidad + 1);
                    }}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              ) : (
                <button
                  className="carrito-btn"
                  onClick={() => {
                    onToggleCarrito(producto, 1);
                    console.log("Agregando producto", producto.id);
                  }}
                >
                  Agregar al Carrito
                </button>
              )}

              <div className="like-container">
                <button className="like-btn">
                  <FontAwesomeIcon icon={faHeart} className="icon" />
                </button>
                <span>{producto.likes || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ProductPopup.propTypes = {
  producto: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    likes: PropTypes.number,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  carrito: PropTypes.object.isRequired,
  onToggleCarrito: PropTypes.func.isRequired,
};

export default ProductPopup;
