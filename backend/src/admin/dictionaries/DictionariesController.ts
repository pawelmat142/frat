/** Created by Pawel Malek **/
import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { DictionariesService } from './services/DictionariesService';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { DictionaryElement,  DictionaryI, DictionaryListItem } from '@shared/interfaces/DictionaryI';
import { RolesGuard } from 'auth/guards/RolesGuard';
import { UserRoles } from '@shared/interfaces/UserI';
import { Roles } from 'auth/decorators/RolesDecorator';
import { JwtAuthGuard } from 'auth/guards/JwtAuthGuard';
import { Serialize } from 'global/decorators/Serialize';
import { DictionaryEntity } from './model/DictionaryEntity';

@Controller('api/admin/dictionaries')
@UseInterceptors(LogInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.SUPERADMIN)
export class DictionariesController {

  constructor(private readonly dictionariesService: DictionariesService) { }

  @Get('list')
  list(): Promise<DictionaryListItem[]> {
    return this.dictionariesService.list();
  }

  @Get(':code')
  @Serialize(DictionaryEntity)
  get(@Param('code') code: string): Promise<DictionaryI> {
    return this.dictionariesService.get(code)
  }

  @Put()
  @Serialize(DictionaryEntity)
  put(
    @Body() dictionaryDto: DictionaryI
  ): Promise<DictionaryI> {
    return this.dictionariesService.put(dictionaryDto);
  }

  @Delete(':code')
  delete(@Param('code') code: string): Promise<void> {
    return this.dictionariesService.delete(code);
  }

  @Get(':code/:groupCode')
  @Serialize(DictionaryEntity)
  getDictionaryGroup(
    @Param('code') code: string,
    @Param('groupCode') groupCode: string
  ): Promise<DictionaryI | null> {
    return this.dictionariesService.getDictionaryGroup(code, groupCode);
  }

  @Put(':dictionaryCode')
  putElement(
    @Param('dictionaryCode') dictionaryCode: string,
    @Body() element: DictionaryElement
  ) {
    return this.dictionariesService.putElement(element, dictionaryCode)
  }

}
