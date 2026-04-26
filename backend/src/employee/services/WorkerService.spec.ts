import { WorkersService } from './WorkerService';
import { WorkerRepo } from './WorkerRepo';
import { UserService } from 'user/services/UserService';
import { CertificatesWorkerService } from './CertificatesWorkerService';
import { CloudinaryService } from 'user/UserManagement/CloudinaryService';
import { EntityInteractionService } from 'entity-interaction/services/EntityInteractionService';
import { WorkerEntity } from 'employee/model/WorkerEntity';
import { ToastException } from 'global/exceptions/ToastException';
import { WorkerStatuses, WorkerAvailabilityOptions, WorkerLocationOptions, WorkerFormDto } from '@shared/interfaces/WorkerI';
import { UserI } from '@shared/interfaces/UserI';
import { ForbiddenException } from '@nestjs/common';

function mockWorkerEntity(overrides: Partial<WorkerEntity> = {}): WorkerEntity {
    return {
        workerId: 1,
        uid: 'user-123',
        status: WorkerStatuses.ACTIVE,
        displayName: 'Jan Kowalski',
        fullName: 'Jan Kowalski',
        phoneNumber: { prefix: '+48', number: '123456789' },
        email: 'jan@example.com',
        communicationLanguages: ['pl'],
        avatarRef: { publicId: 'av-1', url: 'https://example.com/av.jpg' },
        locationOption: WorkerLocationOptions.ALL_EUROPE,
        locationCountries: [],
        availabilityOption: WorkerAvailabilityOptions.ANYTIME,
        availabilityDateRanges: [],
        startDate: '2026-04-19',
        certificates: [],
        categories: [],
        likes: [],
        jobs: [],
        images: [],
        uniqueViewsCount: 0,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    } as WorkerEntity;
}

function mockUser(uid = 'user-123'): UserI {
    return { uid, email: 'jan@example.com', displayName: 'Jan' } as UserI;
}

function mockForm(overrides: Partial<WorkerFormDto> = {}): WorkerFormDto {
    return {
        fullName: 'Jan Kowalski',
        phoneNumber: { prefix: '+48', number: '123456789' },
        email: 'jan@example.com',
        communicationLanguages: ['pl'],
        avatarRef: { publicId: 'av-1', url: 'https://example.com/av.jpg' },
        locationOption: WorkerLocationOptions.ALL_EUROPE,
        availabilityOption: WorkerAvailabilityOptions.ANYTIME,
        certificates: [],
        certificateDates: {},
        availabilityDateRanges: [],
        ...overrides,
    } as WorkerFormDto;
}

