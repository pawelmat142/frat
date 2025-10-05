/** Created by Pawel Malek **/
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Dekorator oznaczający endpoint jako publiczny (bez wymagania autoryzacji)
 * Użycie: @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
