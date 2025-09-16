"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictionariesRepo = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const DictionaryEntity_1 = require("../model/DictionaryEntity");
const DictionaryI_1 = require("@shared//DictionaryI");
let DictionariesRepo = class DictionariesRepo {
    constructor(dictionaryRepository) {
        this.dictionaryRepository = dictionaryRepository;
    }
    async listCodes() {
        const rows = await this.dictionaryRepository
            .createQueryBuilder("d")
            .select("DISTINCT d.code", "code")
            .where("d.status = :status", { status: DictionaryI_1.DictionaryStatuses.ACTIVE })
            .getRawMany();
        return rows.map(r => r.code);
    }
    findOne(code) {
        return this.dictionaryRepository.findOne({
            where: { code },
        });
    }
    async set(dto) {
        const existingDictionary = await this.dictionaryRepository.exists({
            where: { code: dto.code },
        });
        if (existingDictionary) {
            return this.update(dto);
        }
        return this.create(dto);
    }
    async remove(code) {
        const dictionary = await this.findOne(code);
        if (!dictionary) {
            throw new common_1.NotFoundException(`Dictionary with code ${code} not found`);
        }
        await this.dictionaryRepository.remove(dictionary);
    }
    create(dto) {
        const dictionary = this.dictionaryRepository.create(dto);
        return this.dictionaryRepository.save(dictionary);
    }
    async update(dto) {
        const dictionary = await this.findOne(dto.code);
        dictionary.description = dto.description;
        dictionary.elements = dto.elements;
        dictionary.columns = dto.columns;
        dictionary.groups = dto.groups;
        dictionary.status = dto.status;
        dictionary.version++;
        return this.dictionaryRepository.save(dictionary);
    }
};
exports.DictionariesRepo = DictionariesRepo;
exports.DictionariesRepo = DictionariesRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(DictionaryEntity_1.DictionaryEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DictionariesRepo);
//# sourceMappingURL=DictionariesRepo.js.map