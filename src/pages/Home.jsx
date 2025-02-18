import { useState, useEffect } from "react";
import axios from "../config/axios";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ProductCarousel from "../components/ProductCarousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Home.css";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { categorias } from "../assets/categorias";
import ProductPopup from "../components/ProductPopup";
import { useLikes } from "../context/LikedProductsContext";
import { useAuth } from "../context/useAuth"; // Importar el contexto de autenticación

function Home() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const itemsPerPage = 12;
  const { carrito, toggleCarrito } = useCart();
  const { likedProducts, setLikedProducts } = useLikes();

  // Obtén el estado de autenticación y el rol del usuario desde el contexto
  const { isAuthenticated, userRole } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products");
        setProductos(response.data);
        filterProductsByCategory(response.data, category);
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError(`Error al cargar productos: ${err.message}`);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filterProductsByCategory = (products, categoryName) => {
    if (!categoryName || categoryName === "tienda") {
      setFilteredProducts(products);
    } else {
      const normalizedCategoryName = categoryName.replace(/-/g, " ");
      const filtered = products.filter(
        (product) => product.category?.toLowerCase() === normalizedCategoryName
      );
      setFilteredProducts(filtered);
    }
  };

  useEffect(() => {
    filterProductsByCategory(productos, category);
  }, [category, productos]);

  useEffect(() => {
    const handleSearch = (event) => {
      const query = event.detail.query.toLowerCase();
      setSearchQuery(query);
      if (!query) {
        setFilteredProducts(productos);
      } else {
        const filtered = productos.filter((product) =>
          product.name?.toLowerCase().includes(query)
        );
        setFilteredProducts(filtered);
      }
    };

    window.addEventListener("onSearch", handleSearch);
    return () => {
      window.removeEventListener("onSearch", handleSearch);
    };
  }, [productos]);

  useEffect(() => {
    const fetchLikedProducts = async () => {
      if (isAuthenticated && userRole === "cliente") {
        try {
          const response = await axios.get(`/api/users/liked-products`);
          const likedProductIds = response.data.map((like) => like.product_id);
          setLikedProducts(new Set(likedProductIds));
        } catch (error) {
          console.error("Error al obtener los productos liked:", error);
        }
      }
    };

    fetchLikedProducts();
  }, [isAuthenticated, userRole]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const getCurrentProducts = () => {
    return filteredProducts
      .map((producto) => ({
        ...producto,
        cantidad: carrito[producto.id]?.cantidad || 0,
      }))
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  };

  const onCategorySelect = (categoryId) => {
    if (categoryId === null || categoryId === "tienda") {
      navigate("/home", { replace: true });
    } else {
      const categoria = categorias.find((cat) => cat.id === categoryId);
      const categoryName = categoria?.nombre.toLowerCase().replace(/\s+/g, "-");
      navigate(`/categoria/${categoryName}`, { replace: true });
    }
  };

  const getPageNumbers = () => {
    const maxPages = 10;
    let pages = [];

    if (totalPages <= maxPages) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      const leftOffset = Math.max(0, currentPage - Math.floor(maxPages / 2));
      const startPage = Math.max(1, leftOffset);

      pages = Array.from({ length: maxPages }, (_, i) => startPage + i).filter(
        (page) => page <= totalPages
      );
    }

    return pages;
  };

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Layout
      setSearchQuery={setSearchQuery}
      onCategorySelect={onCategorySelect}
      userRole={userRole}
      isAuthenticated={isAuthenticated}
    >
      <h2 className="featured-title">TOP TEN</h2>
      <ProductCarousel />

      <section className="productos-section">
        <h2 className="section-title">SHOP ONLINE</h2>
        <div className="productos-grid">
          {getCurrentProducts().map((producto) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              carrito={carrito}
              onToggleCarrito={toggleCarrito}
              onClick={() => setSelectedProduct(producto)}
            />
          ))}
        </div>

        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              className={`pagination-btn ${
                pageNum === currentPage ? "active" : ""
              }`}
              onClick={() => setCurrentPage(pageNum)}
            >
              {pageNum}
            </button>
          ))}

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </section>

      {selectedProduct && (
        <ProductPopup
          producto={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          carrito={carrito}
          onToggleCarrito={toggleCarrito}
        />
      )}
    </Layout>
  );
}

export default Home;
