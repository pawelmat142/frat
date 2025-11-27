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

    public async validateItemExistence(itemValue: string | null | undefined, code: string, groupCode?: string): Promise<void> {
        if (!itemValue) {
            return
        }
        const dictionary = await this.getDictionary(code, groupCode)
        const exists = !!dictionary.elements.find(el => el.code === itemValue)

        if (!exists) {
            this.logger.warn(`Item with value: ${itemValue} does not exist in dictionary: ${code} ${groupCode ? 'and group: ' + groupCode : ''}`);
        }
    }

    public async validateItemsExistence(itemValues: string[] | null | undefined, code: string, groupCode?: string): Promise<void> {
        if (!itemValues) {
            return
        }
        for (const itemValue of itemValues) {
            await this.validateItemExistence(itemValue, code, groupCode);
        }
    }
}