/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as turf from '@turf/turf';
import { CountryFeature } from 'employee/model/interface';
import { DictionariesPublicService } from 'admin/dictionaries/services/DictionariesPublicService';

@Injectable()
export class GeoPointService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly dictionariesPublicService: DictionariesPublicService,
    ) { }

    public async getCountriesInRadius(lat: number, lng: number, radiusKm: number): Promise<string[]> {
        if (radiusKm <= 0) {
            return [];
        }
        const path = require('path');
        const countriesPath = path.resolve(__dirname, 'countries.geojson');
        const countries = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));
        const center = turf.point([lng, lat]);
        const buffer = turf.buffer(center, radiusKm, { units: 'kilometers' });
        const countriesInRadius: CountryFeature[] = countries.features.filter(country =>
            turf.booleanIntersects(buffer, country)
        );

        const countryCodes = this.extractCountryCodes(countriesInRadius);
        const languageCodes = await this.mapToLanguageCodes(countryCodes);
        this.logger.log(`Found country codes for position ${lat}, ${lng} and radius ${radiusKm}[km]: ${countryCodes.join(', ')}`);
        return languageCodes;
    }

    private async mapToLanguageCodes(countryCodes: string[]): Promise<string[]> {
        const dictionary = await this.dictionariesPublicService.getDictionary('LANGUAGES');

        const dictionaryMap: { [key: string]: string } = Object.fromEntries(
            dictionary.elements.map(element => {
                return [element.values['COUNTRY_CODE'], element.code]
            })
        );
        const languageCodes = countryCodes.map(code => dictionaryMap[code]).filter(Boolean);
        return languageCodes;
    }

    private extractCountryCodes(features: CountryFeature[]): string[] {
        return features.map(f => f.properties['ISO3166-1-Alpha-2'])
        .filter(Boolean).map(code => code.toLocaleLowerCase());
    }

}
