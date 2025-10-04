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