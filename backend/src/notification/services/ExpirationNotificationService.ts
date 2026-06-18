import { Injectable, Logger } from "@nestjs/common";
import { randomInt } from "crypto";
import { NotificationI, NotificationIcons, NotificationTypes } from "@shared/interfaces/NotificationI";
import { DateRange, WorkerI } from "@shared/interfaces/WorkerI";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { DateUtil } from "@shared/utils/DateUtil";

@Injectable()
export class ExpirationNotificationService {

    private readonly logger = new Logger(ExpirationNotificationService.name);

    public createExpirationNotificationForWorker(worker: WorkerI): NotificationI | null {
        const latestExpiredRange = this.findLatestExpiredDateRange(worker);
        if (!latestExpiredRange) {
            return null;
        }

        const notification: NotificationI = {
            notificationId: -randomInt(1, 2147483647), // Negative ID for ephemeral notifications (generated on-the-fly, not persisted)
            recipientUid: worker.uid,
            type: NotificationTypes.WORKER_PROFILE_AVAILABILITY_EXPIRED,
            targetId: worker.workerId.toString(),

            title: "notification.workerExpiredTitle",
            message: "notification.workerExpiredMessage",
            messageParams: {
                date: latestExpiredRange.end
            },
            icon: NotificationIcons.EXPIRATION,
            avatarRef: worker.avatarRef,
            createdAt: new Date(),
            readAt: null,
        };

        this.logger.log(`Generated expiration notification for worker ${worker.uid}: ${JSON.stringify(notification)}`);
        return notification;
    }


    private findLatestExpiredDateRange(worker: WorkerI): DateRange | null {
        const expiredDateRanges = this.findExpiredDateRanges(worker);
        if (expiredDateRanges.length === 0) {
            return null;
        }
        let latestExpiredRange = expiredDateRanges[0];
        for (const range of expiredDateRanges) {
            if (range.end && latestExpiredRange.end && range.end > latestExpiredRange.end) {
                latestExpiredRange = range;
            }
        }
        return latestExpiredRange;
    }

    private findExpiredDateRanges(worker: WorkerI): DateRange[] {
        return worker.availabilityDateRanges?.map(dateRange => DateRangeUtil.toDateRange(dateRange))
        .filter(dateRange => DateRangeUtil.isDateRangeExpired(dateRange))
    }

}