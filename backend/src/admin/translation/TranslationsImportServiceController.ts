/** Created by Pawel Malek **/
import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TranslationEntity } from './TranslationEntity';
import { ImportUtil } from 'global/utils/ImportUtil';

// TODO roles guardy
@Controller('api/import/translations')
export class TranslationsImportServiceController {

  constructor(
    @InjectRepository(TranslationEntity)
    private translationRepository: Repository<TranslationEntity>,
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

  // @Post('import')
  // async importDictionary(@Res() res: Response) {
  //   try {
  //     if (!res.req || !res.req.body) {
  //       return res.status(400).json({ message: 'No data provided' });
  //     }
  //     const data = res.req.body;
  //     // Basic validation
  //     if (!data.code || !Array.isArray(data.columns) || !Array.isArray(data.elements)) {
  //       return res.status(400).json({ message: 'Missing required dictionary fields' });
  //     }
  //     // Check if code exists
  //     const exists = await this.dictionaryRepository.findOne({ where: { code: data.code } });
  //     if (exists) {
  //       return res.status(409).json({ message: 'Dictionary with this code already exists' });
  //     }

  //     // validateCode for dictionary code
  //     const codeError = DictionaryValidators.validateCode(data.code);
  //     if (codeError) {
  //       return res.status(422).json({ message: codeError });
  //     }

  //     // Validate structure using DictionaryValidators (cast to DictionaryI)
  //     const validationFns = [
  //       DictionaryValidators.validateElementCodes,
  //       DictionaryValidators.validateColumnCodes,
  //       DictionaryValidators.validateGroupCodes,
  //       DictionaryValidators.validateColumnCodeDuplicates,
  //       DictionaryValidators.validateElementCodeDuplicates,
  //       DictionaryValidators.validateGroupCodeDuplicates,
  //       DictionaryValidators.validateRequiredColumnsInElements,
  //     ];
  //     for (const fn of validationFns) {
  //       const errMsg = fn(data);
  //       if (errMsg) {
  //         return res.status(422).json({ message: errMsg });
  //       }
  //     }

  //     // Insert
  //     const entity = this.dictionaryRepository.create(data);
  //     await this.dictionaryRepository.save(entity);
  //     return res.status(201).json({ message: 'Dictionary imported successfully' });
  //   } catch (err: any) {
  //     console.log(err);
  //     return res.status(500).json({ message: err?.message || 'Server error' });
  //   }
  // }

}
