import { toast } from 'react-toastify';
import { QueryClient } from '@tanstack/react-query';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// TODO dorobić popup exception, redirect exception,

export const queryClient = new QueryClient();

export class HttpClient {
  private axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
  });

  constructor() {
    this.axiosInstance.interceptors.response.use(
      response => response,
      error => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: AxiosError) {
    if (error.response) {
      const status = error.response.status;
      const msg =
        error.response.data && typeof (error.response.data as any).message === 'string'
          ? (error.response.data as any).message
          : error.message;
      // Custom error handling for NestJS codes
      switch (status) {
        case 400:
          toast.error(msg || 'Bad request');
          break;
        case 401:
          toast.error('Unauthorized');
          break;
        case 403:
          toast.error('Forbidden');
          break;
        case 404:
          toast.error('Not found');
          break;
        case 409:
          toast.error(msg || 'Conflict');
          break;
        case 422:
          toast.error(msg || 'Validation error');
          break;
        case 500:
          toast.error('Server error');
          break;
        default:
          toast.error(msg || 'Unknown error');
      }
      // TODO: show popup/modal for critical errors if needed
    } else {
      toast.error('Network error');
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.get<T>(url, config);
    return res.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.post<T>(url, data, config);
    return res.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.put<T>(url, data, config);
    return res.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.delete<T>(url, config);
    return res.data;
  }

  async getFile(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<Blob>> {
    return this.axiosInstance.get<Blob>(url, { ...config, responseType: 'blob' });
  }
  
}

export const httpClient = new HttpClient();

// Usage: wrap your app with <QueryClientProvider client={queryClient}> in index.tsx
// Example hooks:
// import { useQuery, useMutation } from '@tanstack/react-query';
// useQuery(['dictionaries'], () => httpClient.get('/dictionaries'));
// useMutation((data) => httpClient.put('/dictionaries', data));
