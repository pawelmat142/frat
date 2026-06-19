import { Injectable, Logger } from "@nestjs/common";
import { NotificationI, NotificationIcons, NotificationTypes } from "@shared/interfaces/NotificationI";
import { DateRange, WorkerI } from "@shared/interfaces/WorkerI";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { DateUtil } from "@shared/utils/DateUtil";
import { OfferI } from "@shared/interfaces/OfferI";

@Injectable()
export class ExpirationNotificationService {

    private readonly logger = new Logger(ExpirationNotificationService.name);

    public createExpirationNotificationsForOffers(offers: OfferI[]): NotificationI[] {
        const expiredOffers = this.findExpiredOffers(offers);
        const notifications: NotificationI[] = expiredOffers.map(offer => {
            const notification: NotificationI = {
                notificationId: this.generatePseudoNotificationId(),
                recipientUid: offer.uid,
                type: NotificationTypes.OFFER_EXPIRATION,
                targetId: offer.offerId,
                title: "notification.offerExpiredTitle",
                message: "notification.offerExpiredMessage",
                messageParams: {
                    date: DateUtil.toLocalDateString(offer.startDate)
                },
                icon: NotificationIcons.EXPIRATION,
                avatarRef: offer.avatarRef,
                createdAt: new Date(),
                readAt: null,
                requesterName: offer.displayName,
            };
            return notification;
        });
        return notifications;
    }

    public createExpirationNotificationForWorker(worker: WorkerI): NotificationI | null {
        const latestExpiredRange = this.findLatestExpiredDateRange(worker);
        if (!latestExpiredRange) {
            return null;
        }

        const notification: NotificationI = {
            notificationId: this.generatePseudoNotificationId(),
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
            requesterName: worker.displayName,
        };

        this.logger.log(`Generated expiration notification for worker ${worker.uid}: ${JSON.stringify(notification)}`);
        return notification;
    }

    private findExpiredOffers(offers: OfferI[]): OfferI[] {
        const now = new Date();
        return offers.filter(offer => DateUtil.isBefore(offer.startDate, now));
    }

    private generatePseudoNotificationId(): number {
        return -Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
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