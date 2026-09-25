import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsLatitude, IsLongitude, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';
import { WorkerSearchSortOption, WorkerSearchSortOptions } from '@shared/interfaces/WorkerI';

const splitQueryArray = ({ value }: { value: unknown }): string[] | undefined => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string' && value.length > 0) return value.split(',').filter(Boolean);
  return undefined;
};

const parseQueryNumber = ({ value }: { value: unknown }): unknown => {
  if (value === undefined || value === null) return value;
  if (typeof value === 'string' && value.trim() === '') return Number.NaN;
  return Number(value);
};

export class WorkerSearchQueryDto {
  @IsOptional()
  @IsDateString({ strict: true })
  startDate?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  endDate?: string;

  @IsString()
  locationCountry: string;

  @IsOptional()
  @Transform(parseQueryNumber)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @Transform(parseQueryNumber)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsLongitude()
  lng?: number;

  @IsOptional()
  @Transform(parseQueryNumber)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive()
  @Max(10000)
  positionRadiusKm?: number;

  @IsOptional()
  @Transform(splitQueryArray)
  @IsArray()
  @IsString({ each: true })
  certificates?: string[];

  @IsOptional()
  @Transform(splitQueryArray)
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @Transform(splitQueryArray)
  @IsArray()
  @IsString({ each: true })
  communicationLanguages?: string[];

  @IsOptional()
  @IsIn(Object.values(WorkerSearchSortOptions))
  sortBy?: WorkerSearchSortOption;

  @IsOptional()
  @Transform(parseQueryNumber)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  skip?: number;

  @IsOptional()
  @Transform(parseQueryNumber)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(1)
  limit?: number;
}
