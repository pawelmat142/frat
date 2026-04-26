import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import Button from 'global/components/controls/Button';
import RoleGuard from 'global/components/RoleGuard';
import { BtnModes } from 'global/interface/controls.interface';
import { UserRoles } from '@shared/interfaces/UserI';
import { DictionaryI, DictionaryStatuses } from '@shared/interfaces/DictionaryI';
import { useNavigate } from 'react-router-dom';
import { Path } from '../../../path';
import { AdminImportService } from 'admin/services/AdminImport.service';
import { useConfirm } from 'global/providers/PopupProvider';
import { DictionaryAdminService } from 'admin/services/DictionaryAdmin.service';
import { toast } from 'react-toastify';

interface Props {
    dictionary: DictionaryI;
    onSave: () => void;
    onToggleStatus: () => void;
}

const DictionaryActionsBar: React.FC<Props> = ({
    dictionary,
    onSave,
    onToggleStatus,
}) => {
    const navigate = useNavigate();
    const confirm = useConfirm();

    const handleAddElement = () => {
        navigate(Path.getAddDictionaryElementPath(dictionary.code));
    };

    const handleAddGroup = () => {
        navigate(Path.getDictionaryGroupFormPath(dictionary.code, 'new'));
    };

    const handleExportJson = () => {
        AdminImportService.exportDictionaryJson(dictionary.code);
    };

    const handleDeleteDictionary = async () => {
        const confirmed = await confirm({
            title: 'Confirm Deletion',
            message: `Are you sure you want to delete the dictionary "${dictionary.code}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });
        if (!confirmed) {
            return;
        }

        try {
            await DictionaryAdminService.deleteDictionary(dictionary.code);
            toast.success('Dictionary deleted successfully.');
            navigate(Path.ADMIN_DICTIONARIES);
        } catch (e) {
        }
    };

    return (
        <div className="flex gap-2 my-10">
            <Button onClick={handleAddElement} mode={BtnModes.PRIMARY}>
                <AddIcon /> Add element
            </Button>

            <Button onClick={onSave} mode={BtnModes.SECONDARY}>
                Save changes
            </Button>

            <Button onClick={handleAddGroup}>
                Add group
            </Button>

            <Button onClick={onToggleStatus} mode={BtnModes.PRIMARY_TXT}>
                {dictionary.status === DictionaryStatuses.ACTIVE ? 'Deactivate' : 'Activate'}
            </Button>

            <Button onClick={handleExportJson} mode={BtnModes.PRIMARY_TXT}>
                Export JSON
            </Button>

            <RoleGuard roles={[UserRoles.SUPERADMIN]}>
                <Button onClick={handleDeleteDictionary} mode={BtnModes.ERROR}>
                    Delete dictionary
                </Button>
            </RoleGuard>
        </div>
    );
};

export default DictionaryActionsBar;
