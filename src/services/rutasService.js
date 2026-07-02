import api from "./api";

export const getRutas = async () => {
    const response = await api.get("/routes");
    return response.data.data || response.data;
};

export const getRutaById = async (id) => {
    const response = await api.get(`/routes/${id}`);
    return response.data.data || response.data;
};

export const crearRuta = async ({ idUser, routeDate }) => {
    const response = await api.post("/routes", { idUser, routeDate });
    return response.data.data || response.data;
};

export const getVendedores = async () => {
    const response = await api.get("/users");
    const data = response.data.data || response.data;
    return data.filter((u) => u.status === 1);
};

export const getLugares = async () => {
    const response = await api.get("/selects/locations");
    return response.data.data || response.data;
};

export const crearViaje = async ({
    idRoute,
    idOriginLocation,
    idDestinationLocation,
    idSale,
}) => {
    const response = await api.post("/trips", {
        idRoute,
        idOriginLocation,
        idDestinationLocation,
        idSale: idSale || null,
    });
    return response.data.data || response.data;
};

export const iniciarViaje = async (id) => {
    const response = await api.patch(`/trips/${id}/start`);
    return response.data.data || response.data;
};

export const completarViaje = async (id) => {
    const response = await api.patch(`/trips/${id}/complete`);
    return response.data.data || response.data;
};

export const cancelarViaje = async (id) => {
    const response = await api.patch(`/trips/${id}/cancel`);
    return response.data.data || response.data;
};
