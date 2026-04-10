/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import {
  EntityInteractionEntityType,
  EntityInteractionEventTypes,
  VIEW_DEDUP_WINDOW_DAYS,
} from '@shared/interfaces/EntityInteractionI';
import { EntityInteractionRepo } from './EntityInteractionRepo';

@Injectable()
export class EntityInteractionService {

  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly repo: EntityInteractionRepo) {}

  /**
   * Always records the VIEW event in the log.
   * Returns true only if there was no previous view from this user within the sliding window —
   * the caller should increment the unique counter only when true.
   */
  public async recordView(
    entityType: EntityInteractionEntityType,
    entityId: number,
    userUid: string,
  ): Promise<boolean> {
    const recent = await this.repo.findRecentInteraction(
      entityType,
      entityId,
      userUid,
      EntityInteractionEventTypes.VIEW,
      VIEW_DEDUP_WINDOW_DAYS,
    );

    await this.repo.save({
      entityType,
      entityId,
      eventType: EntityInteractionEventTypes.VIEW,
      userUid,
    });

    if (recent) {
      this.logger.log(`Recorded view (not counted): ${userUid} → ${entityType}#${entityId} — duplicate within ${VIEW_DEDUP_WINDOW_DAYS}d window`);
      return false;
    }

    this.logger.log(`Recorded view (counted): ${userUid} → ${entityType}#${entityId}`);
    return true;
  }
}
