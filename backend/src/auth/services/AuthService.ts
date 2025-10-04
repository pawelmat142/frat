/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { RegisterFormDto, RegisterFormResponse } from '@shared/dto/AuthDto';
import { AuthValidators } from '@shared/validators/AuthValidator';
import { ToastException } from 'global/exceptions/ToastException';

@Injectable()
export class AuthService {

  private readonly logger = new Logger(this.constructor.name);

  constructor(
  ) { }

  public async registerForm(dto: RegisterFormDto): Promise<RegisterFormResponse> {
    this.logger.log('registerForm', dto);

    const validationErrorKey = AuthValidators.validateRegisterForm(dto);
    if (validationErrorKey) {
      throw new ToastException(validationErrorKey, this);
    }

    // Registration logic would go here
    throw new ToastException('Registration is currently disabled', this);
  }
}
