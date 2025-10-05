import React, { useState } from "react";
import { UserI, UserRole, UserRoles } from "@shared/interfaces/UserI";
import Buton from "global/components/controls/Buton";
import { BtnModes, DropdownItem } from "global/interface/controls.interface";
import Dropdown from "global/components/controls/Dropdown";
import { UsersAdminService } from "admin/services/UsersAdmin.service";
import { toast } from "react-toastify";
import Loading from "global/components/Loading";

interface SelectedUserProps {
    user: UserI | null;
    onRefresh?: (user?: UserI) => void;
}

const SelectedUser: React.FC<SelectedUserProps> = ({ user, onRefresh }) => {

    /* TODO refaktor na assign roles i multiselect */

    const [assignRoleForm, setAssignRoleForm] = useState(false)
    const [assignRoleValue, setAssignRoleValue] = useState<DropdownItem<UserRole> | null>(null)
    const [loading, setLoading] = useState(false)

    const assignRole = () => {
        setAssignRoleForm(true)
    }

    const saveAssignRole = async () => {
        if (!user) {
            toast.warning('Missing user')
            return
        }
        if (!assignRoleValue) {
            toast.warning('Missing role')
            return
        }

        try {
            setLoading(true)
            setAssignRoleForm(false)
            const result = await UsersAdminService.assignRoleForUser(user?.uid, assignRoleValue.value)
            toast.success(`Assigned role '${assignRoleValue.label}' to user: ${user.uid}`);
            if (onRefresh) {
                onRefresh(result)
            }
        } catch (e) { } finally {
            setLoading(false)
        }

    }

    if (loading) {
        return <Loading></Loading>
    }

    if (!user) {
        return null;
    }

    const items: DropdownItem<UserRole>[] = Object.values(UserRoles)
        .filter(role => !user.roles.includes(role))
        .map(role => ({
            label: role,
            value: role
        }))

    return (
        <div className="mt-10">
            <h2 className="font-mono font-bold mb-2">Selected user: {user.uid}</h2>

            {assignRoleForm && (<>

                <div className="flex gap-5 items-center my-5">
                    <Dropdown
                        fullWidth
                        className="w-52"
                        items={items}
                        value={assignRoleValue}
                        onSingleSelect={setAssignRoleValue}
                    />
                    {assignRoleForm && !!assignRoleValue && (
                        <Buton
                            onClick={saveAssignRole} 
                        >Save</Buton>
                    )}
                    {assignRoleForm && (
                        <Buton onClick={() => setAssignRoleForm(false)} mode={BtnModes.PRIMARY_TXT}>Cancel</Buton>
                    )}

                </div>

            </>)}

            <div className="flex gap-2 ">
                {!assignRoleForm && (<Buton onClick={assignRole} mode={BtnModes.PRIMARY}>Assign role</Buton>)}
            </div>
        </div>
    );
};

export default SelectedUser;
