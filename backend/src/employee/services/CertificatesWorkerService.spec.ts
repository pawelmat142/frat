import { CertificatesWorkerService } from './CertificatesWorkerService';
import { CertificatesRepo } from './CertificatesRepo';
import { WorkerFormDto } from '@shared/interfaces/WorkerI';
import { CertificateEntity } from 'employee/model/CertificateEntity';

describe('CertificatesWorkerService', () => {

    let service: CertificatesWorkerService;
    let repo: jest.Mocked<CertificatesRepo>;

    beforeEach(() => {
        repo = {
            findByUid: jest.fn(),
            create: jest.fn(),
            createBulk: jest.fn(),
            deleteByUid: jest.fn(),
            deleteByUidAndCodes: jest.fn(),
            upsert: jest.fn(),
        } as any;

        service = new CertificatesWorkerService(repo);
    });

    describe('syncCertificates', () => {

        const uid = 'user-123';

        it('should add new certificates with validity dates', async () => {
            repo.findByUid.mockResolvedValue([]);
            repo.create.mockResolvedValue({ certificateId: 1, uid, code: 'IRATA_L1', validityDate: '2027-01-01' } as CertificateEntity);

            const form = {
                certificates: ['IRATA_L1'],
                certificateDates: { 'IRATA_L1': '2027-01-01' },
            } as Partial<WorkerFormDto> as WorkerFormDto;

            const result = await service.syncCertificates(uid, form);

            expect(result).toBe(true);
            expect(repo.create).toHaveBeenCalledWith({ uid, code: 'IRATA_L1', validityDate: '2027-01-01' });
        });

        it('should remove certificates no longer in form', async () => {
            repo.findByUid.mockResolvedValue([
                { certificateId: 1, uid, code: 'IRATA_L1', validityDate: '2027-01-01' } as CertificateEntity,
                { certificateId: 2, uid, code: 'GWO_BST', validityDate: '2027-06-01' } as CertificateEntity,
            ]);

            const form = {
                certificates: ['IRATA_L1'],
                certificateDates: { 'IRATA_L1': '2027-01-01' },
            } as Partial<WorkerFormDto> as WorkerFormDto;

            const result = await service.syncCertificates(uid, form);

            expect(result).toBe(true);
            expect(repo.deleteByUidAndCodes).toHaveBeenCalledWith(uid, ['GWO_BST']);
        });

        it('should update certificate with changed validity date', async () => {
            repo.findByUid.mockResolvedValue([
                { certificateId: 1, uid, code: 'IRATA_L1', validityDate: '2027-01-01' } as CertificateEntity,
            ]);
            repo.upsert.mockResolvedValue({} as CertificateEntity);

            const form = {
                certificates: ['IRATA_L1'],
                certificateDates: { 'IRATA_L1': '2028-01-01' },
            } as Partial<WorkerFormDto> as WorkerFormDto;

            const result = await service.syncCertificates(uid, form);

            expect(result).toBe(true);
            expect(repo.upsert).toHaveBeenCalledWith(uid, 'IRATA_L1', '2028-01-01');
        });

        it('should return false when nothing changed', async () => {
            repo.findByUid.mockResolvedValue([
                { certificateId: 1, uid, code: 'IRATA_L1', validityDate: '2027-01-01' } as CertificateEntity,
            ]);

            const form = {
                certificates: ['IRATA_L1'],
                certificateDates: { 'IRATA_L1': '2027-01-01' },
            } as Partial<WorkerFormDto> as WorkerFormDto;

            const result = await service.syncCertificates(uid, form);

            expect(result).toBe(false);
            expect(repo.create).not.toHaveBeenCalled();
            expect(repo.deleteByUidAndCodes).not.toHaveBeenCalled();
            expect(repo.upsert).not.toHaveBeenCalled();
        });

        it('should handle empty certificates list — remove all existing', async () => {
            repo.findByUid.mockResolvedValue([
                { certificateId: 1, uid, code: 'IRATA_L1', validityDate: '2027-01-01' } as CertificateEntity,
            ]);

            const form = {
                certificates: [],
                certificateDates: {},
            } as Partial<WorkerFormDto> as WorkerFormDto;

            const result = await service.syncCertificates(uid, form);

            expect(result).toBe(true);
            expect(repo.deleteByUidAndCodes).toHaveBeenCalledWith(uid, ['IRATA_L1']);
        });

        it('should skip adding certificate without validity date', async () => {
            repo.findByUid.mockResolvedValue([]);

            const form = {
                certificates: ['IRATA_L1'],
                certificateDates: {},
            } as Partial<WorkerFormDto> as WorkerFormDto;

            const result = await service.syncCertificates(uid, form);

            expect(result).toBe(false);
            expect(repo.create).not.toHaveBeenCalled();
        });
    });

    describe('createCertificates', () => {

        const uid = 'user-123';

        it('should create certificates with validity dates', async () => {
            repo.createBulk.mockResolvedValue([
                { certificateId: 1, uid, code: 'IRATA_L1', validityDate: '2027-01-01' } as CertificateEntity,
            ]);

            const form = {
                certificates: ['IRATA_L1', 'GWO_BST'],
                certificateDates: { 'IRATA_L1': '2027-01-01' },
            } as Partial<WorkerFormDto> as WorkerFormDto;

            const result = await service.createCertificates(uid, form);

            expect(result).toHaveLength(1);
            expect(repo.createBulk).toHaveBeenCalledWith([
                { uid, code: 'IRATA_L1', validityDate: '2027-01-01' },
            ]);
        });

        it('should return empty array when no certificates have validity dates', async () => {
            const form = {
                certificates: ['IRATA_L1'],
                certificateDates: {},
            } as Partial<WorkerFormDto> as WorkerFormDto;

            const result = await service.createCertificates(uid, form);

            expect(result).toEqual([]);
            expect(repo.createBulk).not.toHaveBeenCalled();
        });

        it('should return empty array when certificates list is empty', async () => {
            const form = {
                certificates: [],
                certificateDates: {},
            } as Partial<WorkerFormDto> as WorkerFormDto;

            const result = await service.createCertificates(uid, form);

            expect(result).toEqual([]);
        });
    });

    describe('deleteAllCertificatesForWorker', () => {

        it('should call repo deleteByUid', async () => {
            await service.deleteAllCertificatesForWorker('user-123');
            expect(repo.deleteByUid).toHaveBeenCalledWith('user-123');
        });
    });
});
