/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { AddNoteDto, AddUserListedItemDto, ListedItemNote, UserListedItem, UserListedItemReferenceTypes, UserListedItemType, UserListedItemTypes } from '@shared/interfaces/UserListedItem';
import { WorkersService } from 'employee/services/WorkerService';
import { ToastException } from 'global/exceptions/ToastException';
import { UserListedItemEntity } from '../model/UserListedItemEntity';
import { Repository } from 'typeorm/repository/Repository.js';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { OffersService } from 'offer/services/OffersService';
import { UserI } from '@shared/interfaces/UserI';

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
        const items = await (listedType
            ? this.repository.find({ where: { uid, listedType } })
            : this.repository.find({ where: { uid } }));

        const workerIds = items.filter(i => i.referenceType === UserListedItemReferenceTypes.WORKER).map(i => Number(i.reference));
        const offerIds = items.filter(i => i.referenceType === UserListedItemReferenceTypes.OFFER).map(i => Number(i.reference));

        const workersMap = new Map((await this.workersService.getWorkersByIds(workerIds)).map(w => [w.workerId, w]));
        const offersMap = new Map((await this.offersService.getOffersByIds(offerIds)).map(o => [o.offerId, o]));

        const result: UserListedItem[] = [];

        const itemsWithDataIds: number[] = [];

        items.forEach(item => {
            if (item.referenceType === UserListedItemReferenceTypes.WORKER) {
                const data = workersMap.get(Number(item.reference));
                if (data) {
                    item.data = data;
                    result.push(item);
                } else {
                    itemsWithDataIds.push(item.id);
                }
            }
            else if (item.referenceType === UserListedItemReferenceTypes.OFFER) {
                const data = offersMap.get(Number(item.reference));
                if (data) {
                    item.data = data;
                    result.push(item);
                } else {
                    itemsWithDataIds.push(item.id);
                }
            }
        });

        this.logger.log(`Listed items for user ${uid}, listedType: ${listedType}, result:`, result);

        await this.removeItemsWithMissingData(itemsWithDataIds);

        return result;
    }

    private removeItemsWithMissingData = async (ids: number[]): Promise<void> => {
        if (ids.length) {
            await this.repository.delete(ids);
            this.logger.warn(`Removed listed items with missing data, ids: ${ids.join(', ')}`);
        }
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

    public async addNote(user: UserI, dto: AddNoteDto): Promise<ListedItemNote> {
        const item = await this.repository.findOne({ where: { id: dto.listItemId, uid: user.uid } });
        if (!item) {
            throw new ToastException(`Listed item with ID ${dto.listItemId} not found for user ${user.uid}`, this);
        }

        const note: ListedItemNote = {
            id: this.newId(item.notes || []),
            note: dto.note,
            date: new Date()
        };
        const notes = item.notes || [];
        notes.push(note);
        item.notes = notes;

        await this.repository.save(item);
        this.logger.log(`User ${user.uid} added note to listed item ${item.id}: ${dto.note}`);
        return note;
    }

    public async removeNote(user: UserI, itemId: number, noteId: string): Promise<void> {
        const item = await this.repository.findOne({ where: { id: itemId, uid: user.uid } });
        if (!item) {
            throw new ToastException(`Listed item with ID ${itemId} not found for user ${user.uid}`, this);
        }
        const notes = item.notes || [];
        const noteIndex = notes.findIndex(n => n.id === noteId);
        if (noteIndex === -1) {
            throw new ToastException(`Note with ID ${noteId} not found for listed item ${itemId}`, this);
        }
        notes.splice(noteIndex, 1);
        item.notes = notes;
        await this.repository.save(item);
        this.logger.log(`User ${user.uid} removed note ${noteId} from listed item ${itemId}`);
    }

    public async updateNote(user: UserI, dto: AddNoteDto): Promise<ListedItemNote> {
        if (!dto.noteId) {
            throw new ToastException(`Note ID is required for updating a note`, this);
        }
        const item = await this.repository.findOne({ where: { id: dto.listItemId, uid: user.uid } });
        if (!item) {
            throw new ToastException(`Listed item with ID ${dto.listItemId} not found for user ${user.uid}`, this);
        }

        const notes = item.notes || [];
        const noteIndex = notes.findIndex(n => n.id === dto.noteId);
        if (noteIndex === -1) {
            throw new ToastException(`Note with ID ${dto.noteId} not found for listed item ${item.id}`, this);
        }

        notes[noteIndex] = { ...notes[noteIndex], note: dto.note, modifiedDate: new Date() };
        item.notes = notes;

        await this.repository.save(item);
        this.logger.log(`User ${user.uid} updated note ${dto.noteId} for listed item ${item.id}: ${dto.note}`);
        return notes[noteIndex];
    }


    private newId = (notes: ListedItemNote[]): string => {
        const existingIds = notes.map(n => Number(n.id)).filter(n => !isNaN(n));
        if (!existingIds.length) {
            return '1';
        }
        return `${Math.max(...existingIds) + 1}`;
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
