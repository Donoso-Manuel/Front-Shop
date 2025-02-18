import { useState, useEffect } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/ProductCarousel.css";
import axiosInstance from "../config/axios";
import ProductPopup from "./ProductPopup";
import { useCart } from "../context/CartContext";

function ProductCarousel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { carrito, toggleCarrito } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get(
          "/api/products/recommended-products?limit=5"
        );
        setProducts(response.data);
      } catch (err) {
        setError("Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    centerMode: true,
    centerPadding: "0px",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          centerMode: false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          centerMode: false,
        },
      },
    ],
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <div className="carousel-container">
        <Slider {...settings}>
          {products.map((product) => (
            <div
              key={product.id}
              className="carousel-item"
              onClick={() => handleProductClick(product)}
              style={{ cursor: "pointer" }}
            >
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>{product.likes} likes</p>
            </div>
          ))}
        </Slider>
      </div>

      {selectedProduct && (
        <ProductPopup
          producto={selectedProduct}
          carrito={carrito}
          onToggleCarrito={toggleCarrito}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}

export default ProductCarousel;
