"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictionariesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const DictionariesController_1 = require("./DictionariesController");
const DictionariesService_1 = require("./services/DictionariesService");
const DictionariesRepo_1 = require("./services/DictionariesRepo");
const DictionaryEntity_1 = require("./model/DictionaryEntity");
let DictionariesModule = class DictionariesModule {
};
exports.DictionariesModule = DictionariesModule;
exports.DictionariesModule = DictionariesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                DictionaryEntity_1.DictionaryEntity,
            ]),
        ],
        controllers: [DictionariesController_1.DictionariesController],
        providers: [DictionariesService_1.DictionariesService, DictionariesRepo_1.DictionariesRepo],
        exports: [],
    })
], DictionariesModule);
//# sourceMappingURL=DictionariesModule.js.map