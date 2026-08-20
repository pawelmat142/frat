import { DateUtil } from "@shared/utils/DateUtil";
import { FrontDateUtil } from "global/utils/FrontDateUtil";

interface Props {
    date?: Date;
    localDateString?: string | null;
    showYear?: boolean;
    showYearIfNotCurrent?: boolean;
    /** Show the full month name instead of its abbreviated version. */
    showFullMonthName?: boolean;
    showTimeIfToday?: boolean;
    todayAsTxt?: boolean;
    yesterdayAsTxt?: boolean;
    tomorrowAsTxt?: boolean;
    /** Show the full day name (e.g. "Monday") when the date is within the last 4 days.
     *  Falls back to "day + full month name" for older dates. */
    displayDayOfWeekIfClose?: boolean;
    /** Capitalize the first letter of the result. */
    capitalize?: boolean;
    t: any
}

const DateDisplay = (props: Props): string | null => {
    const {
        date, localDateString, showYear, showYearIfNotCurrent, showFullMonthName, t,
        todayAsTxt, yesterdayAsTxt, tomorrowAsTxt, displayDayOfWeekIfClose,
        capitalize,
    } = props;

    const currentYear = new Date().getFullYear();

    const applyCapitalize = (str: string): string =>
        capitalize ? str.charAt(0).toUpperCase() + str.slice(1) : str.toLocaleLowerCase();

    if (date) {
        const d = date instanceof Date ? date : new Date(date);
        const year = d.getFullYear();
        const displayYear = showYear || (showYearIfNotCurrent && year !== currentYear);

        if (todayAsTxt && DateUtil.isToday(d))
            return applyCapitalize(t('callendar.today'));

        if (yesterdayAsTxt && DateUtil.isYesterday(d))
            return applyCapitalize(t('callendar.yesterday'));

        if (tomorrowAsTxt && DateUtil.isTomorrow(d))
            return applyCapitalize(t('callendar.tomorrow'));

        if (displayDayOfWeekIfClose) {
            const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 5)
                return applyCapitalize(t(`callendar.dayOfWeekFull.${d.getDay()}`));
            return applyCapitalize(
                `${d.getDate()} ${t(`callendar.month.${d.getMonth()}`)}${displayYear ? ` ${year}` : ''}`
            );
        }

        if (props.showTimeIfToday)
            return FrontDateUtil.displayShortDateOrDayOrTimeIfToday(t, d);

        return applyCapitalize(
            `${d.getDate()} ${t(`callendar.${showFullMonthName ? 'month' : 'monthShort'}.${d.getMonth()}`)}${displayYear ? ` ${year}` : ''}`
        );
    }

    if (localDateString) {
        const [year, month, day] = localDateString.split('-').map(Number);
        const monthName = t(`callendar.${showFullMonthName ? 'month' : 'monthShort'}.${month - 1}`);
        const displayYear = showYear || (showYearIfNotCurrent && year !== currentYear);
        return applyCapitalize(`${day} ${monthName}${displayYear ? ` ${year}` : ''}`);
    }

    return null;
};

export default DateDisplay;