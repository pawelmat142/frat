import { Injectable, Logger } from "@nestjs/common";
import { DictionariesService } from "./DictionariesService";
import { DictionaryI } from "@shared/interfaces/DictionaryI";

@Injectable()
export class DictionariesPublicService {
    
  private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly dictionariesService: DictionariesService,
    ) { }

    public async getDictionary(code: string, groupCode?: string): Promise<DictionaryI> {
        if (groupCode) {
            return this.dictionariesService.getDictionaryGroup(code, groupCode);
        }
        return this.dictionariesService.get(code);
    }

}