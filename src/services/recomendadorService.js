import api from "./api";

export const getVehicleModels = async () => {
    const response = await api.get("/vehicles/models");
    return response.data.data || response.data;
};

export const getVehicleUseTypes = async () => {
    const response = await api.get("/selects/vehicle-uses");
    return response.data.data || response.data;
};

export const getRecomendacion = async (idVehicleModel, idVehicleUseType) => {
    const response = await api.post("/recommendations", {
        idVehicleModel,
        idVehicleUseType,
    });
    return response.data.data || response.data;
};
