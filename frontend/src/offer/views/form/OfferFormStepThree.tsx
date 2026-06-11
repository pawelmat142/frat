import { FormValidator } from "global/FormValidator";
import { useTranslation } from "react-i18next";
import { useOfferForm } from "./OfferFormProvider";
import CurrencySelector from "offer/components/CurrencySelector";
import { Controller } from "react-hook-form";
import FloatingInput from "global/components/controls/FloatingInput";
import FloatingTextarea from "global/components/controls/FloatingTextarea";
import AvatarUploadField from "global/components/controls/AvatarUploadField";
import { useUserContext } from "user/UserProvider";
import { CloudinaryFolderNames, CloudinaryTags } from "@shared/utils/CloudinaryUtil";

const OfferFormStepThree: React.FC = () => {

    const { t } = useTranslation();
    const required = FormValidator.required(t);

    const ctx = useOfferForm();
    const { me } = useUserContext();

    const uid = me?.uid || '';

    if (!uid) {
        return <div>Missing uid!!</div>;
    }

    return (
        <>
            <h2 className="form-subheader">
                {t("offer.form.STEP_THREE.title")}
            </h2>
            <div className="flex flex-col gap-2">

                <Controller
                    name="STEP_THREE.displayName"
                    control={ctx.formCtx.control}
                    rules={required}
                    render={({ field }) => (
                        <FloatingInput
                            label={t("offer.displayName")}
                            name="STEP_THREE.displayName"
                            className="w-full mb-5"
                            value={field.value || ''}
                            required
                            onChange={(p) => {
                                field.onChange(p);
                            }}
                            error={ctx.formCtx.formState.errors.STEP_THREE?.displayName}
                        />
                    )}
                />

                <Controller
                    name="STEP_THREE.salary"
                    control={ctx.formCtx.control}
                    rules={required}
                    render={({ field }) => (
                        <FloatingInput
                            type="number"
                            {...field}
                            value={field.value ?? null}
                            label={t("offer.salary")}
                            fullWidth
                            error={ctx.formCtx.formState.errors.STEP_THREE?.salary}
                        />
                    )}
                />

                <CurrencySelector
                    control={ctx.formCtx.control}
                    error={ctx.formCtx.formState.errors.STEP_THREE?.currency}
                    value={ctx.form.STEP_THREE?.currency}
                    required
                    className="mb-5"
                />


                <Controller
                    name="STEP_THREE.description"
                    control={ctx.formCtx.control}
                    render={({ field }) => (
                        <FloatingTextarea
                            label={t("offer.description")}
                            name="STEP_THREE.description"
                            className="w-full"
                            value={field.value || ''}
                            onChange={(p) => {
                                field.onChange(p);
                            }}
                            error={ctx.formCtx.formState.errors.STEP_THREE?.description}
                        />
                    )}
                />

{/* TODO */}
                {/* <Controller
                    name="STEP_THREE.avatarRef"
                    control={ctx.formCtx.control}
                    rules={required}
                    render={({ field }) => (
                        <AvatarUploadField
                            value={field.value || null}
                            onChange={field.onChange}
                            error={ctx.formCtx.formState.errors.STEP_THREE?.avatarRef}
                            required
                            folder={CloudinaryFolderNames.OFFERS}
                            tags={[CloudinaryTags.AVATAR, CloudinaryTags.OFFER_AVATAR, CloudinaryTags.offerId(ctx.form.offerId) ]}
                        />
                    )}
                /> */}

            </div>
        </>
    )
}
export default OfferFormStepThree;