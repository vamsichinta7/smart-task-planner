import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'https://smart-task-planner-2.onrender.com';

const api = axios.create({
	baseURL,
	headers: {
		'Content-Type': 'application/json'
	}
});

// Attach token automatically from localStorage or sessionStorage
api.interceptors.request.use((config) => {
	const token = localStorage.getItem('token') || sessionStorage.getItem('token');
	if (token) {
		config.headers = config.headers || {};
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
}, (error) => Promise.reject(error));

// Handle authentication errors
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			// Token is invalid or expired
			localStorage.removeItem('token');
			sessionStorage.removeItem('token');
			
			// Redirect to login by reloading the page
			if (window.location.pathname !== '/') {
				window.location.reload();
			}
			
			error.message = 'Session expired. Please sign in again.';
		}
		return Promise.reject(error);
	}
);

export default api;