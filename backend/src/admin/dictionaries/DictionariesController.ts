/** Created by Pawel Malek **/
import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { DictionariesService } from './services/DictionariesService';
import { DictionaryI, DictionaryListItem } from '@shared/DictionaryI';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';

// TODO roles guardy
@Controller('api/admin/dictionaries')
@UseInterceptors(LogInterceptor)
export class DictionariesController {

  constructor(private readonly dictionariesService: DictionariesService) { }

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

  @Get(':code/:groupCode')
  getDictionaryGroup(
    @Param('code') code: string,
    @Param('groupCode') groupCode: string
  ): Promise<DictionaryI | null> {
    return this.dictionariesService.getDictionaryGroup(code, groupCode);
  }

}
