/** Created by Pawel Malek **/
import {
  Controller,
  Get,
  Param,
  Res,
  Post,
  UseInterceptors,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TranslationEntity } from '../dictionaries/model/TranslationEntity';
import { ImportUtil } from 'global/utils/ImportUtil';
import { TranslationValidators } from '@shared/validators/TranslationValidators';
import { TranslationService } from './TranslationService';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { ToastException } from 'global/exceptions/ToastException';
import { UserRoles } from '@shared/interfaces/UserI';
import { Roles } from 'auth/decorators/RolesDecorator';
import { RolesGuard } from 'auth/guards/RolesGuard';
import { JwtAuthGuard } from 'auth/guards/JwtAuthGuard';

@Controller('api/admin/import/translations')
@UseInterceptors(LogInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
export class TranslationsImportServiceController {

  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(TranslationEntity)
    private translationRepository: Repository<TranslationEntity>,
    private readonly translationService: TranslationService
  ) { }

  @Get('export/:langCode')
  async exportDictionary(@Param('langCode') langCode: string, @Res() res: Response) {
    const translation: TranslationEntity = await this.translationRepository.findOne({ where: { langCode } });
    if (!translation) {
      throw new ToastException('Translation not found', this);
    }
    delete translation.translationId
    const json = JSON.stringify(translation, null, 2);
    ImportUtil.prepareExportResponse(res, `translation_${langCode}`);
    res.send(json);
  }

  @Post('import')
  async importDictionary(@Res() res: Response) {
    try {
      if (!res.req || !res.req.body) {
        throw new Error('No data provided');
      }
      const data = res.req.body;

      if (!(await this.translationService.isSupportedTranslationLang(data.langCode))) {
        throw new Error(`Language code '${data.langCode}' is not supported.`);
      }

      // Translation JSON validation
      const translationValidationFns = [
        TranslationValidators.validateLangCode,
        TranslationValidators.validateVersion,
        TranslationValidators.validateData,
        TranslationValidators.validateDuplicateKeys,
        TranslationValidators.validateKeyFormat,
      ];
      for (const fn of translationValidationFns) {
        const errMsg = fn(data);
        if (errMsg) {
          throw new Error(errMsg);
        }
      }

      // Check if translation for langCode exists
      const exists = await this.translationRepository.findOne({ where: { langCode: data.langCode } });
      if (exists) {
        exists.version++
        exists.data = data.data
        const result = await this.translationRepository.save(exists);
        this.logger.log(`Updated translation for language ${result.langCode} to version ${result.version}`);
        return res.status(201).end();
      }

      // Insert
      const entity = this.translationRepository.create(data);
      await this.translationRepository.save(entity);
      this.logger.log(`Imported translation for language ${data.langCode}`);
      return res.status(201).end();
    } catch (err: any) {
      throw new ToastException(err?.message || 'Unexpected import error', this);
    }
  }

}
