import api from '../api/axios';

export const dashboardService = {
  getSummaryData: async (fechaInicio, fechaFin, empresaId) => {
    try {
      const response = await api.get('/dashboard/summary', {
        params: {
          startDate: fechaInicio,
          endDate: fechaFin,
          companyId: empresaId
        }
      });
      return response.data.data; 
    } catch (error) {
      throw error.response?.data?.message || 'Error al cargar los datos del Dashboard';
    }
  }
};