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
        if (listedType) {
            return this.repository.find({ where: { uid, listedType } });
        }
        return this.repository.find({ where: { uid } });
    }

    public async addItem(uid: string, item: AddUserListedItemDto): Promise<UserListedItem> {
        let data: any;
        if (item.referenceType === UserListedItemReferenceTypes.WORKER) {
            const worker = await this.workersService.getWorkerById(Number(item.reference));
            if (!worker) {
                throw new ToastException(`Worker with ID ${item.reference} not found`, this);
            }
            data = worker
        }
        else if (item.referenceType === UserListedItemReferenceTypes.OFFER) {
            const offer = await this.offersService.getOfferById(Number(item.reference));
            if (!offer) {
                throw new ToastException(`Offer with ID ${item.reference} not found`, this);
            }
            data = offer;
        }
        else {
            throw new ToastException(`Unsupported reference type: ${item.referenceType}`, this);
        }

        const entity = this.repository.create({ uid, ...item, listedType: UserListedItemTypes.DEFAULT});
        const result = await this.repository.save(entity);
        this.logger.log(`User ${uid} listed item: ${item.reference}`);

        result.data = data;
        this.logger.log('result: ', result);    
        return result;
    }

    public async removeItem(uid: string, id: number): Promise<void> {
        await this.repository.delete({ uid, id });
        this.logger.log(`User ${uid} removed listed item: ${id}`);
    }
}
