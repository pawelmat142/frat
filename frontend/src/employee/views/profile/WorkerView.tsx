import React, { useEffect, useId, useState } from "react";

import { WorkerService } from "employee/services/WorkerService";
import Loading from "global/components/Loading";
import { useNavigate, useParams } from "react-router-dom";
import { WorkerI, WorkerStatuses } from "@shared/interfaces/WorkerI";
import { useWorkersSearch } from "../search/WorkersSearchProvider";
import { useTranslation } from "react-i18next";
import { Path } from "../../../path";
import { MenuConfig } from "global/components/selector/MenuItems";
import { toast } from "react-toastify";
import { useConfirm } from "global/providers/PopupProvider";
import { useUserContext } from "user/UserProvider";
import PositionWidget from "employee/components/PositionWidget";
import { Ico } from "global/icon.def";
import DictionaryDisplay from "global/components/ui/DictionaryDisplay";
import FloatingActionButton from "global/components/buttons/FloatingActionButton";
import { AVATAR_MOCK } from "user/components/AvatarTile";
import { AppConfig } from "@shared/AppConfig";
import WorkerSkillsSection from "employee/components/WorkerSkillsSection";
import WorkerImagesSection from "employee/components/WorkerImagesSection";
import ChecklistUi from "global/components/ui/ChecklistUi";
import { UserListedItemReferenceTypes, UserListedItemTypes } from "@shared/interfaces/UserListedItem";
import { UserListedItemService } from "user/services/UserListedItemService";
import Header from "global/components/Header";
import WorkerStatItems from "employee/components/WorkerStatItems";
import CategoriesChips from "global/components/chips/CategoriesChips";
import WorkerBioSection from "employee/components/WorkerBioSection";
import WorkerDataSection from "employee/components/WorkerDataSection";
import { useFriendshipActions } from "friends/useFriendshipActions";
import { buildFriendshipMenuItems } from "friends/friendshipMenuBuilder";
import { useFloatingBtnContext } from "global/providers/FloatingBtnProvider";

