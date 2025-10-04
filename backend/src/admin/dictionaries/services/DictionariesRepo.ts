import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DictionaryEntity } from "../model/DictionaryEntity";
import { ToastException } from "global/exceptions/ToastException";
import { DictionaryListItem, DictionaryI } from "@shared/interfaces/DictionaryI";

@Injectable()
export class DictionariesRepo {

    private readonly logger = new Logger(this.constructor.name);

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
            throw new ToastException(`Trying to delete dictionary. Dictionary with code ${code} not found`, this);
        }
        await this.dictionaryRepository.remove(dictionary as DictionaryEntity);
        this.logger.log(`Deleted dictionary with code ${code}`);
    }

    private async create(dto: DictionaryI): Promise<DictionaryEntity> {
        const dictionary = this.dictionaryRepository.create(dto);
        const result = await this.dictionaryRepository.save(dictionary);
        this.logger.log(`Created new dictionary with code ${dto.code}`);
        return result;
    }

    private async update(dto: DictionaryI): Promise<DictionaryEntity> {
        const dictionary = await this.findOne(dto.code)
        dictionary.description = dto.description;
        dictionary.elements = dto.elements;
        dictionary.columns = dto.columns;
        dictionary.groups = dto.groups;
        dictionary.status = dto.status;
        dictionary.version++;
        const result = await this.dictionaryRepository.save(dictionary);
        this.logger.log(`Updated dictionary with code ${dto.code}`);
        return result;
    }

    /**
     * Pobiera słownik z jedną grupą (po kodzie) i tylko elementami należącymi do tej grupy.
     * Zwraca null jeśli nie istnieje.
     */
    public async getDictionaryGroup(dictionaryCode: string, groupCode: string): Promise<DictionaryI | null> {
        const result = await this.dictionaryRepository.query(
            `
            SELECT
                code,
                description,
                version,
                status,
                columns,
                (
                    SELECT jsonb_agg(e)
                    FROM jsonb_array_elements(elements) AS e
                    WHERE (e->>'code') IN (
                        SELECT jsonb_array_elements_text(g->'elementCodes')
                        FROM jsonb_array_elements(groups) AS g
                        WHERE g->>'code' = $2
                    )
                ) AS elements,
                (
                    SELECT jsonb_agg(g)
                    FROM jsonb_array_elements(groups) AS g
                    WHERE g->>'code' = $2
                ) AS groups
            FROM jh_dictionaries
            WHERE code = $1
            `,
            [dictionaryCode, groupCode]
        );

        if (!result[0]) {
            return null
        };
        // Upewnij się, że typy są zgodne z DictionaryI
        return {
            code: result[0].code,
            description: result[0].description,
            version: result[0].version,
            status: result[0].status,
            columns: result[0].columns,
            elements: result[0].elements || [],
            groups: result[0].groups || [],
        };
    }

}