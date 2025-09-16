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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictionariesService = void 0;
const common_1 = require("@nestjs/common");
const DictionariesRepo_1 = require("./DictionariesRepo");
let DictionariesService = class DictionariesService {
    constructor(repo) {
        this.repo = repo;
    }
    listCodes() {
        return this.repo.listCodes();
    }
    async get(code) {
        const dictionary = await this.repo.findOne(code);
        if (!dictionary) {
            throw new common_1.NotFoundException(`Dictionary ${code} not found`);
        }
        return dictionary;
    }
    put(dto) {
        return this.repo.set(dto);
    }
    async remove(code) {
        await this.repo.remove(code);
    }
};
exports.DictionariesService = DictionariesService;
exports.DictionariesService = DictionariesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [DictionariesRepo_1.DictionariesRepo])
], DictionariesService);
//# sourceMappingURL=DictionariesService.js.map