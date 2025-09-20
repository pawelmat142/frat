import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DictionaryEntity } from "../model/DictionaryEntity";
import { DictionaryI, DictionaryListItem, DictionaryStatuses } from "@shared//DictionaryI";

@Injectable()
export class DictionariesRepo {

    constructor(
        @InjectRepository(DictionaryEntity)
        private dictionaryRepository: Repository<DictionaryEntity>,
    ) { }

    public async list(): Promise<DictionaryListItem[]> {
        const rows = await this.dictionaryRepository
            .createQueryBuilder("d")
            .select([
                "d.code AS code",
                "d.version AS version",
                "d.status AS status",
                "d.updatedAt AS updatedAt",
                "d.createdAt AS createdAt"
            ])
            // .where("d.status = :status", { status: DictionaryStatuses.ACTIVE })
            .getRawMany();

        return rows.map((r: any) => ({
            code: r.code,
            version: r.version,
            status: r.status,
            updatedAt: r.updatedAt instanceof Date ? r.updatedAt : new Date(r.updatedAt),
            createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt),
        }));
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