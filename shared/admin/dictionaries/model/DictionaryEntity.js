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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictionaryEntity = void 0;
const DictionaryI_1 = require("@shared/DictionaryI");
const typeorm_1 = require("typeorm");
let DictionaryEntity = class DictionaryEntity {
};
exports.DictionaryEntity = DictionaryEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'dictionary_id' }),
    __metadata("design:type", Number)
], DictionaryEntity.prototype, "dictionaryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'code', unique: true }),
    __metadata("design:type", String)
], DictionaryEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', nullable: true }),
    __metadata("design:type", String)
], DictionaryEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'version', default: 1 }),
    __metadata("design:type", Number)
], DictionaryEntity.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'varchar',
        default: DictionaryI_1.DictionaryStatuses.ACTIVE,
    }),
    __metadata("design:type", typeof (_a = typeof DictionaryI_1.DictionaryStatus !== "undefined" && DictionaryI_1.DictionaryStatus) === "function" ? _a : Object)
], DictionaryEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'elements', type: 'jsonb' }),
    __metadata("design:type", Array)
], DictionaryEntity.prototype, "elements", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'columns', type: 'jsonb' }),
    __metadata("design:type", Array)
], DictionaryEntity.prototype, "columns", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'groups', type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], DictionaryEntity.prototype, "groups", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DictionaryEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], DictionaryEntity.prototype, "updatedAt", void 0);
exports.DictionaryEntity = DictionaryEntity = __decorate([
    (0, typeorm_1.Entity)('jh_dictionaries')
], DictionaryEntity);
//# sourceMappingURL=DictionaryEntity.js.map