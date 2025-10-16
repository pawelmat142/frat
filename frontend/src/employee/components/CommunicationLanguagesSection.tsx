import { Controller, UseFormSetValue, UseFormWatch, Control } from "react-hook-form";
import DictionarySelector from "global/components/controls/DictionarySelector";
import IconButton from "global/components/controls/IconButon";
import DeleteIcon from '@mui/icons-material/Delete';
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

const CommunicationLanguagesSection: React.FC<Props> = ({ control, setValue, watch }) => {
  const communicationLanguages: string[] = watch("communicationLanguages");

  const { t } = useTranslation();
  
  return (
    <>
      {communicationLanguages.map((lang, idx) => (
        <div key={idx} className="flex gap-2">
          <Controller
            name={`communicationLanguages.${idx}` as const}
            control={control}
            rules={{ required: true, validate: v => !!v }}
            render={({ field }) => (
              <DictionarySelector
                className="w-full"
                valueInput={field.value ?? ""}
                onSelect={item => field.onChange(item ? String(item.value) : "")}
                label={t("employeeProfile.form.communicationLanguage") + (communicationLanguages.length > 1 ? ` #${idx + 1}` : "")}
                code="LANGUAGES"
                groupCode="COMMUNICATION"
                fullWidth
                required
                disabledValues={communicationLanguages.filter((_, i) => i !== idx && communicationLanguages[i])}
              />
            )}
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
