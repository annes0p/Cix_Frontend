import api from "./api";

export const getSeguimientoPublico = async (token) => {
    const response = await api.get(`/tracking/public/${token}`);
    return response.data.data || response.data;
};

export const getLinkSeguimiento = async (idTrip) => {
    const response = await api.get(`/tracking/${idTrip}/link`);
    const data = response.data.data || response.data;
    return data.token;
};

export const enviarUbicacion = async (idTrip, latitude, longitude) => {
    await api.patch(`/tracking/${idTrip}/location`, { latitude, longitude });
};
