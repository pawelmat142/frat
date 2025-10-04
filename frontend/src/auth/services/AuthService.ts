import { LoginFormDto, LoginFormResponse, RegisterFormDto } from "@shared/dto/AuthDto";
import { httpClient } from "global/services/http";

export const AuthService = {
	async registerForm(data: RegisterFormDto): Promise<any> {
		return httpClient.post("/auth/register-form", data);
	},

	async loginForm(dto: LoginFormDto): Promise<LoginFormResponse> {
		return httpClient.post("/auth/login-form", dto);
	},

	async loginWithGoogle(): Promise<void> {

		// const response = await httpClient.get<{ url: string }>("/auth/login-google");
		// window.location.href = response.url;
		// return new Promise(() => { });
	}

};
