import api from '../api/axios';

export const authService = {
    login: async (identifier, password) => {
        try {
            const response = await api.post('/auth/login', {
                identifier,
                password,
            });

            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Error al conectar con el servidor';
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

};
