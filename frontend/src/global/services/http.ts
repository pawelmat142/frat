import { toast } from 'react-toastify';
import { t } from 'global/i18n';
import { QueryClient } from '@tanstack/react-query';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { MyHttpCode } from '@shared/def/http.def';
import { PopupHandler } from 'global/providers/PopupProvider';
import { BtnModes } from 'global/interface/controls.interface';
import { Path } from '../../path';
import { FirebaseAuth } from 'auth/services/FirebaseAuth';

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const queryClient = new QueryClient();

export class HttpClient {

  private axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
  });

  private popupHandler?: PopupHandler;
  private navigate?: (path: string, options?: { replace?: boolean }) => void;

  setPopupHandler(handler: PopupHandler) {
    this.popupHandler = handler;
  }

  setNavigate(navigate: (path: string, options?: { replace?: boolean }) => void) {
    this.navigate = navigate;
  }

  private static isIsoDateString(value: unknown): boolean {
    return (
      typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?$/.test(value)
    );
  }

  private static reviveDatesDeep<T>(data: T): T {
    if (Array.isArray(data)) {
      return data.map(item => HttpClient.reviveDatesDeep(item)) as unknown as T;
    }
    if (data && typeof data === 'object') {
      const result: any = Array.isArray(data) ? [] : {};
      for (const key in data as any) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const val = (data as any)[key];
          if (HttpClient.isIsoDateString(val)) {
            result[key] = new Date(val as string);
          } else {
            result[key] = HttpClient.reviveDatesDeep(val);
          }
        }
      }
      return result as T;
    }
    return data;
  }

  constructor() {
    // Request interceptor - automatycznie dodaj token do każdego requesta
    this.axiosInstance.interceptors.request.use(
      async (config) => {

        // Custom flag to skip auth header
        if (config.skipAuth) {
          return config;
        }

        const token = await FirebaseAuth.getCurrentIdToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - obsługa błędów
    this.axiosInstance.interceptors.response.use(
      response => {
        if (response && response.data && !(response.data instanceof Blob)) {
          response.data = HttpClient.reviveDatesDeep(response.data);
        }
        return response;
      },
      error => {
        if (error.response?.data instanceof Blob) {
          this.handleFileError(error);
          return Promise.reject(error); // zawsze propaguj błąd po handleFileError
        } else {
          this.handleError(error);
          return Promise.reject(error); // jeśli handleError nie zwrócił nic, propaguj oryginalny błąd
        }
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.get<T>(url, config);
    return res?.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.post<T>(url, data, config);
    return res?.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.put<T>(url, data, config);
    return res?.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.patch<T>(url, data, config);
    return res?.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.delete<T>(url, config);
    return res?.data;
  }

  async getFile(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<Blob>> {
    return this.axiosInstance.get<Blob>(url, { ...config, responseType: 'blob' });
  }

  getAndClearErrorMsg() {
    const msg = localStorage.getItem('lastErrorMsg') || 'Error not found';
    localStorage.removeItem('lastErrorMsg')
    return msg;
  }

  private storeErrorMsg(msg: string) {
    localStorage.setItem('lastErrorMsg', msg)
  }

  private handleSWW(error: AxiosError) {
    console.error(error);
    const msg = this.getErrorMsg(error);
    this.storeErrorMsg(msg);
    if (this.navigate) {
      this.navigate(Path.ERROR_PAGE, { replace: true });
    } else {
      window.location.replace(Path.ERROR_PAGE);
    }
  }

  private async handlePopupException(error: AxiosError) {
    if (!this.popupHandler) return;
    const confirmed = await this.popupHandler({

      title: 'validation.popup.title',
      message: this.getErrorMsg(error),
      buttons: [
        { text: 'validation.popup.stay', mode: BtnModes.ERROR_TXT },
        { text: 'validation.popup.goHome', mode: BtnModes.PRIMARY, action: () => true },
      ]
    });
    if (confirmed) {
      window.location.href = '/';
    }
  }

  private getErrorMsg(error: AxiosError): string {
    return error.response?.data && typeof (error.response.data as any).message === 'string'
      ? (error.response.data as any).message
      : error.message;
  }

  private handleError(error: AxiosError) {
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case MyHttpCode.TOAST_ERROR: //460
          toast.error(this.getErrorMsg(error));
          break;
        case MyHttpCode.TOAST_WARNING: //461
          toast.warning(this.getErrorMsg(error));
          break;
        case MyHttpCode.SWW: //599
          this.handleSWW(error);
          break;
          case MyHttpCode.POPUP_ERROR: //462
          this.handlePopupException(error);
          break;

          case 401: // Unauthorized
          FirebaseAuth.getAuth().signOut();
          toast.warn(String(t('authError.sessionExpired')));
          if (this.navigate) {
            this.navigate(Path.SIGN_IN);
          }
          break;
          default:
          this.handleSWW(error);
      }
    } else {
      toast.error(String(t('common.networkError')));
    }
  }

  private handleFileError(error: any): boolean {
    const reader = new FileReader();
    reader.onload = () => {
      const response = JSON.parse(reader.result as string);
      const axiosError: AxiosError = {
        ...error,
        message: response.message,
        name: error.name,
        config: error.config,
        code: error.code,
        request: error.request,
        response: error.response,
        isAxiosError: true,
        toJSON: () => ({})
      };
      this.handleError(axiosError);
    };
    reader.readAsText(error.response.data);
    return true;
  }

}

export const httpClient = new HttpClient();

// Usage: wrap your app with <QueryClientProvider client={queryClient}> in index.tsx
// Example hooks:
// import { useQuery, useMutation } from '@tanstack/react-query';
// useQuery(['dictionaries'], () => httpClient.get('/dictionaries'));
// useMutation((data) => httpClient.put('/dictionaries', data));
