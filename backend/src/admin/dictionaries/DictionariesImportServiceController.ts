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
import { DictionaryEntity } from './model/DictionaryEntity';
import { Repository } from 'typeorm';

// TODO roles guardy
@Controller('api/dictionaries')
export class DictionariesImportServiceController {

  constructor(
    @InjectRepository(DictionaryEntity)
    private dictionaryRepository: Repository<DictionaryEntity>,
  ) { }

  @Get('export/:code')
  async exportDictionary(@Param('code') code: string, @Res() res: Response) {
    console.log('xxx')
    const dictionary = await this.dictionaryRepository.findOne({ where: { code } });
    if (!dictionary) {
      throw new NotFoundException('Dictionary not found');
    }
    const json = JSON.stringify(dictionary, null, 2);
    res.setHeader('Content-Type', 'application/json');
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}}`;
    res.setHeader('Content-Disposition', `attachment; filename="dictionary_${code}_${dateStr}.json"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.send(json);
  }

}
