import { WorkerI } from "@shared/interfaces/WorkerI";

export interface MeUserContextNotificationsRequest {
  recipientUid: string,
  limit?: number,
  offset?: number
  worker?: WorkerI
}