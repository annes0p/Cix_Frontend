import api from "./api";

export const getProductos = async () => {
    try {
        const response = await api.get("/productos");
        return response.data.data || response.data;
    } catch (error) {
        console.error("Error al obtener productos:", error);
        throw error;
    }
};

export const crearProducto = async (producto) => {
    try {
        const response = await api.post("/productos", producto);
        return response.data.data || response.data;
    } catch (error) {
        console.error("Error al crear producto:", error);
        throw error;
    }
};

export const actualizarProducto = async (id, producto) => {
    try {
        const response = await api.put(`/productos/${id}`, producto);
        return response.data.data || response.data;
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        throw error;
    }
};

export const eliminarProducto = async (id) => {
    try {
        const response = await api.delete(`/productos/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        throw error;
    }
};
