import { Injectable, Logger } from "@nestjs/common";
import { TranslationI } from "@shared/interfaces/TranslationI";
import { TranslationService } from "./TranslationService";

@Injectable()
export class TranslationPublicService {
    
  private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly translationService: TranslationService,
    ) { }

    public async getTranslation(langCode: string): Promise<TranslationI> {
        return this.translationService.getSupportedTranslation(langCode);
    }

}