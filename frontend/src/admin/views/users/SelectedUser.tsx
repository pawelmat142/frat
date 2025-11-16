import React, { useEffect, useState } from "react";
import { UserI, UserRole, UserRoles } from "@shared/interfaces/UserI";
import Button from "global/components/controls/Button";
import { BtnModes, SelectorItem,  } from "global/interface/controls.interface";
import { UsersAdminService } from "admin/services/UsersAdmin.service";
import { toast } from "react-toastify";
import Loading from "global/components/Loading";
import SelectorMulti from "global/components/selector/SelectorMulti";

interface SelectedUserProps {
    user: UserI | null;
    onRefresh?: (user?: UserI) => void;
}

const SelectedUser: React.FC<SelectedUserProps> = ({ user, onRefresh }) => {

    const [assignRoleForm, setAssignRoleForm] = useState(false)
    const [assignRolesValue, setAssignRolesValue] = useState<SelectorItem<UserRole>[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // user changes
        setAssignRoleForm(false)
        setAssignRolesValue(user?.roles.map(role => ({
            label: role,
            value: role
        })) || [])

    }, [user])


    const assignRole = () => {
        setAssignRoleForm(true)
    }

    const saveAssignRole = async () => {
        if (!user) {
            toast.warning('Missing user')
            return
        }
        if (!assignRolesValue?.length) {
            toast.warning('Missing role')
            return
        }

        try {
            setLoading(true)
            setAssignRoleForm(false)

            const result = await UsersAdminService.assignRoleForUser(user?.uid, assignRolesValue.map(role => role.value))
            
            toast.success(`Assigned roles '${assignRolesValue.map(role => role.label).join(', ')}' to user: ${user.displayName}`);
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

    const items: SelectorItem<UserRole>[] = Object.values(UserRoles)
        .map(role => ({
            label: role,
            value: role
        }))

    return (
        <div className="mt-10">
            <h2 className="font-mono font-bold mb-2">Selected user: {user.uid}</h2>

            {assignRoleForm && (<>

                <div className="flex gap-5 items-center my-5">
                    <SelectorMulti<UserRole>
                        fullWidth
                        className="w-1/3"
                        items={items}
                        values={assignRolesValue}
                        onSelect={setAssignRolesValue}
                    />
                    {assignRoleForm && !!assignRolesValue.length && (
                        <Button
                            onClick={saveAssignRole} 
                        >Save</Button>
                    )}
                    {assignRoleForm && (
                        <Button onClick={() => setAssignRoleForm(false)} mode={BtnModes.PRIMARY_TXT}>Cancel</Button>
                    )}

                </div>

            </>)}

            <div className="flex gap-2 ">
                {!assignRoleForm && (<Button onClick={assignRole} mode={BtnModes.PRIMARY}>Set roles</Button>)}
            </div>
        </div>
    );
};

export default SelectedUser;
