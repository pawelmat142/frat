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
import { DictionaryElementWithGroups,  DictionaryI, DictionaryListItem } from '@shared/interfaces/DictionaryI';
import { RolesGuard } from 'auth/guards/RolesGuard';
import { UserRoles } from '@shared/interfaces/UserI';
import { Roles } from 'auth/decorators/RolesDecorator';
import { JwtAuthGuard } from 'auth/guards/JwtAuthGuard';
import { Serialize } from 'global/decorators/Serialize';
import { DictionaryEntity } from './model/DictionaryEntity';

@Controller('api/admin/dictionaries')
@UseInterceptors(LogInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
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
    console.log(`put`);
    return this.dictionariesService.put(dictionaryDto);
  }

  @Delete(':code')
  @Roles(UserRoles.SUPERADMIN)
  delete(@Param('code') code: string): Promise<void> {
    console.log(`delete`);
    return this.dictionariesService.delete(code);
  }
  
  @Delete(':code/:elementCode')
  deleteElement(
    @Param('code') code: string,
    @Param('elementCode') elementCode: string
  ): Promise<DictionaryI> {
    console.log(`deleteElement`);
    return this.dictionariesService.deleteElement(code, elementCode);
  }
  
  @Get(':code/:groupCode')
  @Serialize(DictionaryEntity)
  getDictionaryGroup(
    @Param('code') code: string,
    @Param('groupCode') groupCode: string
  ): Promise<DictionaryI | null> {
    console.log(`getDictionaryGroup`);
    return this.dictionariesService.getDictionaryGroup(code, groupCode);
  }

  @Put(':dictionaryCode')
  putElement(
    @Param('dictionaryCode') dictionaryCode: string,
    @Body() element: DictionaryElementWithGroups
  ) {
    console.log(`putElement`);
    return this.dictionariesService.putElement(element, dictionaryCode)
  }

}
