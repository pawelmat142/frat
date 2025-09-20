/** Created by Pawel Malek **/
import {
  Controller,
  Get,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import { DictionariesService } from './services/DictionariesService';
import { DictionaryI } from '@shared/DictionaryI';

// TODO roles guardy
@Controller('api/dictionaries')
export class DictionariesController {
  
  constructor(private readonly dictionariesService: DictionariesService) {}

  @Get('list-codes')
  listCodes(): Promise<string[]> {
    return this.dictionariesService.listCodes()
  }

  @Get(':code')
  findOne(@Param('code') code: string): Promise<DictionaryI> {
    return this.dictionariesService.get(code)
  }

  @Put()
  put(@Body() dictionaryDto: DictionaryI): Promise<DictionaryI> {
    return this.dictionariesService.put(dictionaryDto);
  }

  // TODO
  // @Get(':id/export')
  // exportDictionary(@Param('id', ParseIntPipe) id: number) {
  //   return this.dictionariesService.exportDictionary(id);
  // }

  // @Post('import')
  // importDictionary(@Body() importData: any) {
  //   return this.dictionariesService.importDictionary(importData);
  // }
}
