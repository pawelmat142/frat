import { WorkerAvailabilityOptions, WorkerI } from "@shared/interfaces/WorkerI";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { PositionUtil } from "@shared/utils/PositionUtil";
import CallendarsView from "global/components/callendar/CallendarsView";
import PseudoView from "global/components/PseudoView";
import DateDisplay from "global/components/ui/DateDisplay";
import DictionaryDisplay from "global/components/ui/DictionaryDisplay";
import ListUi from "global/components/ui/ListUi";
import { useIsDesktop } from "global/hooks/isMobile";
import { Ico } from "global/icon.def";
import { MenuItem } from "global/interface/controls.interface";
import { useBottomSheet } from "global/providers/BottomSheetProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useUserContext } from "user/UserProvider";

interface Props {
    worker: WorkerI;
}

const WorkerDataSection: React.FC<Props> = ({ worker }) => {

    const bottomSheetCtx = useBottomSheet();
    const globalCtx = useGlobalContext();
    const { t } = useTranslation();
    const isDesktop = useIsDesktop();
    const userCtx = useUserContext();
    const me = userCtx?.me;

    const [openPseudoView, setOpenPseudoView] = useState(false);

    const onAvailabilityClick = () => {
        setOpenPseudoView(true);
        globalCtx.hideFooter();
        globalCtx.setHideFloatingButton(true);
    }


    const isMe = me?.uid === worker?.uid;

    const openPhoneCall = () => {
        if (!worker.phoneNumber || isMe) return;

        const number = `${worker.phoneNumber.prefix}${worker.phoneNumber.number}`
        if (isDesktop) {
            // copy to clipboard
            navigator.clipboard.writeText(number);
            toast.info(t('employeeProfile.phoneNumberCopied', { number }));
            return;
        }
        window.location.href = `tel:${worker.phoneNumber.prefix}${worker.phoneNumber.number}`;
    }

    const getDistanceInfo = (): string => {
        if (!worker?.point) {
            return '';
        }

        const distanceInfo = userCtx.getDistanceInfo(PositionUtil.fromGeoPoint(worker.point));
        if (!distanceInfo) {
            return '';
        }

        return `(${distanceInfo} ${t('others.away')})`;
    }

    const getWorksInIndustry = () => {
        if (!worker.careerStartDate) {
            return null;
        }
        const start = new Date(worker.careerStartDate);
        const now = new Date();
        const years = now.getFullYear() - start.getFullYear();

        if (years > 2) {
            return t('employeeProfile.worksInIndurstryYears', { years });
        }
        const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        return t('employeeProfile.worksInIndurstryMonths', { months });
    }

    const worksInIndurstry = getWorksInIndustry();

    const getAvailabilityMenuItem = (): MenuItem => {
        switch (worker.availabilityOption) {
            case WorkerAvailabilityOptions.ANYTIME:
                return {
                    label: t('others.availableAnytime'),
                    icon: Ico.CALENDAR
                }
            case WorkerAvailabilityOptions.FROM_DATE:
                return {
                    label: `${t('others.availableFrom')} ${DateDisplay({
                        date: new Date(worker.startDate!),
                        showYear: false, t
                    })}`,
                    icon: Ico.CALENDAR,
                    onClick: onAvailabilityClick
                }
            case WorkerAvailabilityOptions.DATE_RANGES:
                return {
                    label: t('others.available'),
                    icon: Ico.CALENDAR,
                    onClick: onAvailabilityClick,
                    list: worker.availabilityDateRanges?.map(range => DateRangeUtil.toDateRange(range)).filter(r => !!r).map(r => {
                        return {
                            label: `${DateDisplay({
                                localDateString: r.start, t
                            })} - ${DateDisplay({
                                localDateString: r.end, t
                            })}`
                        }
                    })
                }
            default: throw new Error('Invalid availability option')
        }
    }

    const ranges = worker.availabilityOption === WorkerAvailabilityOptions.DATE_RANGES ? worker.availabilityDateRanges?.map(range => DateRangeUtil.toDateRange(range)).filter(r => !!r) : [];

    const getListItems = (): MenuItem[] => {
        return [
            getAvailabilityMenuItem(),
            {
                if: worker.phoneNumber,
                label: `${t('employeeProfile.form.phoneNumber')}: ${worker.phoneNumber.prefix} ${worker.phoneNumber.number}`,
                icon: Ico.PHONE,
                onClick: openPhoneCall
            }, {
                if: worker.geocodedPosition?.fullAddress,
                label: `${worker.geocodedPosition?.fullAddress} ${getDistanceInfo()}`,
                icon: Ico.MARKER
            }, {
                label: `${t("employeeProfile.form.email")}: ${worker.email}`,
                icon: Ico.EMAIL
            }, {
                if: worksInIndurstry,
                label: worksInIndurstry,
                icon: Ico.CLOCK
            }, {
                if: worker.maxAltitude,
                label: `${t('employeeProfile.form.career.maxAltitudeShort')}: ${worker.maxAltitude}[m]`,
                icon: Ico.RULER
            }, {
                if: typeof worker.readyToTravel === 'boolean',
                label: `${t('employeeProfile.form.career.readyToTravel')}: ${worker.readyToTravel ? t('common.yes') : t('common.no')}`,
                icon: Ico.COMPASS
            }, {
                if: !!worker.communicationLanguages.length,
                label: `${t('others.languages')}: ${worker.communicationLanguages.map(lang => DictionaryDisplay({ dictionary: "LANGUAGES", value: lang, t }))}`,
                icon: Ico.LANGUAGE
            }];
    }

    return (
        <>
            <div className="mb-5 mt-5">
                <ListUi items={getListItems()}></ListUi>
            </div>

            
            <PseudoView show={openPseudoView}>
                <CallendarsView
                    title={t("employeeProfile.availability")}
                    ranges={ranges}
                    bottomSheetCtx={bottomSheetCtx}
                    onClose={() => {
                        setOpenPseudoView(false)
                        globalCtx.showFooter();
                        globalCtx.setHideFloatingButton(false);
                    }}
                />
            </PseudoView>
        </>
    );
}

export default WorkerDataSection;
