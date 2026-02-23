import { DateUtil } from "@shared/utils/DateUtil";

export abstract class FrontDateUtil {


    public static displayShortDateOrDayOrTimeIfToday(t: (input: string) => string, date: Date): string {
        if (!date) {
            return ''
        }
        if (DateUtil.isToday(date)) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        if (DateUtil.isYesterday(date)) {
            return t('callendar.yesterday');
        }
        if (DateUtil.isTomorrow(date)) {
            return t('callendar.tomorrow');
        }
        return FrontDateUtil.prepareDisplayShortDate(t, date);
    }

    public static displayDateWithTime(t: (input: string) => string, date: Date | string): string {
        const d = date instanceof Date ? date : new Date(date);
        if (DateUtil.isToday(d)) {
            return `${t('callendar.today')} ${t('callendar.at')} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        if (DateUtil.isTomorrow(d)) {
            return `${t('callendar.tomorrow')} ${t('callendar.at')} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        if (DateUtil.isYesterday(d)) {
            return `${t('callendar.yesterday')} ${t('callendar.at')} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        return DateUtil.displayDateWithTime(d);
    }


    public static prepareDisplayShortDate = (t: any, date: Date): string => {
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // If the date is within the last 6 days, show day of week
        if (diffDays <= 6 && diffDays >= 0) {
            const dayOfWeek = date.getDay();
            return t(`callendar.dayOfWeekThreeLetter.${dayOfWeek}`);
        }

        // Otherwise, show day number + month short
        const dayOfMonth = date.getDate();
        const month = date.getMonth();
        return `${dayOfMonth} ${t(`callendar.monthShort.${month}`)}`;
    }

}