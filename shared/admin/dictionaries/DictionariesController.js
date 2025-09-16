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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictionariesController = void 0;
const common_1 = require("@nestjs/common");
const DictionariesService_1 = require("./services/DictionariesService");
const DictionaryI_1 = require("@shared/DictionaryI");
let DictionariesController = class DictionariesController {
    constructor(dictionariesService) {
        this.dictionariesService = dictionariesService;
    }
    listCodes() {
        return this.dictionariesService.listCodes();
    }
    findOne(code) {
        return this.dictionariesService.get(code);
    }
    put(updateDictionaryDto) {
        return this.dictionariesService.put(updateDictionaryDto);
    }
};
exports.DictionariesController = DictionariesController;
__decorate([
    (0, common_1.Get)('list-codes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DictionariesController.prototype, "listCodes", null);
__decorate([
    (0, common_1.Get)(':code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DictionariesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof DictionaryI_1.DictionaryI !== "undefined" && DictionaryI_1.DictionaryI) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], DictionariesController.prototype, "put", null);
exports.DictionariesController = DictionariesController = __decorate([
    (0, common_1.Controller)('api/dictionaries'),
    __metadata("design:paramtypes", [DictionariesService_1.DictionariesService])
], DictionariesController);
//# sourceMappingURL=DictionariesController.js.map