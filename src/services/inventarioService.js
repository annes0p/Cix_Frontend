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
    const response = await api.post("/products", producto);
    return response.data.data || response.data;
};

export const actualizarProducto = async (id, producto) => {
    const response = await api.put(`/products/${id}`, producto);
    return response.data.data || response.data;
};

export const eliminarProducto = async (id) => {
    const response = await api.patch(`/products/${id}/delete`);
    return response.data;
};
