/** Created by Pawel Malek **/
import { Socket } from 'socket.io';
import { UserI } from '@shared/interfaces/UserI';

export interface AuthenticatedSocket extends Socket {
  user: UserI;
}
