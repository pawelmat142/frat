/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { AddUserListedItemDto, UserListedItem, UserListedItemReferenceTypes, UserListedItemType, UserListedItemTypes } from '@shared/interfaces/UserListedItem';
import { WorkersService } from 'employee/services/WorkerService';
import { ToastException } from 'global/exceptions/ToastException';
import { UserListedItemEntity } from '../model/UserListedItemEntity';
import { Repository } from 'typeorm/repository/Repository.js';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { OffersService } from 'offer/services/OffersService';

@Injectable()
export class UserListedItemService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectRepository(UserListedItemEntity)
        private readonly repository: Repository<UserListedItemEntity>,
        private readonly workersService: WorkersService,
        private readonly offersService: OffersService,
    ) { }

    public async listUserItems(uid: string, listedType?: UserListedItemType): Promise<UserListedItem[]> {
        const result = await (listedType
            ? this.repository.find({ where: { uid, listedType } })
            : this.repository.find({ where: { uid } }));

        const workerIds = result.filter(i => i.referenceType === UserListedItemReferenceTypes.WORKER).map(i => Number(i.reference));
        const offerIds = result.filter(i => i.referenceType === UserListedItemReferenceTypes.OFFER).map(i => Number(i.reference));

        const workersMap = new Map((await this.workersService.getWorkersByIds(workerIds)).map(w => [w.workerId, w]));
        const offersMap = new Map((await this.offersService.getOffersByIds(offerIds)).map(o => [o.offerId, o]));
        result.forEach(item => {
            if (item.referenceType === UserListedItemReferenceTypes.WORKER) {
                item.data = workersMap.get(Number(item.reference));
            }
            else if (item.referenceType === UserListedItemReferenceTypes.OFFER) {
                item.data = offersMap.get(Number(item.reference));
            }
        });

        this.logger.log(`Listed items for user ${uid}, listedType: ${listedType}, result:`, result);

        return result;
    }

    public async addItem(uid: string, item: AddUserListedItemDto): Promise<UserListedItem> {
        let data: any;
        await this.validateExistingItem(uid, item);
        if (item.referenceType === UserListedItemReferenceTypes.WORKER) {
            const worker = await this.workersService.getWorkerById(Number(item.reference));
            if (!worker) {
                throw new ToastException(`Worker with ID ${item.reference} not found`, this);
            }
            if (worker.uid === uid) {
                throw new ToastException(`Cannot list own profile`, this);
            }
            data = worker
        }
        else if (item.referenceType === UserListedItemReferenceTypes.OFFER) {
            const offer = await this.offersService.getOfferById(Number(item.reference));
            if (!offer) {
                throw new ToastException(`Offer with ID ${item.reference} not found`, this);
            }
            if (offer.uid === uid) {
                throw new ToastException(`Cannot list own offer`, this);
            }
            data = offer;
        }
        else {
            throw new ToastException(`Unsupported reference type: ${item.referenceType}`, this);
        }

        const entity = this.repository.create({ uid, ...item });
        const result = await this.repository.save(entity);
        this.logger.log(`User ${uid} listed item: ${item.reference}`);

        result.data = data;
        this.logger.log('result: ', result);
        return result;
    }

    private async validateExistingItem(uid: string, item: AddUserListedItemDto): Promise<void> {
        const existing = await this.repository.findOne({
            where: { uid, reference: item.reference, referenceType: item.referenceType, listedType: item.listedType },
        });
        if (existing) {
            throw new ToastException(`Item already listed`, this);
        }
    }

    public async removeItem(uid: string, id: number): Promise<void> {
        await this.repository.delete({ uid, id });
        this.logger.log(`User ${uid} removed listed item: ${id}`);
    }
}
