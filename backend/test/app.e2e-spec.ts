import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest');
import { GlobalController } from 'global/GlobalController';
import { TranslationPublicService } from 'admin/translation/TranslationPublicService';
import { DictionariesPublicService } from 'admin/dictionaries/services/DictionariesPublicService';
import { Reflector } from '@nestjs/core';

const mockTranslation = {
  langCode: 'en',
  version: 1,
  data: { 'app.title': 'JobHigh', 'app.welcome': 'Welcome' },
};

const mockDictionary = {
  code: 'SKILLS',
  description: 'Skills dictionary',
  version: 1,
  status: 'ACTIVE',
  columns: [{ code: 'name', type: 'string', required: true, translatable: true }],
  elements: [
    { code: 'welding', description: 'Welding', active: true, values: { name: 'Welding' } },
    { code: 'rigging', description: 'Rigging', active: true, values: { name: 'Rigging' } },
  ],
  groups: [],
};

const mockDictionaryWithGroups = {
  ...mockDictionary,
  code: 'CERTIFICATES',
  description: 'Certificates dictionary',
  elements: [
    { code: 'IRATA_L1', description: 'IRATA Level 1', active: true, values: { name: 'IRATA L1' } },
  ],
  groups: [
    { code: 'IRATA', elementCodes: ['IRATA_L1'], active: true, description: 'IRATA certs' },
  ],
};

describe('GlobalController (e2e)', () => {
  let app: INestApplication;
  let translationService: { getTranslation: jest.Mock };
  let dictionariesService: { getDictionary: jest.Mock };

  beforeAll(async () => {
    translationService = {
      getTranslation: jest.fn(),
    };
    dictionariesService = {
      getDictionary: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [GlobalController],
      providers: [
        { provide: TranslationPublicService, useValue: translationService },
        { provide: DictionariesPublicService, useValue: dictionariesService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/get-translations/:langCode', () => {

    it('should return translation for valid langCode', async () => {
      translationService.getTranslation.mockResolvedValue(mockTranslation);

      const response = await request(app.getHttpServer())
        .get('/api/get-translations/en')
        .expect(200);

      expect(response.body).toEqual(mockTranslation);
      expect(translationService.getTranslation).toHaveBeenCalledWith('en');
    });

    it('should call service with the provided langCode', async () => {
      translationService.getTranslation.mockResolvedValue({ ...mockTranslation, langCode: 'pl' });

      await request(app.getHttpServer())
        .get('/api/get-translations/pl')
        .expect(200);

      expect(translationService.getTranslation).toHaveBeenCalledWith('pl');
    });

    it('should return 500 when service throws', async () => {
      translationService.getTranslation.mockRejectedValue(new Error('DB error'));

      await request(app.getHttpServer())
        .get('/api/get-translations/en')
        .expect(500);
    });
  });

  describe('GET /api/get-dictionary/:code', () => {

    it('should return dictionary for valid code', async () => {
      dictionariesService.getDictionary.mockResolvedValue(mockDictionary);

      const response = await request(app.getHttpServer())
        .get('/api/get-dictionary/SKILLS')
        .expect(200);

      expect(response.body).toEqual(mockDictionary);
      expect(dictionariesService.getDictionary).toHaveBeenCalledWith('SKILLS');
    });

    it('should call service with provided code', async () => {
      dictionariesService.getDictionary.mockResolvedValue(mockDictionary);

      await request(app.getHttpServer())
        .get('/api/get-dictionary/LANGUAGES')
        .expect(200);

      expect(dictionariesService.getDictionary).toHaveBeenCalledWith('LANGUAGES');
    });

    it('should return 500 when service throws', async () => {
      dictionariesService.getDictionary.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer())
        .get('/api/get-dictionary/INVALID')
        .expect(500);
    });
  });

  describe('GET /api/get-dictionary/:code/:groupCode', () => {

    it('should return dictionary filtered by group code', async () => {
      dictionariesService.getDictionary.mockResolvedValue(mockDictionaryWithGroups);

      const response = await request(app.getHttpServer())
        .get('/api/get-dictionary/CERTIFICATES/IRATA')
        .expect(200);

      expect(response.body).toEqual(mockDictionaryWithGroups);
      expect(dictionariesService.getDictionary).toHaveBeenCalledWith('CERTIFICATES', 'IRATA');
    });

    it('should pass both code and groupCode to service', async () => {
      dictionariesService.getDictionary.mockResolvedValue(mockDictionary);

      await request(app.getHttpServer())
        .get('/api/get-dictionary/SKILLS/ROPE_ACCESS')
        .expect(200);

      expect(dictionariesService.getDictionary).toHaveBeenCalledWith('SKILLS', 'ROPE_ACCESS');
    });

    it('should return 500 when service throws', async () => {
      dictionariesService.getDictionary.mockRejectedValue(new Error('Group not found'));

      await request(app.getHttpServer())
        .get('/api/get-dictionary/CERTIFICATES/INVALID')
        .expect(500);
    });
  });

  describe('404 for unknown routes', () => {

    it('should return 404 for non-existing endpoint', () => {
      return request(app.getHttpServer())
        .get('/api/non-existing-endpoint')
        .expect(404);
    });
  });
});
