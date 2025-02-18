import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "../styles/SideBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faLaptop,
  faMicrochip,
  faTelevision,
  faKeyboard,
  faHeadphones,
  faCode,
  faPuzzlePiece,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { categorias } from "../assets/categorias";

function Sidebar({ collapsed, setCollapsed }) {
  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <nav className="sidebar-links">
        <Link
          to="/home"
          onClick={(e) => {
            // onCategorySelect("tienda");
          }}
          className="sidebar-item"
        >
          <span className="icon">
            <FontAwesomeIcon icon={faHome} />
          </span>
          <span className={collapsed ? "hidden" : ""}>Tienda</span>
        </Link>
        {categorias.map((categoria) => (
          <Link
            key={categoria.id}
            to={`/categoria/${categoria.nombre
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
            // onClick={() => onCategorySelect(categoria.id)}
            className="sidebar-item"
          >
            <span className="icon">
              <FontAwesomeIcon icon={getCategoryIcon(categoria.nombre)} />
            </span>
            <span className={collapsed ? "hidden" : ""}>
              {categoria.nombre}
            </span>
          </Link>
        ))}
      </nav>
      <button
        className="toggle-button"
        onClick={() => setCollapsed(!collapsed)}
      >
        <FontAwesomeIcon icon={faBars} />
      </button>
    </div>
  );
}

Sidebar.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  setCollapsed: PropTypes.func.isRequired,
  // onCategorySelect: PropTypes.func.isRequired,
};

export default Sidebar;

const getCategoryIcon = (categoryName) => {
  switch (categoryName) {
    case "PCs":
      return faLaptop;
    case "Componentes":
      return faMicrochip;
    case "Monitores":
      return faTelevision;
    case "Perifericos":
      return faKeyboard;
    case "Audio":
      return faHeadphones;
    case "Software":
      return faCode;
    case "Accesorios":
      return faPuzzlePiece;
    default:
      return faHome;
  }
};
