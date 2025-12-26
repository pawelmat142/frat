export interface RegisterFormDto {
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
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


export interface GoogleLoginDto {
  idToken: string;
}

export interface TelegramLoginPin {
  pin: string;
  telegramChannelId: string;
  created: Date;
}