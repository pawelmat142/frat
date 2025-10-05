// Allow custom skipAuth property in AxiosRequestConfig
import 'axios';

declare module 'axios' {
	export interface AxiosRequestConfig {
		skipAuth?: boolean;
	}
}
declare module '*.scss';