describe('WorkersService', () => {

    let service: WorkersService;
    let workerRepo: jest.Mocked<WorkerRepo>;
    let userService: jest.Mocked<UserService>;
    let certificatesService: jest.Mocked<CertificatesWorkerService>;
    let cloudinaryService: jest.Mocked<CloudinaryService>;
    let entityInteractionService: jest.Mocked<EntityInteractionService>;

    beforeEach(() => {
        workerRepo = {
            findByUid: jest.fn(),
            findByDisplayName: jest.fn(),
            findAll: jest.fn(),
            getById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            activation: jest.fn(),
            incrementUniqueViewsCount: jest.fn(),
            initialLoad: jest.fn(),
            deleteAllProfiles: jest.fn(),
        } as any;

        userService = {
            updateAvatarIfChanges: jest.fn(),
            userDeletedEvent: { subscribe: jest.fn() },
        } as any;

        certificatesService = {
            createCertificates: jest.fn(),
            syncCertificates: jest.fn(),
            getCertificates: jest.fn(),
            deleteAllCertificatesForWorker: jest.fn(),
        } as any;

        cloudinaryService = {
            deleteImage: jest.fn(),
            deleteImagesWithTags: jest.fn(),
        } as any;

        entityInteractionService = {
            recordView: jest.fn(),
        } as any;

        service = new WorkersService(
            workerRepo,
            userService,
            certificatesService,
            cloudinaryService,
            entityInteractionService,
        );
    });

    describe('activation', () => {

        it('should toggle ACTIVE to INACTIVE', async () => {
            const worker = mockWorkerEntity({ status: WorkerStatuses.ACTIVE });
            workerRepo.findByUid.mockResolvedValue(worker);
            workerRepo.update.mockResolvedValue({ ...worker, status: WorkerStatuses.INACTIVE } as WorkerEntity);

            const result = await service.activation(mockUser());

            expect(workerRepo.update).toHaveBeenCalled();
            expect(result.status).toBe(WorkerStatuses.INACTIVE);
        });

        it('should toggle INACTIVE to ACTIVE', async () => {
            const worker = mockWorkerEntity({ status: WorkerStatuses.INACTIVE });
            workerRepo.findByUid.mockResolvedValue(worker);
            workerRepo.update.mockResolvedValue({ ...worker, status: WorkerStatuses.ACTIVE } as WorkerEntity);

            const result = await service.activation(mockUser());

            expect(result.status).toBe(WorkerStatuses.ACTIVE);
        });

        it('should throw when profile not found', async () => {
            workerRepo.findByUid.mockResolvedValue(null);

            await expect(service.activation(mockUser())).rejects.toThrow(ToastException);
        });

        it('should throw ForbiddenException when uid does not match', async () => {
            const worker = mockWorkerEntity({ uid: 'other-uid' });
            workerRepo.findByUid.mockResolvedValue(worker);

            await expect(service.activation(mockUser())).rejects.toThrow(ForbiddenException);
        });
    });

    describe('createWorker', () => {

        it('should create a new worker profile', async () => {
            workerRepo.findByUid.mockResolvedValue(null);
            workerRepo.create.mockResolvedValue(mockWorkerEntity());

            const result = await service.createWorker(mockUser(), mockForm());

            expect(workerRepo.create).toHaveBeenCalled();
            expect(userService.updateAvatarIfChanges).toHaveBeenCalled();
            expect(result.workerId).toBe(1);
        });

        it('should throw when profile already exists', async () => {
            workerRepo.findByUid.mockResolvedValue(mockWorkerEntity());

            await expect(service.createWorker(mockUser(), mockForm())).rejects.toThrow(ToastException);
        });

        it('should create certificates when certificateDates provided', async () => {
            workerRepo.findByUid.mockResolvedValue(null);
            workerRepo.create.mockResolvedValue(mockWorkerEntity());

            const form = mockForm({
                certificates: ['IRATA_L1'],
                certificateDates: { 'IRATA_L1': '2027-01-01' },
            });

            await service.createWorker(mockUser(), form);

            expect(certificatesService.createCertificates).toHaveBeenCalledWith('user-123', form);
        });

        it('should not create certificates when certificateDates is empty', async () => {
            workerRepo.findByUid.mockResolvedValue(null);
            workerRepo.create.mockResolvedValue(mockWorkerEntity());

            await service.createWorker(mockUser(), mockForm());

            expect(certificatesService.createCertificates).not.toHaveBeenCalled();
        });
    });

    describe('updateWorker', () => {

        it('should update existing worker profile', async () => {
            workerRepo.findByUid.mockResolvedValue(mockWorkerEntity());
            workerRepo.update.mockResolvedValue(mockWorkerEntity());
            certificatesService.syncCertificates.mockResolvedValue(false);

            const result = await service.updateWorker(mockUser(), mockForm());

            expect(workerRepo.update).toHaveBeenCalled();
            expect(result.workerId).toBe(1);
        });

        it('should throw when profile not found', async () => {
            workerRepo.findByUid.mockResolvedValue(null);

            await expect(service.updateWorker(mockUser(), mockForm())).rejects.toThrow(ToastException);
        });

        it('should pass certificatesChanged flag to repo update', async () => {
            workerRepo.findByUid.mockResolvedValue(mockWorkerEntity());
            workerRepo.update.mockResolvedValue(mockWorkerEntity());
            certificatesService.syncCertificates.mockResolvedValue(true);

            await service.updateWorker(mockUser(), mockForm());

            expect(workerRepo.update).toHaveBeenCalledWith(expect.anything(), true);
        });
    });

    describe('notifyWorkerView', () => {

        it('should skip self-views', async () => {
            const worker = mockWorkerEntity({ uid: 'user-123' });
            workerRepo.getById.mockResolvedValue(worker);

            await service.notifyWorkerView(1, mockUser('user-123'));

            expect(entityInteractionService.recordView).not.toHaveBeenCalled();
        });

        it('should increment view count for new unique view', async () => {
            const worker = mockWorkerEntity({ uid: 'owner-uid' });
            workerRepo.getById.mockResolvedValue(worker);
            entityInteractionService.recordView.mockResolvedValue(true);

            await service.notifyWorkerView(1, mockUser('viewer-uid'));

            expect(entityInteractionService.recordView).toHaveBeenCalled();
            expect(workerRepo.incrementUniqueViewsCount).toHaveBeenCalledWith(1);
        });

        it('should not increment for repeated view', async () => {
            const worker = mockWorkerEntity({ uid: 'owner-uid' });
            workerRepo.getById.mockResolvedValue(worker);
            entityInteractionService.recordView.mockResolvedValue(false);

            await service.notifyWorkerView(1, mockUser('viewer-uid'));

            expect(workerRepo.incrementUniqueViewsCount).not.toHaveBeenCalled();
        });

        it('should throw when worker not found', async () => {
            workerRepo.getById.mockResolvedValue(null);

            await expect(service.notifyWorkerView(999, mockUser())).rejects.toThrow(ToastException);
        });
    });

    describe('updateSkills', () => {

        it('should update skills on existing profile', async () => {
            const worker = mockWorkerEntity();
            workerRepo.findByUid.mockResolvedValue(worker);
            workerRepo.update.mockResolvedValue(worker);

            const skills = { providedInLanguage: 'en', items: [{ code: 'welding', name: 'Welding' }] };
            await service.updateSkills(mockUser(), skills);

            expect(worker.skills).toEqual(skills);
            expect(workerRepo.update).toHaveBeenCalled();
        });

        it('should throw when profile not found', async () => {
            workerRepo.findByUid.mockResolvedValue(null);

            await expect(service.updateSkills(mockUser(), { providedInLanguage: 'en', items: [] }))
                .rejects.toThrow(ToastException);
        });
    });

    describe('addImage / removeImage', () => {

        it('should add image to profile', async () => {
            const worker = mockWorkerEntity({ images: [] });
            workerRepo.findByUid.mockResolvedValue(worker);
            workerRepo.update.mockResolvedValue(worker);

            await service.addImage(mockUser(), { publicId: 'img-1', url: 'https://example.com/img.jpg' });

            expect(worker.images).toHaveLength(1);
            expect(worker.images[0].publicId).toBe('img-1');
        });

        it('should remove image from profile and delete from Cloudinary', async () => {
            const worker = mockWorkerEntity({
                images: [
                    { publicId: 'img-1', url: 'https://example.com/1.jpg' },
                    { publicId: 'img-2', url: 'https://example.com/2.jpg' },
                ],
            });
            workerRepo.findByUid.mockResolvedValue(worker);
            workerRepo.update.mockResolvedValue(worker);

            await service.removeImage(mockUser(), 'img-1');

            expect(cloudinaryService.deleteImage).toHaveBeenCalledWith('img-1');
            expect(worker.images).toHaveLength(1);
            expect(worker.images[0].publicId).toBe('img-2');
        });

        it('should throw when profile not found for addImage', async () => {
            workerRepo.findByUid.mockResolvedValue(null);

            await expect(service.addImage(mockUser(), { publicId: 'x', url: 'x' }))
                .rejects.toThrow(ToastException);
        });
    });

    describe('deleteProfileByUid', () => {

        it('should delete certificates, images and profile', async () => {
            const worker = mockWorkerEntity();
            workerRepo.findByUid.mockResolvedValue(worker);
            workerRepo.getById.mockResolvedValue(worker);

            await service.deleteProfileByUid(mockUser());

            expect(certificatesService.deleteAllCertificatesForWorker).toHaveBeenCalledWith('user-123');
            expect(cloudinaryService.deleteImagesWithTags).toHaveBeenCalled();
            expect(workerRepo.delete).toHaveBeenCalledWith(worker);
        });

        it('should throw when profile not found', async () => {
            workerRepo.findByUid.mockResolvedValue(null);

            await expect(service.deleteProfileByUid(mockUser())).rejects.toThrow(ToastException);
        });
    });
});
