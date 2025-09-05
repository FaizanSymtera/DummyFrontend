import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 600000, // 10 minutes timeout for comprehensive AI processing with clickable URLs
  withCredentials: false, // Disable credentials for CORS
});

// Request interceptor for better error handling
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`Received response from ${response.config.url}:`, response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    console.error('Error details:', {
      response: error.response,
      request: error.request,
      message: error.message,
      config: error.config
    });
    
    // Enhanced error messages
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      let message = 'An error occurred';
      
      if (status === 404) {
        message = 'Resource not found';
      } else if (status === 500) {
        message = 'Internal server error';
      } else if (data?.detail && typeof data.detail === 'string') {
        message = data.detail;
      } else if (data?.message && typeof data.message === 'string') {
        message = data.message;
      }
      
      error.userMessage = message;
    } else if (error.request) {
      // Request was made but no response received
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        error.userMessage = 'Request timed out. The AI analysis is taking longer than expected. Please try again.';
      } else {
        error.userMessage = 'No response from server. Please check if the backend is running.';
      }
    } else {
      // Something else happened
      error.userMessage = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

// Drug Search APIs
export const drugAPI = {
  // Main drug search with webhook integration
  search: (data) => {
    // Ensure the request matches the expected format
    const requestData = {
      product_name: data.product_name,
      user_id: data.user_id,
      product_type: data.analysis_type || data.product_type || 'comprehensive'
    };
    console.log('Drug Search API call with data:', requestData);
    return api.post('/search/product', requestData);
  },
  
  // Specialized drug analysis
  marketAnalysis: (data) => {
    const requestData = {
      product_name: data.product_name,
      user_id: data.user_id,
      product_type: 'market_analysis'
    };
    console.log('Market Analysis API call with data:', requestData);
    return api.post('/search/product', requestData);
  },
  formulationAnalysis: (data) => {
    const requestData = {
      product_name: data.product_name,
      user_id: data.user_id,
      product_type: 'formulation_analysis'
    };
    console.log('Formulation Analysis API call with data:', requestData);
    return api.post('/search/product', requestData);
  },
  pharmacokineticAnalysis: (data) => {
    const requestData = {
      product_name: data.product_name,
      user_id: data.user_id,
      product_type: 'pharmacokinetic_analysis'
    };
    console.log('PK/PD Analysis API call with data:', requestData);
    return api.post('/search/product', requestData);
  },
  
  // Drug reports
  getReport: (reportId) => api.get(`/search/product/${reportId}`),
  getUserReports: (userId, limit = 50) => api.get(`/search/product/user/${userId}?limit=${limit}`),
  updateReport: (reportId, data) => api.put(`/search/product/${reportId}`, data),
  deleteReport: (reportId) => api.delete(`/search/product/${reportId}`),
};

// Company Search APIs
export const companyAPI = {
  // Main company search with webhook integration
  search: (data) => {
    // Ensure the request matches the expected format
    const requestData = {
      company_name: data.company_name,
      user_id: data.user_id || 'demo_user'
    };
    console.log('Company Search API call with data:', requestData);
    return api.post('/search/company', requestData);
  },
  
  // Specialized company analysis - using the correct specialized endpoints
  marketAnalysis: (data) => {
    const requestData = {
      company_name: data.company_name,
      user_id: data.user_id || 'demo_user'
    };
    console.log('Company Market Analysis API call with data:', requestData);
    return api.post('/search/company/market-analysis', requestData);
  },
  formulationAnalysis: (data) => {
    const requestData = {
      company_name: data.company_name,
      user_id: data.user_id || 'demo_user'
    };
    console.log('Company Formulation Analysis API call with data:', requestData);
    return api.post('/search/company/formulation-analysis', requestData);
  },
  pharmacokineticAnalysis: (data) => {
    const requestData = {
      company_name: data.company_name,
      user_id: data.user_id || 'demo_user'
    };
    console.log('Company PK/PD Analysis API call with data:', requestData);
    return api.post('/search/company/pharmacokinetic-analysis', requestData);
  },
  
  // Company reports
  getReport: (reportId) => api.get(`/search/company/${reportId}`),
  getByName: (companyName, limit = 10) => api.get(`/search/company/by-name/${companyName}?limit=${limit}`),
  getAll: (limit = 50, skip = 0) => api.get(`/search/company/all?limit=${limit}&skip=${skip}`),
  getUserReports: (userId, limit = 50) => api.get(`/search/company/user/${userId}?limit=${limit}`),
  getStats: () => api.get('/search/company/stats'),
  updateReport: (reportId, data) => api.put(`/search/company/${reportId}`, data),
  deleteReport: (reportId) => api.delete(`/search/company/${reportId}`),
};

// Sources APIs
export const sourcesAPI = {
  getSources: (reportId) => {
    console.log('🔍 sourcesAPI.getSources called with:', reportId);
    console.log('🔍 reportId type:', typeof reportId);
    console.log('🔍 reportId value:', reportId);
    return api.get(`/search/sources/${reportId}`);
  },
};

// Warehouse APIs
export const warehouseAPI = {
  // Stage 1: Extract raw data to warehouse
  extractRawData: (data) => {
    const requestData = {
      query: data.query,
      entity_type: data.entity_type,
      user_id: data.user_id || 'bd6eb89e-6cdc-4a36-90ef-d0f2875f91ea'
    };
    console.log('Warehouse extract raw data API call with data:', requestData);
    return api.post('/extract-raw-data', requestData);
  },
  
  // Stage 2: Generate report from warehouse
  generateReportFromWarehouse: (data) => {
    const requestData = {
      warehouse_id: data.warehouse_id,
      user_id: data.user_id || 'demo_user',
      report_sections: data.report_sections || [
        'market_analysis', 
        'formulation_analysis', 
        'pharmacokinetic_analysis', 
        'dosage_and_opportunity_matrix', 
        'drug_search'
      ],
      agent_cycles_per_section: data.agent_cycles_per_section || 3
    };
    console.log('Warehouse generate report API call with data:', requestData);
    return api.post('/generate-report-from-warehouse', requestData);
  }
};

// General APIs
export const generalAPI = {
  health: () => api.get('/health'),
  info: () => api.get('/info'),
};

export default api;
