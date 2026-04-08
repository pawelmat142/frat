import { UserListedItemReferenceType, UserListedItemReferenceTypes, UserListedItemType, UserListedItemTypes } from '@shared/interfaces/UserListedItem';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class AddUserListedItemRequest {

    @IsString()
    @IsNotEmpty()
    reference: string;

    @IsIn(Object.values(UserListedItemReferenceTypes))
    referenceType: UserListedItemReferenceType;

    @IsIn(Object.values(UserListedItemTypes))
    listedType: UserListedItemType;
}
