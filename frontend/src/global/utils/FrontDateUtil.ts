import { DateUtil } from "@shared/utils/DateUtil";

export abstract class FrontDateUtil {
    
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
    
}