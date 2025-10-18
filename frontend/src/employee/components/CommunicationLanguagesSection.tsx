import { Controller, UseFormSetValue, UseFormWatch, Control, FormState } from "react-hook-form";
import DictionarySelector from "global/components/controls/DictionarySelector";
import IconButton from "global/components/controls/IconButon";
import DeleteIcon from '@mui/icons-material/Delete';
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import React from "react";
import { useTranslation } from "react-i18next";
import { FormValidator } from "global/FormValidator";
import { EmployeeProfileForm } from "@shared/def/employee-profile.def";

interface Props {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  formState?: FormState<EmployeeProfileForm>;
}

const CommunicationLanguagesSection: React.FC<Props> = ({ control, setValue, watch, formState }) => {
  const communicationLanguages: string[] = watch("communicationLanguages");

  const { t } = useTranslation();

  const required = FormValidator.required(t);

  return (
    <>
      {communicationLanguages.map((lang, idx) => (
        <div key={idx} className="flex gap-2">
          <Controller
            name={`communicationLanguages.${idx}` as const}
            control={control}
            rules={required}
            render={({ field }) => <DictionarySelector
              className="w-full"
              valueInput={field.value ?? ""}
              onSelect={item => field.onChange(item ? String(item.value) : "")}
              label={t("employeeProfile.form.communicationLanguage") + (communicationLanguages.length > 1 ? ` #${idx + 1}` : "")}
              code="LANGUAGES"
              groupCode="COMMUNICATION"
              fullWidth
              required
              disabledValues={communicationLanguages.filter((_, i) => i !== idx && communicationLanguages[i])}
              error={formState?.errors.communicationLanguages?.[idx]}
            />
            }
          />
          {idx > 0 && (
            <IconButton
              className="mt-auto mb-1"
              icon={<DeleteIcon />}
              size={BtnSizes.SMALL}
              mode={BtnModes.ERROR}
              onClick={() => {
                setValue(
                  "communicationLanguages",
                  communicationLanguages.filter((_, i) => i !== idx)
                );
              }}
            />
          )}
        </div>
      ))}
      <Button
        mode={BtnModes.PRIMARY_TXT}
        size={BtnSizes.SMALL}
        className="ml-auto"
        onClick={() => {
          setValue("communicationLanguages", [...communicationLanguages, '']);
        }}
      >
        {t("employeeProfile.form.addLanguage")}
      </Button>
    </>
  );
};

export default CommunicationLanguagesSection;
