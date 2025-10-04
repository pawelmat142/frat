/** Created by Pawel Malek **/
import {
  Controller,
  Get,
  Param,
  Res,
  Post,
  Logger,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { DictionaryEntity } from './model/DictionaryEntity';
import { Repository } from 'typeorm';
import { DictionaryValidators } from '@shared/utils/DictionaryValidators';
import { ImportUtil } from 'global/utils/ImportUtil';
import { ToastException } from 'global/exceptions/ToastException';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { PopupException } from 'global/exceptions/PopupException';
import { SWWException } from 'global/exceptions/SWWException';

// TODO roles guardy
@Controller('api/import/dictionaries')
@UseInterceptors(LogInterceptor)
export class DictionariesImportServiceController {

  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(DictionaryEntity)
    private dictionaryRepository: Repository<DictionaryEntity>,
  ) { }

  @Get('export/:code')
  async exportDictionary(@Param('code') code: string, @Res() res: Response) {
    const dictionary: DictionaryEntity = await this.dictionaryRepository.findOne({ where: { code } });
    if (!dictionary) {
      throw new ToastException(`Trying to export dictionary. Dictionary with code ${code} not found`, this);
    }
    delete dictionary.dictionaryId
    const json = JSON.stringify(dictionary, null, 2);
    ImportUtil.prepareExportResponse(res, `dictionary_${code}`);

    res.send(json);
  }

  @Post('import')
  async importDictionary(@Res() res: Response) {
    try {
      if (!res.req || !res.req.body) {
        throw new Error('No data provided');
      }
      const data = res.req.body;
      // Basic validation
      if (!data.code || !Array.isArray(data.columns) || !Array.isArray(data.elements)) {
        throw new Error('Missing required dictionary fields');
      }
      // Check if code exists
      const exists = await this.dictionaryRepository.findOne({ where: { code: data.code } });
      if (exists) {
        throw new Error('Dictionary with this code already exists');
      }

      // validateCode for dictionary code
      const codeError = DictionaryValidators.validateCode(data.code);
      if (codeError) {
        throw new Error(`Validation error: ${codeError}`);
      }

      // Validate structure using DictionaryValidators (cast to DictionaryI)
      const validationFns = [
        DictionaryValidators.validateElementCodes,
        DictionaryValidators.validateColumnCodes,
        DictionaryValidators.validateGroupCodes,
        DictionaryValidators.validateColumnCodeDuplicates,
        DictionaryValidators.validateElementCodeDuplicates,
        DictionaryValidators.validateGroupCodeDuplicates,
        DictionaryValidators.validateRequiredColumnsInElements,
      ];
      for (const fn of validationFns) {
        const errMsg = fn(data);
        if (errMsg) {
          throw new Error(`Validation error: ${errMsg}`);
        }
      }
      const entity = this.dictionaryRepository.create(data);
      await this.dictionaryRepository.save(entity);

      this.logger.log(`Dictionary ${data.code} imported successfully`);
      return res.status(201).end();

    } catch (err: any) {
      // TODO 
      // throw new ToastException(err?.message || 'Unexpected import error', this);
      // throw new PopupException(err?.message || 'Unexpected import error', this);
      throw new SWWException(err?.message || 'Unexpected import error', this);
    }
  }

}
