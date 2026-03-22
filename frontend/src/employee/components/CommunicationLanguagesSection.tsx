import { Controller, UseFormSetValue, UseFormWatch, Control, FormState } from "react-hook-form";
import IconButton from "global/components/controls/IconButon";
import DeleteIcon from '@mui/icons-material/Delete';
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import React from "react";
import { useTranslation } from "react-i18next";
import { FormValidator } from "global/FormValidator";
import { WorkerForm } from "@shared/interfaces/WorkerI";
import DictionarySelector from "global/components/selector/DictionarySelector";

interface Props {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  formState?: FormState<WorkerForm>;
}

const CommunicationLanguagesSection: React.FC<Props> = ({ control, setValue, watch, formState }) => {
  const communicationLanguages: string[] = watch("personalData.communicationLanguages");

  const { t } = useTranslation();

  const required = FormValidator.required(t);

  return (
    <div>
      <div className="flex flex-col gap-3 md:gap-2">
        {communicationLanguages.map((lang, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <Controller
              name={`personalData.communicationLanguages.${idx}` as const}
              control={control}
              rules={required}
              render={({ field }) => <DictionarySelector
                className="w-full"
                valueInput={field.value ?? ""}
                onSelect={item => field.onChange(item ? String(item) : "")}
                label={t("employeeProfile.form.communicationLanguage") + (communicationLanguages.length > 1 ? ` #${idx + 1}` : "")}
                code="LANGUAGES"
                groupCode="COMMUNICATION"
                fullWidth
                required
                disabledValues={communicationLanguages.filter((_, i) => i !== idx && communicationLanguages[i])}
                error={formState?.errors.personalData?.communicationLanguages?.[idx]}
              />
              }
            />
            {idx > 0 && (
              <IconButton
                className=""
                icon={<DeleteIcon />}
                size={BtnSizes.SMALL}
                mode={BtnModes.ERROR_TXT}
                onClick={() => {
                  setValue(
                    "personalData.communicationLanguages",
                    communicationLanguages.filter((_, i) => i !== idx)
                  );
                }}
              />
            )}
          </div>
        ))}
      </div>
      <Button
        mode={BtnModes.PRIMARY_TXT}
        size={BtnSizes.SMALL}
        className="ml-auto"
        onClick={() => {
          setValue("personalData.communicationLanguages", [...communicationLanguages, '']);
        }}
      >
        {t("employeeProfile.form.addLanguage")}
      </Button>
    </div>
  );
};

export default CommunicationLanguagesSection;
