import { useTranslation } from 'react-i18next';

interface Props {
    date?: Date
    localDateString?: string;
    className?: string;
    showYear?: boolean;
    showYearIfNotCurrent?: boolean;
}

const DateDisplay: React.FC<Props> = ({ date, localDateString, className, showYear = false, showYearIfNotCurrent = true }) => {


    const { t } = useTranslation();

    const currentYear = new Date().getFullYear();

    if (date) {
        const day = date.getDate();
        const month = t(`callendar.monthShort.${date.getMonth()}`);

        const year = date.getFullYear();
        const displayYear = showYear || (showYearIfNotCurrent && year !== currentYear);

        return <span className={className}>{`${day} ${month}${displayYear ? ` ${year}` : ''}`}</span>
    }

    if (localDateString) {
        const [year, month, day] = localDateString.split('-').map(Number);
        const monthName = t(`callendar.monthShort.${month - 1}`);
        const displayYear = showYear || (showYearIfNotCurrent && year !== currentYear);
        return <span className={className}>{`${day} ${monthName}${displayYear ? ` ${year}` : ''}`}</span>
    }


    return null
}

export default DateDisplay;