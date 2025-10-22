import { applyDecorators, UseInterceptors, SerializeOptions, Type } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';

export function Serialize(type: Type<any>) {
  return applyDecorators(
    UseInterceptors(ClassSerializerInterceptor),
    SerializeOptions({ type })
  );
}
