/** Created by Pawel Malek **/
import {
  Controller,
  Get,
  Param,
  Res,
  Post,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { DictionaryEntity } from './model/DictionaryEntity';
import { Repository } from 'typeorm';
import { DictionaryValidators } from '@shared/utils/DictionaryValidators';
import { ImportUtil } from 'global/utils/ImportUtil';
import { ToastException } from 'global/exceptions/ToastException';

// TODO roles guardy
@Controller('api/import/dictionaries')
export class DictionariesImportServiceController {

  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(DictionaryEntity)
    private dictionaryRepository: Repository<DictionaryEntity>,
  ) { }

  @Get('export/:code')
  async exportDictionary(@Param('code') code: string, @Res() res: Response) {
    this.logger.log(`[START] Export dictionary ${code}`);

    const dictionary: DictionaryEntity = await this.dictionaryRepository.findOne({ where: { code } });
    if (!dictionary) {
      throw new ToastException(`Trying to export dictionary. Dictionary with code ${code} not found`, this);
    }
    delete dictionary.dictionaryId
    const json = JSON.stringify(dictionary, null, 2);
    ImportUtil.prepareExportResponse(res, `dictionary_${code}`);

    res.send(json);
    this.logger.log(`[STOP] Export dictionary ${code}`);
  }

  @Post('import')
  async importDictionary(@Res() res: Response) {
    this.logger.log('[START] Import dictionary');
    try {
      if (!res.req || !res.req.body) {
        throw new ToastException('No data provided', this);
      }
      const data = res.req.body;
      // Basic validation
      if (!data.code || !Array.isArray(data.columns) || !Array.isArray(data.elements)) {
        throw new ToastException('Missing required dictionary fields', this);
      }
      // Check if code exists
      const exists = await this.dictionaryRepository.findOne({ where: { code: data.code } });
      if (exists) {
        throw new ToastException('Dictionary with this code already exists', this);
      }

      // validateCode for dictionary code
      const codeError = DictionaryValidators.validateCode(data.code);
      if (codeError) {
        throw new ToastException(`Validation error: ${codeError}`, this);
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
          throw new ToastException(`Validation error: ${errMsg}`, this);
        }
      }
      const entity = this.dictionaryRepository.create(data);
      await this.dictionaryRepository.save(entity);

      this.logger.log(`Dictionary ${data.code} imported successfully`);
      return res.status(201).end();

    } catch (err: any) {
      throw new ToastException(`Import error: ${err?.message || err}`, this);
      
    } finally {
      this.logger.log('[STOP] Import dictionary');
    }
  }

}
