import { createContext, useContext, useState, useEffect } from "react";
import axios from "../config/axios";

const LikeContext = createContext();

export const useLikes = () => {
  return useContext(LikeContext);
};

export const LikeProvider = ({ children }) => {
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const fetchLikedProducts = async () => {
    try {
      const response = await axios.get(`/api/users/liked-products`);
      const likedProductIds = response.data.map((like) => like.product_id);
      setLikedProducts(new Set(likedProductIds));
    } catch (error) {
      console.error("Error al obtener los productos liked:", error);
    } finally {
      setLoading(false);
    }
  };

  const addLike = async (productId) => {
    try {
      await axios.post(`/api/user_likes`, {
        data: { product_id: productId },
      });
      setLikedProducts((prev) => new Set(prev).add(productId));
    } catch (error) {
      console.error("Error al agregar like:", error);
    }
  };

  const removeLike = async (productId) => {
    try {
      await axios.delete(`/api/user_likes`, {
        data: { product_id: productId },
      });
      setLikedProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    } catch (error) {
      console.error("Error al eliminar like:", error);
    }
  };

  useEffect(() => {
    fetchLikedProducts();
  }, []);

  return (
    <LikeContext.Provider value={{ likedProducts, addLike, removeLike, loading, setLikedProducts }}>
      {children}
    </LikeContext.Provider>
  );
};
