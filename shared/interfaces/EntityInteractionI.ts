/** Created by Pawel Malek **/

export const EntityInteractionEntityTypes = {
  WORKER: 'WORKER',
  OFFER: 'OFFER',
} as const;
export type EntityInteractionEntityType = typeof EntityInteractionEntityTypes[keyof typeof EntityInteractionEntityTypes];

export const EntityInteractionEventTypes = {
  VIEW: 'VIEW',
} as const;
export type EntityInteractionEventType = typeof EntityInteractionEventTypes[keyof typeof EntityInteractionEventTypes];

export interface EntityInteractionI {
  id: number;
  entityType: EntityInteractionEntityType;
  entityId: number;
  eventType: EntityInteractionEventType;
  userUid: string;
  date: Date;
}

/** Sliding window in days for view deduplication per user */
export const VIEW_DEDUP_WINDOW_DAYS = 7;
