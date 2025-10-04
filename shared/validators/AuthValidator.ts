
import { RegisterFormDto } from "@shared/dto/AuthDto";

export abstract class AuthValidators {
    static validateRegisterForm(dto: RegisterFormDto): string | null {
        if (!dto.email || !dto.confirmEmail || !dto.password || !dto.confirmPassword) {
            return 'validation.required';
        }
        if (dto.email !== dto.confirmEmail) {
            return 'validation.emailMatch';
        }
        if (dto.password !== dto.confirmPassword) {
            return 'validation.passwordMatch';
        }
        return null;
    }       
}
