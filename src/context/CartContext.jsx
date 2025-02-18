// FrontV3/src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [carrito, setCarrito] = useState(() => {
    return JSON.parse(localStorage.getItem("carrito")) || {};
  });

  const [mensajePopup, setMensajePopup] = useState({ tipo: null, mensaje: "" });
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchCarrito = async () => {
      try {
        const response = await axios.get("/api/carrito", {
          withCredentials: true,
        });

        if (response.data && Array.isArray(response.data)) {
          const carritoFromBackend = response.data.reduce((acc, item) => {
            acc[item.id_product] = {
              id: item.id_product,
              nombre: item.name,
              precio: item.price,
              imagen: item.image,
              cantidad: item.amount,
              description: item.description,
              id_cart: item.id,
            };
            return acc;
          }, {});
          setCarrito(carritoFromBackend);
        }
      } catch (error) {
        console.error("Error al obtener el carrito:", error);
        // Si hay error, mantenemos el carrito local
        const localCarrito = JSON.parse(localStorage.getItem("carrito")) || {};
        setCarrito(localCarrito);
      }
    };

    fetchCarrito();
  }, []);

  // Mantener sincronizado el localStorage
  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  const toggleCarrito = async (producto, cantidad, id_cart = null) => {
    try {
      if (cantidad === undefined) {
        cantidad = carrito[producto.id] ? 0 : 1;
      }

      // Actualizamos el estado local
      setCarrito((prevCarrito) => {
        const newCarrito = { ...prevCarrito };

        if (cantidad <= 0) {
          delete newCarrito[producto.id];
          return newCarrito;
        }

        newCarrito[producto.id] = {
          id: producto.id,
          nombre: producto.name,
          precio: producto.price,
          imagen: producto.image,
          cantidad: cantidad,
          description: producto.description,
          id_cart: id_cart,
        };

        return newCarrito;
      });
    } catch (error) {
      console.error("Error al modificar el carrito:", error);
      alert(
        "Error al modificar el carrito: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const actualizarCantidad = (productoId, cantidad) => {
    setCarrito((prevCarrito) => {
      const newCarrito = { ...prevCarrito };

      if (cantidad <= 0) {
        delete newCarrito[productoId];
        return newCarrito;
      }

      if (newCarrito[productoId]) {
        newCarrito[productoId].cantidad = cantidad;
      }

      return newCarrito;
    });
  };

  const eliminarProducto = async (productoId) => {
    try {
      const producto = carrito[productoId];

      // Si tiene id_cart, eliminamos del backend primero
      if (producto?.id_cart) {
        await axios.delete("/api/carrito-item", {
          data: { id: producto.id_cart },
          withCredentials: true,
        });
      }

      // Actualizamos el estado local
      setCarrito((prevCarrito) => {
        const newCarrito = { ...prevCarrito };
        delete newCarrito[productoId];
        localStorage.setItem("carrito", JSON.stringify(newCarrito));
        return newCarrito;
      });
    } catch (error) {
      console.error("Error al eliminar del carrito:", error);
    }
  };

  const calcularTotal = () => {
    return Object.values(carrito)
      .filter(
        (producto) =>
          producto &&
          typeof producto.precio === "number" &&
          typeof producto.cantidad === "number"
      )
      .reduce(
        (total, producto) => total + producto.precio * producto.cantidad,
        0
      );
  };

  const finalizarCompra = async () => {
    const navigate = useNavigate();
    try {
      if (Object.keys(carrito).length === 0) {
        setMensajePopup({ tipo: "error", mensaje: "El carrito está vacío" });
        setShowPopup(true);
        return;
      }

      // Primero guardamos el carrito para obtener los id_cart
      await axios.post(
        "/api/carrito-saved",
        {
          productos: Object.values(carrito).map((producto) => ({
            id_product: producto.id,
            amount: producto.cantidad,
            price: producto.precio,
            id_cart: producto.id_cart || null,
          })),
        },
        { withCredentials: true }
      );

      // Obtenemos los id_cart actualizados
      const carritoGuardado = await axios.get("/api/carrito", {
        withCredentials: true,
      });

      // Usamos los productos con id_cart para la compra
      const productosArray = carritoGuardado.data.map((producto) => ({
        product_id: Number(producto.id_product),
        amount: Number(producto.amount),
        price: Number(producto.price),
        id_cart: Number(producto.id),
      }));

      const response = await axios.post(
        "/api/confirmar-compra",
        {
          fecha: new Date().toISOString(),
          productos: productosArray,
          total: Number(calcularTotal()),
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setMensajePopup({
          tipo: "exito",
          mensaje: "¡Compra realizada con éxito!",
        });
        setCarrito({});
        localStorage.removeItem("carrito");
        setShowPopup(true);
        setTimeout(() => {
          navigate("/mis-compras");
        }, 2000);
      }
    } catch (error) {
      console.error("Error al finalizar la compra:", error);
      console.log("Mensaje de error completo:", error.response?.data);

      const errorMessage =
        error.response?.data?.error || error.response?.data?.message;

      if (errorMessage && errorMessage.includes("Stock insuficiente")) {
        const stockMatch = errorMessage.match(/Disponible: (\d+)/);
        const productMatch = errorMessage.match(/producto (.*?)\./);

        const stockDisponible = stockMatch ? stockMatch[1] : null;
        const nombreProducto = productMatch ? productMatch[1] : "el producto";

        setMensajePopup({
          tipo: "error",
          mensaje: stockDisponible
            ? `Nuestro Stock de <strong>${nombreProducto}</strong> es de <strong>${stockDisponible}</strong>.`
            : "Stock insuficiente",
        });
      } else {
        setMensajePopup({
          tipo: "error",
          mensaje:
            errorMessage ||
            "Error al procesar la compra. Por favor, intente nuevamente.",
        });
      }
      setShowPopup(true);
    }
  };

  return (
    <CartContext.Provider
      value={{
        carrito,
        toggleCarrito,
        actualizarCantidad,
        eliminarProducto,
        calcularTotal,
        finalizarCompra,
        mensajePopup,
        showPopup,
        setShowPopup,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CartContext;
