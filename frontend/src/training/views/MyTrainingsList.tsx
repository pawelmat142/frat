import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { TrainingI, TrainingStatuses } from "@shared/interfaces/TrainingI";
import { TrainingService } from "training/services/TrainingService";
import { Path } from "../../path";
import { useGlobalContext } from "global/providers/GlobalProvider";
import Header from "global/components/Header";
import Loading from "global/components/Loading";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { Ico } from "global/icon.def";
import IconButton from "global/components/controls/IconButon";
import ListItem from "global/components/ListItem";

const MyTrainingsList: React.FC = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const globalCtx = useGlobalContext();

    const [trainings, setTrainings] = useState<TrainingI[]>([]);
    const [loading, setLoading] = useState(true);
    const [providerExists, setProviderExists] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                await TrainingService.getMyProviderProfile();
                const list = await TrainingService.listMyTrainings();
                setTrainings(list);
            } catch {
                // Provider profile does not exist yet
                setProviderExists(false);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const toggleActivation = async (training: TrainingI) => {
        try {
            const updated = await TrainingService.toggleActivation(training.trainingId);
            setTrainings(prev => prev.map(t => t.trainingId === updated.trainingId ? updated : t));
        } catch {
            toast.error(t("training.activationError"));
        }
    };

    const deleteTraining = async (trainingId: number) => {
        if (!window.confirm(t("training.deleteConfirm"))) return;
        try {
            await TrainingService.deleteTraining(trainingId);
            setTrainings(prev => prev.filter(t => t.trainingId !== trainingId));
            toast.success(t("training.deleteSuccess"));
        } catch {
            toast.error(t("training.deleteError"));
        }
    };

    if (loading) return <Loading />;

    if (!providerExists) {
        return (
            <div className="view-container">
                <Header title={t("training.myTrainings")} />
                <div className="flex flex-col items-center justify-center mt-20 px-6 gap-4">
                    <p className="secondary-text text-center">{t("training.noProviderProfile")}</p>
                    <Button
                        size={BtnSizes.LARGE}
                        onClick={() => navigate(Path.TRAINING_PROVIDER_FORM)}
                    >
                        {t("training.createProviderProfile")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="view-container">
            <Header title={t("training.myTrainings")} />

            <div className="px-3 py-3 flex gap-2 justify-end">
                <Button
                    size={BtnSizes.SMALL}
                    mode={BtnModes.SECONDARY}
                    onClick={() => navigate(Path.TRAINING_PROVIDER_FORM)}
                >
                    {t("training.editProviderProfile")}
                </Button>
                <Button
                    size={BtnSizes.SMALL}
                    onClick={() => navigate(Path.TRAINING_FORM)}
                >
                    <Ico.PLUS size={14} className="mr-1" />
                    {t("training.addTraining")}
                </Button>
            </div>

            {!trainings.length && (
                <div className="flex flex-col items-center justify-center mt-10">
                    <Ico.EMPTY size={40} className="secondary-text mb-4" />
                    <p className="xl-font secondary-text">{t("training.noTrainings")}</p>
                </div>
            )}

            {trainings.map((training, i) => {
                const isActive = training.status === TrainingStatuses.ACTIVE;

                const topLeft = (
                    <div className="font-medium truncate">{training.title}</div>
                );

                const topRight = (
                    <span className={`xs-font ml-2 ${isActive ? 'text-green-500' : 'secondary-text'}`}>
                        {isActive ? t("training.active") : training.status === TrainingStatuses.DRAFT ? t("training.draft") : t("training.inactive")}
                    </span>
                );

                const bottomLeft = (
                    <div className="xs-font secondary-text mt-1">{training.certificateCode}</div>
                );

                const actions = (
                    <div className="flex items-center gap-1">
                        <IconButton
                            icon={<Ico.EDIT size={16} />}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(Path.getTrainingFormEditPath(training.trainingId));
                            }}
                        />
                        <IconButton
                            icon={isActive ? <Ico.CANCEL size={16} /> : <Ico.CHECK size={16} />}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleActivation(training);
                            }}
                        />
                        <IconButton
                            icon={<Ico.DELETE size={16} />}
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteTraining(training.trainingId);
                            }}
                        />
                    </div>
                );

                return (
                    <div
                        key={training.trainingId}
                        onClick={() => navigate(Path.getTrainingPath(training.trainingId))}
                    >
                        <ListItem
                            topLeft={topLeft}
                            topRight={topRight}
                            bottomLeft={bottomLeft}
                            rightSection={actions}
                            first={i === 0}
                            last={i === trainings.length - 1}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default MyTrainingsList;