const WorkerView: React.FC = () => {

    const params = useParams<{ displayName?: string }>()
    const displayName = params.displayName

    const [loading, setLoading] = useState(false)
    const [worker, setWorker] = useState<WorkerI | null>(null)

    const { t } = useTranslation();
    const navigate = useNavigate();
    const confirm = useConfirm();
    const userCtx = useUserContext();
    const floatingBtnCtx = useFloatingBtnContext();
    const me = userCtx?.me;

    const profileCtx = useWorkersSearch();

    const isMe = me?.uid === worker?.uid;
    const isSavedOnList = (userCtx.meCtx?.listedItems ?? [])
        .some(item => item.reference === worker?.workerId?.toString() && item.referenceType === UserListedItemReferenceTypes.WORKER);

    const isMyAccount = !!worker && me?.uid === worker?.uid;

    const {
        getFriendship,
        sendInvite,
        removeFriend,
        acceptInvitation,
        rejectInvitation,
        loading: friendshipActionLoading,
        openChat,
    } = useFriendshipActions({
        targetUid: worker?.uid || '',
    });

    const friendship = isMyAccount ? null : getFriendship();

    useEffect(() => {
        const initWorker = async () => {
            if (displayName) {
                const p = profileCtx.results?.find(p => p.displayName === displayName)
                if (p) {
                    _setProfile(p)
                    return
                }
                try {
                    setLoading(true)
                    const result = await WorkerService.fetchWorkerByDisplayName(displayName)
                    _setProfile(result)
                } finally {
                    setLoading(false)
                }
            }
        }
        initWorker()
    }, []);


    useEffect(() => {
        if (!worker || isMyAccount) return;
        floatingBtnCtx.setup(
            <FloatingActionButton
                onClick={openChat}
                icon={<Ico.MSG size={AppConfig.FAB_BTN_ICON_SIZE} />}
            />, worker.uid);
            floatingBtnCtx.show();

            return () => {
                floatingBtnCtx.hide({ remove: true, id: worker.uid });
            }
    }, [worker]);


    const goToUserProfile = () => {
        if (!worker) return;
        navigate(Path.getProfilePath(worker?.uid));
    }

    const deleteProfile = async () => {
        const confirmed = await confirm({
            title: t('employeeProfile.deleteButton'),
            message: t('employeeProfile.deleteConfirmMessage'),
        })
        if (!confirmed) {
            return;
        }

        setLoading(true);
        try {
            await WorkerService.deleteProfile();
            userCtx.initWorker();
            toast.success(t('employeeProfile.deleteSuccessToast'));
            navigate(Path.HOME, { replace: true });
            // Don't setLoading(false) - component will unmount after navigation
        } catch (error) {
            toast.error(t('employeeProfile.deleteErrorToast'));
        }
        finally {
            setLoading(false);
        }
    }

    const profileActivation = async (profile: WorkerI) => {
        try {
            setLoading(true);
            const result = await WorkerService.activation()
            setWorker(result);
            if (WorkerStatuses.ACTIVE === result.status) {
                toast.success(t('employeeProfile.activationSuccessToast'));
            } else {
                toast.success(t('employeeProfile.deactivationSuccessToast'));
            }
        }
        catch (error) {
            console.error('Profile activation error:', error);
            toast.error(t('employeeProfile.activationErrorToast'));
        }
        finally {
            setLoading(false);
        }
    }

    const notifyProfileView = async (profile: WorkerI) => {
        if (me && profile?.uid) {
            await WorkerService.notifyWorkerView(profile.workerId)
        }
    }

    const _setProfile = (profile: WorkerI | null) => {
        setWorker(profile)
        if (profile) {
            notifyProfileView(profile)
        }
    }

    if (loading || friendshipActionLoading) {
        return <Loading />
    }
    if (!worker) {
        return <div className="py-8 text-center secondary-text italic">{t('employeeProfile.notFound')}</div>
    }

    const addListItem = async () => {
        if (isMe || !userCtx.meCtx) return;
        const meCtx = userCtx.meCtx;
        try {
            setLoading(true);
            const item = await UserListedItemService.addItem({
                reference: worker.workerId.toString(),
                referenceType: UserListedItemReferenceTypes.WORKER,
                listedType: UserListedItemTypes.DEFAULT
            });
            if (!item) {
                toast.error(t('user.addToListError'));
                return;
            }
            userCtx.updateMeCtx({
                ...meCtx,
                listedItems: [...(meCtx.listedItems ?? []), item]
            });
            toast.success(t('user.addToListSuccess'));
        }
        finally {
            setLoading(false);
        }
    }

    const removeListItem = async () => {
        if (isMe || !userCtx.meCtx) return;
        const listItem = (userCtx.meCtx.listedItems ?? [])
            .find(item => item.reference === worker.workerId.toString() && item.referenceType === UserListedItemReferenceTypes.WORKER);
        if (!listItem) return;
        const meCtx = userCtx.meCtx;
        try {
            setLoading(true);
            await UserListedItemService.removeItem(listItem.id.toString());
            userCtx.updateMeCtx({
                ...meCtx,
                listedItems: (meCtx.listedItems ?? []).filter(item => item.id !== listItem.id)
            } as Parameters<typeof userCtx.updateMeCtx>[0]);
            toast.success(t('user.removeFromListSuccess'));
        }
        finally {
            setLoading(false);
        }
    }

    const baseMenuItems = [{
        label: t('employeeProfile.editButton'),
        if: isMyAccount,
        onClick: () => { goToEditForm() },
        icon: Ico.EDIT
    }, {
        label: worker.status === WorkerStatuses.ACTIVE ? t('employeeProfile.deactivateButton') : t('employeeProfile.activateButton'),
        if: isMyAccount,
        onClick: () => { profileActivation(worker) },
        icon: worker.status === WorkerStatuses.ACTIVE ? Ico.CANCEL : Ico.CHECK
    }, {
        label: t('employeeProfile.deleteButton'),
        if: isMyAccount,
        onClick: () => { deleteProfile() },
        icon: Ico.DELETE
    }, {
        label: t('user.removeFromList'),
        if: !isMyAccount && isSavedOnList,
        onClick: removeListItem,
        icon: Ico.STAR
    }, {
        label: t('user.addToList'),
        if: !isMyAccount && !isSavedOnList,
        onClick: addListItem,
        icon: Ico.STAR
    }, {
        label: t('user.openProfile'),
        onClick: goToUserProfile,
        icon: Ico.ACCOUNT
    }];

    const friendshipItems = buildFriendshipMenuItems({
        t,
        isMyAccount,
        friendship,
        me,
        onSendInvite: sendInvite,
        onRemoveFriend: removeFriend,
        onAcceptInvitation: acceptInvitation,
        onRejectInvitation: rejectInvitation,
        onOpenChat: openChat,
    });

    const menuItems = [
        ...friendshipItems,
        ...baseMenuItems
    ];

    const menuConfig: MenuConfig = {
        title: t('employeeProfile.profileMenu'),
        items: menuItems
    }

    const goToEditForm = () => {
        navigate(Path.WORKER_FORM);
    }

    return (<>
        <Header title={t('employeeProfile.title')} menu={menuConfig}></Header>

        <div className="w-full flex flex-col flex-1">

            <div className="flex gap-3 items-center view-margin">

                <div className="worker-avatar" onClick={goToUserProfile}>
                    <img src={worker.avatarRef?.url || AVATAR_MOCK} alt={worker.displayName} />
                </div>

                <div className="worker-profile-top">
                    <div className="worker-profile-top-row one">
                        <CategoriesChips categories={worker.categories} smaller />
                    </div>
                    <div className="worker-profile-top-row two">
                        <div>
                            <div className="l-font font-semibold">{worker.displayName}</div>
                        </div>
                    </div>
                    <div className="worker-profile-top-row three">
                        <WorkerStatItems worker={worker} />
                    </div>
                </div>

            </div>

            <WorkerDataSection worker={worker} />

            <ChecklistUi icon={Ico.CHECK} title={t('employeeProfile.form.certificates.title')}
                items={worker.certificates?.map(cert => ({ label: DictionaryDisplay({ dictionary: "CERTIFICATES", value: cert, t }) })) || []}
            ></ChecklistUi>

            <WorkerSkillsSection worker={worker} />

            <WorkerImagesSection worker={worker} onWorkerUpdate={_setProfile} onOpenCloseLightbox={(open) => {
                if (open) {
                    floatingBtnCtx.hide({ remove: false, id: worker.uid });
                } else {
                    floatingBtnCtx.show();
                }
            }} />

            <WorkerBioSection worker={worker} />

            <div className="view-margin mb-10">
                <PositionWidget position={worker.geocodedPosition || null}></PositionWidget>
            </div>

        </div>
    </>);
}

export default WorkerView;