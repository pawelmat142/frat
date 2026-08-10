import { translateFn } from "global/def";
import { ConfirmOptions } from "global/providers/PopupProvider";

export const deleteWorkerProfileConfirm: (t: translateFn) => ConfirmOptions = (t: translateFn) => ({
    title: t('employeeProfile.deleteButton'),
    message: t('employeeProfile.deleteConfirmMessage'),
})

export const deleteOfferConfirm: (t: translateFn) => ConfirmOptions = (t: translateFn) => ({
    title: t('offer.deleteConfirmTitle'),
    message: t('offer.deleteConfirmMessage'),
})