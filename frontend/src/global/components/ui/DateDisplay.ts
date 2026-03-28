import { useTranslation } from 'react-i18next';

interface Props {
    date?: Date;
    localDateString?: string;
    showYear?: boolean;
    showYearIfNotCurrent?: boolean;
    t: any
}

const DateDisplay = (props: Props): string | null => {
    const date = props.date;
    const showYear = props.showYear;
    const showYearIfNotCurrent = props.showYearIfNotCurrent;
    const localDateString = props.localDateString;
    const t = props.t;

    const currentYear = new Date().getFullYear();

    if (date) {
        const day = date.getDate();
        const month = t(`callendar.monthShort.${date.getMonth()}`);

        const year = date.getFullYear();
        const displayYear = showYear || (showYearIfNotCurrent && year !== currentYear);

        return `${day} ${month}${displayYear ? ` ${year}` : ''}`;
    }

    if (localDateString) {
        const [year, month, day] = localDateString.split('-').map(Number);
        const monthName = t(`callendar.monthShort.${month - 1}`);
        const displayYear = showYear || (showYearIfNotCurrent && year !== currentYear);
        return `${day} ${monthName}${displayYear ? ` ${year}` : ''}`;
    }

    return null;
};

export default DateDisplay;