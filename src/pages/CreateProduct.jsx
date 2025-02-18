import { useState, useEffect } from "react";
import axios from "../config/axios";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/CreateProduct.css";
import Layout from "../components/Layout";

const CreateProduct = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: null,
    category: "",
    currentImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  const categories = [
    "PCs",
    "CPUs",
    "Monitores",
    "Perifericos",
    "Audio",
    "Software",
    "Accesorios",
  ];

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchProductData();
    }
  }, [id]);

  const fetchProductData = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      const product = response.data;
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category || "",
        image: null,
        currentImage: product.image,
      });
      setImagePreview(product.image);
    } catch (error) {
      setError("Error al cargar el producto");
      console.error("Error:", error);
    }
  };

  const formatPrice = (value) => {
    const numbers = value.replace(/[^\d]/g, "");
    return numbers ? `$${numbers}` : "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "price") {
      const numericValue = value.replace(/[^\d]/g, "");
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Por favor selecciona un archivo de imagen válido");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen debe ser menor a 5MB");
        return;
      }

      setFormData({
        ...formData,
        image: file,
      });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("description", formData.description);
      formDataToSubmit.append("price", Number(formData.price));
      formDataToSubmit.append("stock", Number(formData.stock));
      formDataToSubmit.append("category", formData.category);

      console.log("Datos del formulario:", formData);
      console.log("currentImage:", formData.currentImage);

      if (formData.image) {
        console.log("Enviando nueva imagen");
        formDataToSubmit.append("image", formData.image);
      } else if (isEditMode) {
        console.log("Enviando URL de imagen actual:", formData.currentImage);
        formDataToSubmit.append("currentImage", formData.currentImage);
      }
      for (let [key, value] of formDataToSubmit.entries()) {
        console.log(`${key}: ${value}`);
      }

      let response;
      if (isEditMode) {
        response = await axios.put(`/api/products/${id}`, formDataToSubmit, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        if (!formData.image) {
          setError("Se requiere una imagen para crear un nuevo producto");
          return;
        }
        response = await axios.post("/api/products", formDataToSubmit, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.status === 200 || response.status === 201) {
        navigate("/product-management");
      }
    } catch (error) {
      console.error("Error detallado:", error.response?.data || error);
      setError(error.response?.data?.message || "Error al guardar el producto");
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      image: null,
      category: "",
      currentImage: null,
    });
    setImagePreview(null);
  };

  return (
    <Layout>
      <div className="create-product-section">
        <h2 className="section-title">
          {isEditMode ? "Editar Producto" : "Crear Nuevo Producto"}
        </h2>

        {error && <p className="error-message">{error}</p>}

        <div className="form-container">
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Nombre del Producto"
                className="input"
              />
            </div>

            <div className="form-group">
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Descripción del Producto"
                className="input"
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price ? `$${formData.price}` : ""}
                onChange={handleChange}
                required
                placeholder="Precio del Producto"
                className="input"
                pattern="^\$\d*$"
              />
            </div>

            <div className="form-group">
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                placeholder="Stock del Producto"
                className="input"
              />
            </div>

            <div className="form-group">
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="input"
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Vista previa" />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="button">
                {isEditMode ? "Actualizar Producto" : "Guardar Producto"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/product-management")}
                className="button"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProduct;
