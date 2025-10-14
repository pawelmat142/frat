/** Created by Pawel Malek **/
import {
  Controller,
  Get,
  Param,
  Res,
  Post,
  Logger,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { DictionaryEntity } from './model/DictionaryEntity';
import { Repository } from 'typeorm';
import { DictionaryValidators } from '@shared/validators/DictionaryValidators';
import { ImportUtil } from 'global/utils/ImportUtil';
import { ToastException } from 'global/exceptions/ToastException';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { RolesGuard } from 'auth/guards/RolesGuard';
import { UserRoles } from '@shared/interfaces/UserI';
import { Roles } from 'auth/decorators/RolesDecorator';
import { JwtAuthGuard } from 'auth/guards/JwtAuthGuard';
import { DictionaryI } from '@shared/interfaces/DictionaryI';

@Controller('api/admin/import/dictionaries')
@UseInterceptors(LogInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
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
      const dictionary: DictionaryI = res.req.body;
      // Basic validation
      if (!dictionary.code || !Array.isArray(dictionary.columns) || !Array.isArray(dictionary.elements)) {
        throw new Error('Missing required dictionary fields');
      }
      // Check if code exists
      const exists = await this.dictionaryRepository.findOne({ where: { code: dictionary.code } });
      if (exists) {
        throw new Error('Dictionary with this code already exists');
      }

     DictionaryValidators.fullValidation(dictionary);

      const entity = this.dictionaryRepository.create(dictionary);
      await this.dictionaryRepository.save(entity);

      this.logger.log(`Dictionary ${dictionary.code} imported successfully`);
      return res.status(201).end();

    } catch (err: any) {
      throw new ToastException(err?.message || 'Unexpected import error', this);
    }
  }

}
