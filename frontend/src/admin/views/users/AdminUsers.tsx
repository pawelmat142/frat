import Loading from "global/components/Loading";
import { useEffect, useState } from "react";
import { UserI, UserStatuses } from "@shared/interfaces/UserI";
import { UsersAdminService } from "admin/services/UsersAdmin.service";
import IconButton from "global/components/controls/IconButon";
import DeleteIcon from '@mui/icons-material/Delete';
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useConfirm } from "global/providers/PopupProvider";
import { toast } from "react-toastify";
import SelectedUser from "./SelectedUser";

const AdminUsers: React.FC = () => {

    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<UserI[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserI | null>(null);

    const confirm = useConfirm();

    const _initUsers = async () => {
        try {
            setLoading(true);
            const users = await UsersAdminService.listUsers();
            if (users) {
                setUsers(users);
            } else {
                setUsers([]);
            }
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        _initUsers();
    }, []);

    if (loading) {
        return <Loading />;
    }

    const onSelectUser = (user: UserI) => {
        setSelectedUser(user)
    }

    const handleRemoveUser = async (user: UserI) => {
        const confirmed = await confirm({
            title: "Remove User",
            message: "Are you sure you want to remove this user?",
        });
        if (!confirmed) return;

        try {
            setLoading(true);
            await UsersAdminService.deleteUser(user.uid);
            await _initUsers();
            toast.success('User removed');
        } catch (e) { } finally {
            setLoading(false);
        }
    }

    const handleRefresh = async (user?: UserI) => {
        if (user) {
            const newUsers = users.map(u => {
                if (u.uid === user.uid) {
                    return user
                }
                return u
            })
            setUsers(newUsers)
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-2 items-center w-full p-5">
            <div className="w-full px-0">

                <h2 className="h2 mb-6 pl-2 primary-text">Users</h2>

                <h2 className="font-mono font-bold mb-2 mt-10">List of Users:</h2>

                <div className="overflow-x-auto w-full rounded-lg shadow border border-color secondary-bg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">uid</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">version</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">STATUS</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">ROLES</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">displayName</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">email</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">PROVIDER</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-6 secondary-text text-center">No users found.</td>
                                </tr>
                            ) : (
                                users.map((user, idx) => {
                                    const isSelected = selectedUser?.uid === user.uid;
                                    return (
                                        <tr
                                            key={idx}
                                            className={`hover-bg transition cursor-pointer${isSelected ? ' active' : ''}`}
                                            style={{ userSelect: 'none' }}
                                            onClick={() => onSelectUser(user)}
                                        >
                                            <td className="px-6 py-3 border-b border-color font-mono text-base primary-text">{user.uid}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{user.version}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{user.status}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{user.roles.join(', ')}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{user.displayName}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{user.email}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{user.provider}</td>


                                            <td className="px-6 py-3 border-b border-color primary-text">
                                                <div className="flex gap-2 justify-end">
                                                    <IconButton icon={<DeleteIcon />} size={BtnSizes.SMALL} mode={BtnModes.ERROR} onClick={() => handleRemoveUser(user)} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                </div>

                <SelectedUser user={selectedUser} onRefresh={handleRefresh} />

            </div>
        </div>
    )
}

export default AdminUsers;