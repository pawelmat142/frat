import { UserListedItemReferenceType, UserListedItemReferenceTypes } from '@shared/interfaces/UserListedItem';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class AddUserListedItemRequest {

    @IsString()
    @IsNotEmpty()
    reference: string;

    @IsIn(Object.values(UserListedItemReferenceTypes))
    referenceType: UserListedItemReferenceType;
}
