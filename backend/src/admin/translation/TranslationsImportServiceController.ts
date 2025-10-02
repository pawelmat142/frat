/** Created by Pawel Malek **/
import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TranslationEntity } from './TranslationEntity';
import { ImportUtil } from 'global/utils/ImportUtil';
import { TranslationValidators } from '@shared/utils/TranslationValidators';
import { TranslationService } from './TranslationService';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';

// TODO roles guardy
@Controller('api/import/translations')
@UseInterceptors(LogInterceptor)
export class TranslationsImportServiceController {

  constructor(
    @InjectRepository(TranslationEntity)
    private translationRepository: Repository<TranslationEntity>,
    private readonly translationService: TranslationService
  ) { }

  @Get('export/:langCode')
  async exportDictionary(@Param('langCode') langCode: string, @Res() res: Response) {
    const translation: TranslationEntity = await this.translationRepository.findOne({ where: { langCode } });
    if (!translation) {
      throw new NotFoundException('TranslationI not found');
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
        return res.status(400).json({ message: 'No data provided' });
      }
      const data = res.req.body;

      if (!(await this.translationService.isSupportedTranslationLang(data.langCode))) {
        return res.status(422).json({ message: `Language code '${data.langCode}' is not supported.` });
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
          return res.status(422).json({ message: errMsg });
        }
      }

      // Check if translation for langCode exists
      const exists = await this.translationRepository.findOne({ where: { langCode: data.langCode } });
      if (exists) {
        exists.version++
        exists.data = data.data
        await this.translationRepository.save(exists);
        return res.status(201).json({ message: 'Translation imported successfully - update' });
      }

      // Insert
      const entity = this.translationRepository.create(data);
      await this.translationRepository.save(entity);
      return res.status(201).json({ message: 'Translation imported successfully - create' });
    } catch (err: any) {
      // TODO logi, error handling
      return res.status(500).json({ message: err?.message || 'Unexpected import Translation error' });
    }
  }

}
