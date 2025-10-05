
import { RegisterFormDto } from "@shared/dto/AuthDto";
import { UserI, UserRole } from "@shared/interfaces/UserI";

export abstract class AuthValidators {
    public static validateRegisterForm(dto: RegisterFormDto): string | null {
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

    public static handleFireAuthError(error: any): string | null {
        console.error('Login error:', error);
        const errorCode = error.code;
        // Obsługa błędów Firebase
        switch (errorCode) {
            case 'auth/invalid-credential':
                return 'authError.invalidCredential';
            case 'auth/wrong-password':
                return 'authError.wrongPassword';
            case 'auth/user-not-found':
                return 'authError.userNotFound';
            case 'auth/too-many-requests':
                return 'authError.tooManyRequests';
            case 'auth/user-disabled':
                return 'authError.userDisabled';
            default:
                throw new Error(error);
        }
    }

    public static hasPermission(rolesGuard?: UserRole[], user?: UserI | null): boolean {
        if (!rolesGuard) {
            return true;
        }
        return rolesGuard.some((role: UserRole) => user?.roles.includes(role));
    }
}
