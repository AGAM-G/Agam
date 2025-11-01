import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add JWT token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: { email: string; password: string; name: string }) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.client.post('/auth/login', data);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // Test Cases endpoints
  async getTestCases(params?: { type?: string; status?: string; search?: string }) {
    const response = await this.client.get('/tests/cases', { params });
    return response.data;
  }

  async getTestCaseById(id: string) {
    const response = await this.client.get(`/tests/cases/${id}`);
    return response.data;
  }

  async createTestCase(data: any) {
    const response = await this.client.post('/tests/cases', data);
    return response.data;
  }

  async updateTestCase(id: string, data: any) {
    const response = await this.client.put(`/tests/cases/${id}`, data);
    return response.data;
  }

  async deleteTestCase(id: string) {
    const response = await this.client.delete(`/tests/cases/${id}`);
    return response.data;
  }

  async getTestFiles(params?: { type?: string; status?: string }) {
    const response = await this.client.get('/tests/files', { params });
    return response.data;
  }

  async discoverTests() {
    const response = await this.client.post('/tests/discover');
    return response.data;
  }

  async executeTestFile(fileId: string) {
    const response = await this.client.post(`/tests/files/${fileId}/execute`);
    return response.data;
  }

  async cleanupTestFiles() {
    const response = await this.client.delete('/tests/cleanup');
    return response.data;
  }

  // Test Runs endpoints
  async getTestRuns(params?: { status?: string; limit?: number }) {
    const response = await this.client.get('/test-runs/runs', { params });
    return response.data;
  }

  async getTestRunById(id: string) {
    const response = await this.client.get(`/test-runs/runs/${id}`);
    return response.data;
  }

  async createTestRun(data: { name: string; testCaseIds: string[] }) {
    const response = await this.client.post('/test-runs/runs', data);
    return response.data;
  }

  async updateTestRun(id: string, data: any) {
    const response = await this.client.put(`/test-runs/runs/${id}`, data);
    return response.data;
  }

  async stopTestRun(id: string) {
    const response = await this.client.post(`/test-runs/runs/${id}/stop`);
    return response.data;
  }

  async getDashboardMetrics() {
    const response = await this.client.get('/test-runs/dashboard/metrics');
    return response.data;
  }

  async getSystemHealth() {
    const response = await this.client.get('/test-runs/dashboard/system-health');
    return response.data;
  }

  // Monitoring endpoints
  async getActiveTests(params?: { limit?: number }) {
    const response = await this.client.get('/monitoring/active-tests', { params });
    return response.data;
  }

  async getSystemHealthDetailed() {
    const response = await this.client.get('/monitoring/system-health');
    return response.data;
  }

  async getSystemAlerts() {
    const response = await this.client.get('/monitoring/alerts');
    return response.data;
  }

  async getExecutionStats(params?: { timeRange?: string }) {
    const response = await this.client.get('/monitoring/stats', { params });
    return response.data;
  }

  // Scheduled Tests endpoints
  async getScheduledTests(params?: { enabled?: boolean; scheduleType?: string }) {
    const response = await this.client.get('/tests/scheduled', { params });
    return response.data;
  }

  async getScheduledTestById(id: string) {
    const response = await this.client.get(`/tests/scheduled/${id}`);
    return response.data;
  }

  async createScheduledTest(data: any) {
    const response = await this.client.post('/tests/scheduled', data);
    return response.data;
  }

  async updateScheduledTest(id: string, data: any) {
    const response = await this.client.put(`/tests/scheduled/${id}`, data);
    return response.data;
  }

  async deleteScheduledTest(id: string) {
    const response = await this.client.delete(`/tests/scheduled/${id}`);
    return response.data;
  }

  async toggleScheduledTest(id: string, enabled: boolean) {
    const response = await this.client.patch(`/tests/scheduled/${id}/toggle`, { enabled });
    return response.data;
  }

  // Notification endpoints
  async getNotifications(params?: { limit?: number }) {
    const response = await this.client.get('/notifications', { params });
    return response.data;
  }

  async getUnreadCount() {
    const response = await this.client.get('/notifications/unread-count');
    return response.data;
  }

  // Team/User endpoints
  async getAllUsers() {
    const response = await this.client.get('/auth/users');
    return response.data;
  }

  async updateUserRole(userId: string, role: string) {
    const response = await this.client.patch(`/auth/users/${userId}/role`, { role });
    return response.data;
  }

  async deleteUser(userId: string) {
    const response = await this.client.delete(`/auth/users/${userId}`);
    return response.data;
  }

  async getUserStats(userId: string) {
    const response = await this.client.get(`/auth/users/${userId}/stats`);
    return response.data;
  }
}

export const api = new ApiClient();
