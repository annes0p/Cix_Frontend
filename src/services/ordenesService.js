import api from "./api";

export const getOrdenes = async () => {
    const response = await api.get("/purchases");
    return response.data.data || response.data;
};

export const crearOrden = async (orden) => {
    const response = await api.post("/purchases", orden);
    return response.data.data || response.data;
};

export const getOrdenById = async (id) => {
    const response = await api.get(`/purchases/${id}`);
    return response.data.data || response.data;
};

export const getProductos = async () => {
    const response = await api.get("/products");
    return response.data.data || response.data;
};

export const recibirOrden = async (id) => {
    const response = await api.patch(`/purchases/${id}/receive`);
    return response.data.data || response.data;
};

export const recibirOrdenParcial = async (id, items) => {
    const response = await api.patch(`/purchases/${id}/partially-receive`, { items });
    return response.data.data || response.data;
};