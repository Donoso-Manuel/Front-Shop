import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "../config/axios";
import "../styles/NavBar.css";
import logo from "../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignInAlt,
  faUserPlus,
  faUser,
  faShoppingBag,
  faShoppingCart,
  faSignOutAlt,
  faSearch,
  faHeart,
  faUsers,
  faBoxes,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/CartContext";

function NavBar() {
  const navigate = useNavigate();
  const { userRole, isAuthenticated, setUserRole, setIsAuthenticated } =
    useAuth();
  const { carrito, setCarrito } = useCart();
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem("searchQuery") || "";
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", updatePath);
    return () => window.removeEventListener("popstate", updatePath);
  }, []);

  useEffect(() => {
    localStorage.setItem("searchQuery", searchQuery);

    if (currentPath === "/home" || currentPath === "/") {
      const searchEvent = new CustomEvent("onSearch", {
        detail: { query: searchQuery },
      });
      window.dispatchEvent(searchEvent);
    }
  }, [searchQuery, location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("/api/auth/verify", {
          withCredentials: true,
        });
        if (response.data.authenticated) {
          setIsAuthenticated(true);
          setUserRole(response.data.user.rol);
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error("❌ Error al verificar autenticación:", error);
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };

    checkAuthStatus();
  }, [setIsAuthenticated, setUserRole]);

  const handleSearch = () => {
    localStorage.setItem("searchQuery", searchQuery);
    if (currentPath !== "/home" && currentPath !== "/") {
      navigate("/home");
      const searchEvent = new CustomEvent("onSearch", {
        detail: { query: searchQuery },
      });
      window.dispatchEvent(searchEvent);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Escape") {
      clearSearch();
    } else if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    localStorage.removeItem("searchQuery");
    const clearEvent = new CustomEvent("onSearch", {
      detail: { query: "" },
    });
    window.dispatchEvent(clearEvent);
  };

  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    if (newValue === "") {
      clearSearch();
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Iniciando proceso de logout");
  
      if (isAuthenticated) {
        // Verificar si el carrito tiene productos antes de guardar
        if (Object.keys(carrito).length > 0) {
          try {
            console.log("Guardando carrito...");
  
            const productosParaGuardar = {
              productos: Object.values(carrito).map((producto) => {
                const id = Math.floor(Math.abs(Number(producto.id)));
                const cantidad = Math.floor(Math.abs(Number(producto.cantidad)));
                const precio = Math.floor(Number(producto.precio) * 1);
                
                if (isNaN(id) || isNaN(cantidad) || isNaN(precio) || id <= 0 || cantidad <= 0 || precio <= 0) {
                  throw new Error("Valores inválidos en el carrito");
                }
                
                return { id_product: id, amount: cantidad, price: precio, id_cart: producto.id_cart || null };
              }),
            };
  
            // Guardar carrito si tiene productos
            if (productosParaGuardar.productos.length > 0) {
              const saveResponse = await axios.post("/api/carrito-saved", productosParaGuardar, { 
                withCredentials: true, 
                headers: { "Content-Type": "application/json" },
              });
              console.log("Respuesta del guardado:", saveResponse.data);
            }
          } catch (cartError) {
            console.error("Error al guardar el carrito:", cartError);
            alert("No se pudo guardar el carrito. Los productos se perderán al cerrar sesión.");
          }
        }
  
        console.log("Cerrando sesión...");


        const response = await axios.post("/api/logout");
        console.log(response)
        document.cookie = "userToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; Secure";
        localStorage.clear();
        setIsAuthenticated(false);
        setUserRole(null);
        console.log("Respuesta del logout:", response.data);
        navigate("/home");
      } else {
        console.log("No hay sesión activa.");
      }
    } catch (error) {
      console.error("Error en el proceso de logout:", error);
      alert("Error al cerrar sesión. Intenta nuevamente.");
    }
  };
  

  const isCategoryPage = currentPath.includes("/categoria/");

  return (
    <div
      className={`nav-header ${isScrolled ? "scrolled" : ""} ${
        isMenuOpen ? "menu-open" : ""
      }`}
    >
      <div className="nav-left">
        <img src={logo} alt="Logo" className="logo" onClick={()=> navigate("/home")}/>
{(location.pathname === "/home" || location.pathname === "/") && ( 
        <div className="search-bar">

  <input
    type="text"
    placeholder="Buscar productos..."
    value={searchQuery}
    onChange={handleSearchChange}
    onKeyDown={handleSearchKeyDown}
    className="search-input"
  />
    </div>
  )}

      </div>

      <button
        className="menu-toggle"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
      </button>

      <div className={`nav-links ${isMenuOpen ? "show" : ""}`}>
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="nav-button login-button">
              <FontAwesomeIcon icon={faSignInAlt} />
              <span>Iniciar Sesión</span>
            </Link>
            <Link to="/register" className="nav-button register-button">
              <FontAwesomeIcon icon={faUserPlus} />
              <span>Registrarse</span>
            </Link>
          </>
        ) : userRole === "admin" ? (
          <>
            <Link to="/perfil" className="nav-button">
              <FontAwesomeIcon icon={faUser} />
              <span>Mi Perfil</span>
            </Link>
            <Link to="/control-usuarios" className="nav-button">
              <FontAwesomeIcon icon={faUsers} />
              <span>Gestión de Usuarios</span>
            </Link>
            <Link to="/gestion-productos" className="nav-button">
              <FontAwesomeIcon icon={faBoxes} />
              <span>Gestión de Productos</span>
            </Link>
            <button onClick={handleLogout} className="nav-button logout-button">
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Cerrar Sesión</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/perfil" className="nav-button">
              <FontAwesomeIcon icon={faUser} />
              <span>Mi Perfil</span>
            </Link>
            <Link to="/mis-deseos" className="nav-button">
              <FontAwesomeIcon icon={faHeart} />
              <span>Mis Deseos</span>
            </Link>
            <Link to="/mis-compras" className="nav-button">
              <FontAwesomeIcon icon={faShoppingBag} />
              <span>Mis Compras</span>
            </Link>
            <Link to="/carrito" className="nav-button">
              <FontAwesomeIcon icon={faShoppingCart} />
              <span>Mi Carrito</span>
            </Link>
            <button onClick={handleLogout} className="nav-button logout-button">
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Cerrar Sesión</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default NavBar;
