import api from "./api";

export const getClientes = async () => {
    const response = await api.get("/clients");
    return response.data.data || response.data;
};

export const getClienteById = async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data.data || response.data;
};

export const crearCliente = async (data) => {
    const response = await api.post("/clients", data);
    return response.data.data || response.data;
};

export const actualizarCliente = async (id, data) => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data.data || response.data;
};

export const toggleCliente = async (id) => {
    const response = await api.patch(`/clients/${id}/toggle`);
    return response.data.data || response.data;
};

export const eliminarCliente = async (id) => {
    const response = await api.patch(`/clients/${id}/delete`);
    return response.data;
};
