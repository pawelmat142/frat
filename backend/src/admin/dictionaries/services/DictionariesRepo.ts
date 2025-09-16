import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DictionaryEntity } from "../model/DictionaryEntity";
import { DictionaryI, DictionaryStatuses } from "@shared//DictionaryI";

@Injectable()
export class DictionariesRepo {

    constructor(
        @InjectRepository(DictionaryEntity)
        private dictionaryRepository: Repository<DictionaryEntity>,
    ) { }

    public async listCodes(): Promise<string[]> {
        const rows = await this.dictionaryRepository
            .createQueryBuilder("d")
            .select("DISTINCT d.code", "code")
            .where("d.status = :status", { status: DictionaryStatuses.ACTIVE })
            .getRawMany<{ code: string }>();

        return rows.map(r => r.code);
    }

    public findOne(code: string): Promise<DictionaryI | null> {
        return this.dictionaryRepository.findOne({
            where: { code },
        });
    }

    public async set(dto: DictionaryI): Promise<DictionaryEntity> {
        const existingDictionary = await this.dictionaryRepository.exists({
            where: { code: dto.code },
        });
        if (existingDictionary) {
            return this.update(dto)
        }
        return this.create(dto);
    }
    
    public async remove(code: string): Promise<void> {
        const dictionary = await this.findOne(code);
        if (!dictionary) {
            throw new NotFoundException(`Dictionary with code ${code} not found`)
        }
        await this.dictionaryRepository.remove(dictionary as DictionaryEntity);
    }

    private create(dto: DictionaryI): Promise<DictionaryEntity> {
        const dictionary = this.dictionaryRepository.create(dto);
        return this.dictionaryRepository.save(dictionary);
    }

    private async update(dto: DictionaryI): Promise<DictionaryEntity> {
        const dictionary = await this.findOne(dto.code)
        dictionary.description = dto.description;
        dictionary.elements = dto.elements;
        dictionary.columns = dto.columns;
        dictionary.groups = dto.groups;
        dictionary.status = dto.status;
        dictionary.version++;
        return this.dictionaryRepository.save(dictionary);
    }

}