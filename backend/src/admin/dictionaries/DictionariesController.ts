/** Created by Pawel Malek **/
import {
  Controller,
  Get,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import { DictionariesService } from './services/DictionariesService';
import { DictionaryI, DictionaryListItem } from '@shared/DictionaryI';

// TODO roles guardy
@Controller('api/dictionaries')
export class DictionariesController {
  
  constructor(private readonly dictionariesService: DictionariesService) {}

  @Get('list')
  list(): Promise<DictionaryListItem[]> {
    return this.dictionariesService.list();
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
