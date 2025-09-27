/** Created by Pawel Malek **/
import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { DictionaryEntity } from './model/DictionaryEntity';
import { Repository } from 'typeorm';
import { DictionaryValidators } from '@shared/utils/DictionaryValidators';

// TODO roles guardy
@Controller('api/dictionaries')
export class DictionariesImportServiceController {

  constructor(
    @InjectRepository(DictionaryEntity)
    private dictionaryRepository: Repository<DictionaryEntity>,
  ) { }

  @Get('export/:code')
  async exportDictionary(@Param('code') code: string, @Res() res: Response) {
    const dictionary = await this.dictionaryRepository.findOne({ where: { code } });
    if (!dictionary) {
      throw new NotFoundException('Dictionary not found');
    }
    const json = JSON.stringify(dictionary, null, 2);
    res.setHeader('Content-Type', 'application/json');
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    res.setHeader('Content-Disposition', `attachment; filename="dictionary_${code}_${dateStr}.json"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.send(json);
  }

  @Post('import')
  async importDictionary(@Res() res: Response) {
    try {
      if (!res.req || !res.req.body) {
        return res.status(400).json({ message: 'No data provided' });
      }
      const data = res.req.body;
      // Basic validation
      if (!data.code || !Array.isArray(data.columns) || !Array.isArray(data.elements)) {
        return res.status(400).json({ message: 'Missing required dictionary fields' });
      }
      // Check if code exists
      const exists = await this.dictionaryRepository.findOne({ where: { code: data.code } });
      if (exists) {
        return res.status(409).json({ message: 'Dictionary with this code already exists' });
      }

      // validateCode for dictionary code
      const codeError = DictionaryValidators.validateCode(data.code);
      if (codeError) {
        return res.status(422).json({ message: codeError });
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
          return res.status(422).json({ message: errMsg });
        }
      }

      // Insert
      const entity = this.dictionaryRepository.create(data);
      await this.dictionaryRepository.save(entity);
      return res.status(201).json({ message: 'Dictionary imported successfully' });
    } catch (err: any) {
      console.log(err);
      return res.status(500).json({ message: err?.message || 'Server error' });
    }
  }

}
