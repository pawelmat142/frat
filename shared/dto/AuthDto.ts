export interface RegisterFormDto {
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterFormResponse {
  success: boolean;
  message: string;
}

export interface LoginFormDto {
  email: string;
  password: string;
}

export interface LoginFormResponse {
  success: boolean;
  message: string;
  token?: string;
}