import React from "react";
import { Controller, set, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import FloatingInput from "global/components/controls/FloatingInput";
import IconButton from "global/components/controls/IconButon";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { FormValidator } from "global/FormValidator";
import DeleteIcon from "@mui/icons-material/Delete";
import Loading from "global/components/Loading";
import { WorkerSkills } from "@shared/interfaces/WorkerI";
import i18n from "global/i18n";
import { WorkerService } from "employee/services/WorkerService";
import { Ico } from "global/icon.def";
import { useUserContext } from "user/UserProvider";
import Header from "global/components/Header";
import { useGlobalContext } from "global/providers/GlobalProvider";

interface SkillsForm {
    items: { name: string }[];
}

const WorkerSkillsFormView: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const userCtx = useUserContext();
    const worker = userCtx.meCtx?.workerProfile || null;
    const globalCtx = useGlobalContext();

    const [loading, setLoading] = React.useState(false);


    const { control, handleSubmit, formState } = useForm<SkillsForm>({
        defaultValues: {
            items: worker?.skills?.items?.map(s => ({ name: s.name })) ?? [],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    React.useEffect(() => {
        globalCtx.hideFooter();
        if (fields.length === 0) {
            append({ name: "" })
        };
        return () => {
            globalCtx.showFooter();
        }
    }, []);

    const required = FormValidator.required(t);


    if (loading) {
        return <Loading />;
    }

    const onSubmit = async (data: SkillsForm) => {
        try {
            setLoading(true);
            const request: WorkerSkills = {
                items: data.items.map(i => ({ name: i.name, code: 'NONE' })),
                providedInLanguage: i18n.language
            }
            await WorkerService.updateSkills(request);
            await userCtx.initWorker();
            navigate(-1);
        } catch (error) {

        } finally {
            setLoading(false);
        }
    };

    if (!worker) {
        return <Loading />;
    }

    return (<>

        <Header title={t("employeeProfile.editSkills")}></Header>
        
        <div className="w-full max-w-lg px-3 py-6">
            <h1 className="desktop-block form-header">{t("employeeProfile.editSkills")}</h1>
            <p className="secondary-text s-font mb-6">
                {t("employeeProfile.editSkillsInfo")}
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-3">
                    {fields.map((field, idx) => (
                        <div key={field.id} className="flex gap-2 items-center">
                            <Controller
                                name={`items.${idx}.name`}
                                control={control}
                                rules={required}
                                render={({ field: f }) => (
                                    <FloatingInput
                                        {...f}
                                        className="w-full"
                                        label={`${t("employeeProfile.skill")} #${idx + 1}`}
                                        fullWidth
                                        required
                                        error={formState.errors.items?.[idx]?.name}
                                    />
                                )}
                            />
                            <IconButton
                                icon={<DeleteIcon />}
                                mode={BtnModes.ERROR_TXT}
                                onClick={() => remove(idx)}
                            />
                        </div>
                    ))}
                </div>

                <Button
                    mode={BtnModes.PRIMARY_TXT}
                    size={BtnSizes.SMALL}
                    className="ml-auto pt-5"
                    onClick={() => append({ name: "" })}
                >
                    <Ico.PLUS className="w-4 h-4" />
                    {t("employeeProfile.addSkill")}
                </Button>

                <div className="flex justify-between mt-8">
                    <Button mode={BtnModes.SECONDARY_TXT} onClick={() => navigate(-1)}>
                        <Ico.CHEVRON_LEFT size={16} aria-hidden="true" />
                        {t("common.back")}
                    </Button>
                    <Button mode={BtnModes.PRIMARY} type="submit" className="px-10">
                        <Ico.CHECK size={16} aria-hidden="true" />
                        {t("common.save")}
                    </Button>
                </div>
            </form>
        </div>
    </>
    );
};

export default WorkerSkillsFormView;
