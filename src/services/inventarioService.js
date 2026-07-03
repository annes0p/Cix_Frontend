import api from "./api";

export const getProductos = async () => {
    const response = await api.get("/products");
    return response.data.data || response.data;
};

export const getInventario = async () => {
    const response = await api.get("/inventory");
    return response.data.data || response.data;
};

export const getCategorias = async () => {
    const response = await api.get("/categories");
    return response.data.data || response.data;
};

export const getMarcas = async () => {
    const response = await api.get("/product-brands");
    return response.data.data || response.data;
};

export const crearProducto = async (producto) => {
    const formData = new FormData();
    formData.append("name", producto.name);
    formData.append("viscosity", producto.viscosity || "");
    formData.append("description", producto.description || "");
    formData.append("price", producto.price);
    formData.append("idCategory", producto.idCategory);
    formData.append("idBrand", producto.idBrand);
    if (producto.image) {
        formData.append("image", producto.image);
    }
    const response = await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data || response.data;
};

export const actualizarProducto = async (id, producto) => {
    const formData = new FormData();
    formData.append("name", producto.name);
    formData.append("viscosity", producto.viscosity || "");
    formData.append("description", producto.description || "");
    formData.append("price", producto.price);
    formData.append("idCategory", producto.idCategory);
    formData.append("idBrand", producto.idBrand);
    if (producto.image) {
        formData.append("image", producto.image);
    }
    const response = await api.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data || response.data;
};

export const eliminarProducto = async (id) => {
    const response = await api.patch(`/products/${id}/delete`);
    return response.data;
};
