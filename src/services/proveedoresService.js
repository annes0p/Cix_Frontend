import api from "./api";

export const getProveedores = async () => {
    const response = await api.get("/suppliers");
    return response.data.data || response.data;
};

export const crearProveedor = async (proveedor) => {
    const response = await api.post("/suppliers", proveedor);
    return response.data.data || response.data;
};

export const actualizarProveedor = async (id, proveedor) => {
    const response = await api.put(`/suppliers/${id}`, proveedor);
    return response.data.data || response.data;
};

export const eliminarProveedor = async (id) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
};

export const getProductosDeProveedor = async (id) => {
    const response = await api.get(`/suppliers/${id}/products`);
    return response.data.data || response.data;
};

export const actualizarProductosDeProveedor = async (id, productIds) => {
    const response = await api.put(`/suppliers/${id}/products`, {
        productIds,
    });
    return response.data.data || response.data;
};
