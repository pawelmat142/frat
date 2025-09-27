/** Created by Pawel Malek **/
import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Delete,
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

  @Delete(':code')
  delete(@Param('code') code: string): Promise<void> {
    return this.dictionariesService.delete(code);
  }
}
