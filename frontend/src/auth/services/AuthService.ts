import { RegisterFormDto } from "@shared/dto/AuthDto";
import { httpClient } from "global/services/http";

export const AuthService = {
	async registerForm(data: RegisterFormDto): Promise<any> {
		return httpClient.post("/auth/register-form", data);
	}
};
