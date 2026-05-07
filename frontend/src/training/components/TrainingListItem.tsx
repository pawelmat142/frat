import React from "react";
import { TrainingWithNextSession } from "@shared/interfaces/TrainingI";
import { Path } from "../../path";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ListItem from "global/components/ListItem";
import { Ico } from "global/icon.def";
import Chips, { ChipModes } from "global/components/chips/Chips";
import { DictionaryUtil } from "@shared/utils/DictionaryUtil";
import { Dictionaries } from "@shared/def/dictionary.def";

interface Props {
    training: TrainingWithNextSession;
    first?: boolean;
    last?: boolean;
    rightSection?: React.ReactNode;
    className?: string;
}

const TrainingListItem: React.FC<Props> = ({ training, first, last, rightSection, className }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();

    // Always use translation key – CERTIFICATES dictionary is loaded lazily per feature
    const certLabel = t(DictionaryUtil.getTranslationKey(Dictionaries.CERTIFICATES, training.certificateCode));

    const topLeft = (
        <div className="font-medium truncate">
            {training.title}
        </div>
    );

    const topRight = training.price != null ? (
        <div className="xs-font secondary-text whitespace-nowrap ml-2">
            {training.price} {training.currency}
        </div>
    ) : null;

    const nextSessionText = training.nextSession
        ? new Date(training.nextSession.startDate).toLocaleDateString()
        : t('training.noUpcomingSession');

    const bottomLeft = (
        <div className="flex flex-col gap-2 mt-2">
            <Chips chips={[certLabel]} mode={ChipModes.SECONDARY} />
            <div className="flex items-center gap-3 flex-wrap">
                {training.displayAddress && (
                    <div className="flex items-center">
                        <Ico.MARKER size={13} className="secondary-text mr-1" />
                        <span className="xs-font truncate max-w-[150px]">{training.displayAddress}</span>
                    </div>
                )}
                <div className="flex items-center">
                    <Ico.CALENDAR size={13} className="secondary-text mr-1" />
                    <span className="xs-font">{nextSessionText}</span>
                </div>
                {training.isRecurring && (
                    <div className="flex items-center">
                        <Ico.CLOCK size={13} className="secondary-text mr-1" />
                        <span className="xs-font">{t('training.recurring')}</span>
                    </div>
                )}
                <div className="flex items-center">
                    <Ico.VIEWS size={13} className="secondary-text mr-1" />
                    <span className="xs-font">{training.uniqueViewsCount}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div onClick={() => navigate(Path.getTrainingPath(training.trainingId))} className={className}>
            <ListItem
                topLeft={topLeft}
                topRight={topRight}
                bottomLeft={bottomLeft}
                rightSection={rightSection}
                first={first}
                last={last}
            />
        </div>
    );
};

export default TrainingListItem;
