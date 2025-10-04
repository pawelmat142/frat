import { toast } from 'react-toastify';
import { QueryClient } from '@tanstack/react-query';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { MyHttpCode } from '@shared/def/http.def';
import { PopupHandler } from 'global/providers/PopupProvider';
import { BtnModes } from 'global/interface/controls.interface';
import { Path } from '../../path';

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const queryClient = new QueryClient();

export class HttpClient {
  private axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
  });

  private popupHandler?: PopupHandler;

  setPopupHandler(handler: PopupHandler) {
    this.popupHandler = handler;
  }

  constructor() {
    this.axiosInstance.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.data instanceof Blob) {
          this.handleFileError(error);
        } else {
          this.handleError(error);
        }
        return Promise.reject(error);
      }
    );
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
    window.location.replace(Path.ERROR_PAGE);
  }

  private async handlePopupException(error: AxiosError) {
    if (!this.popupHandler) return;
    const confirmed = await this.popupHandler({

      // TODO translate
      title: 'Wystąpił błąd',
      message: this.getErrorMsg(error),
      buttons: [
        { text: 'Zostań na tej stronie', mode: BtnModes.ERROR_TXT },
        { text: 'Wróć na stronę główną', mode: BtnModes.PRIMARY, action: () => true },
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
        default:
          this.handleSWW(error);
      }
    } else {
      toast.error('Network error');
    }
  }

  private handleFileError(error: any) {
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
  }

}

export const httpClient = new HttpClient();

// Usage: wrap your app with <QueryClientProvider client={queryClient}> in index.tsx
// Example hooks:
// import { useQuery, useMutation } from '@tanstack/react-query';
// useQuery(['dictionaries'], () => httpClient.get('/dictionaries'));
// useMutation((data) => httpClient.put('/dictionaries', data));
