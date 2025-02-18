import PropTypes from "prop-types";
import "../styles/CompraPopup.css";

const CompraPopup = ({ mensaje, tipo, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>{tipo === "exito" ? "¡Éxito!" : "¡Lo Sentimos! =("}</h2>
        <p
          dangerouslySetInnerHTML={{
            __html: mensaje.replace(
              /<strong>(.*?)<\/strong>/g,
              '<strong style="color: var(--success-color); font-weight: 600;">$1</strong>'
            ),
          }}
        />
        <button
          className="button"
          style={{
            background:
              tipo === "exito" ? "var(--success-color)" : "var(--error-color)",
          }}
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

CompraPopup.propTypes = {
  mensaje: PropTypes.string.isRequired,
  tipo: PropTypes.oneOf(["exito", "error"]).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CompraPopup;
