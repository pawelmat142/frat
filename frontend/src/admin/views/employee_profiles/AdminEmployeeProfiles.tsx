import Loading from "global/components/Loading";
import { useEffect, useState, useCallback } from "react";
import IconButton from "global/components/controls/IconButon";
import DeleteIcon from '@mui/icons-material/Delete';
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useConfirm } from "global/providers/PopupProvider";
import { toast } from "react-toastify";
import { Util } from "@shared/utils/util";
import { EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI";
import { EmployeeProfilesAdminService } from "admin/services/EmployeeProfilesAdmin.service";
import SelectedProfile from "./SelectedProfile";
import { userAdminPanelContext } from "../AdminPanelProvider";
import Button from "global/components/controls/Button";

const AdminEmployeeProfiles: React.FC = () => {

    // TODO paginacja profili - admin panel

    const [loading, setLoading] = useState(false);
    const [selectedEmployeeProfile, setSelectedEmployeeProfile] = useState<EmployeeProfileI | null>(null);

    const { employeeProfiles } = userAdminPanelContext();

    const confirm = useConfirm();

    const _initEmployeeProfiles = async () => {
        try {
            setLoading(true);
            await employeeProfiles?.initProfiles();
            setSelectedEmployeeProfile(null);
        }
        finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        _initEmployeeProfiles();
    }, []);

    // Escape key handler to clear selected profile
    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setSelectedEmployeeProfile(null);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [handleEscape]);

    if (loading) {
        return <Loading />;
    }

    const onSelectEmployeeProfile = (profile: EmployeeProfileI) => {
        setSelectedEmployeeProfile(profile)
    }

    const handleCleanAll = async () => {
        const confirmed = await confirm({
            title: "Are you sure?",
            message: "Are you sure you want to export all employee profiles? This action cannot be undone.",
        })
        if (!confirmed) return; 
        try {
            setLoading(true);
            await EmployeeProfilesAdminService.deleteAllProfiles();
            await _initEmployeeProfiles();
            toast.success('All employee profiles have been deleted.');
        } catch (e) { } finally {
            setLoading(false);
        }
    }

    const handleInitialLoad = async () => {
        try {
            setLoading(true);
            await EmployeeProfilesAdminService.initialLoad();
            await _initEmployeeProfiles();
        } catch (e) { 
            console.error(e);
            toast.error('Failed to perform initial load of employee profiles.');
        } finally {
            setLoading(false);
        }
    }

    const handleProfileAction = async (profile: EmployeeProfileI) => {
        const confirmed = await confirm({
            title: "Are you sure?",
            message: "Are you sure you want to delete this employee profile? This action cannot be undone.",
        });
        if (!confirmed) return;

        try {
            setLoading(true);
            await EmployeeProfilesAdminService.deleteProfile(profile.employeeProfileId);
            await _initEmployeeProfiles();
            toast.success('todo...');
        } catch (e) { } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-2 items-center w-full p-5">
            <div className="w-full px-0">

                <h2 className="h2 mb-6 pl-2 primary-text">Employee profiles</h2>

                <div className="flex gap-2 mb-10 mt-5">

                    {!!employeeProfiles?.profiles?.length && (
                        <Button
                            mode={BtnModes.PRIMARY_TXT}
                            onClick={handleCleanAll}
                        >Clean all</Button>
                    )}

                    <Button
                        mode={BtnModes.PRIMARY_TXT}
                        onClick={handleInitialLoad}
                    >Initial Load</Button>

                </div>

                <h2 className="font-mono font-bold mb-2 mt-10">List of employee profiles:</h2>

                <div className="overflow-x-auto w-full rounded-lg shadow border border-color secondary-bg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">id</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">status</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">display name</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">locationOption</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">createdAt</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {employeeProfiles?.profiles?.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-6 secondary-text text-center">No employee profiles found.</td>
                                </tr>
                            ) : (
                                employeeProfiles?.profiles?.map((profile, idx) => {
                                    const isSelected = selectedEmployeeProfile?.employeeProfileId === profile.employeeProfileId;
                                    return (
                                        <tr
                                            key={idx}
                                            className={`hover-bg transition cursor-pointer${isSelected ? ' active' : ''}`}
                                            style={{ userSelect: 'none' }}
                                            onClick={() => onSelectEmployeeProfile(profile)}
                                        >
                                            <td className="px-6 py-3 border-b border-color font-mono text-base primary-text">{profile.employeeProfileId}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{profile.status}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{profile.displayName}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{profile.locationOption}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{Util.displayDate(profile.createdAt)}</td>

                                            <td className="px-6 py-3 border-b border-color primary-text">
                                                <div className="flex gap-2 justify-end">
                                                    <IconButton icon={<DeleteIcon />} size={BtnSizes.SMALL} mode={BtnModes.ERROR} onClick={() => handleProfileAction(profile)} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                </div>

                <SelectedProfile profile={selectedEmployeeProfile} />

            </div>
        </div>
    )
}

export default AdminEmployeeProfiles;