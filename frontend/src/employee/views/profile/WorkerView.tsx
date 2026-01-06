import React, { useEffect, useState } from "react";

import { WorkerService } from "employee/services/WorkerService";
import Loading from "global/components/Loading";
import { useNavigate, useParams } from "react-router-dom";
import { WorkerI, WorkerStatuses } from "@shared/interfaces/WorkerProfileI";
import { useWorkersSearch } from "../search/WorkersSearchProvider";
import AvatarTile from "../../../user/components/AvatarTile";
import CallendarTile from "./CallendarTile";
import ProfileDataTile from "./ProfileDataTile";
import AvailabilityTile from "./AvailabilityTile";
import { useTranslation } from "react-i18next";
import Chips, { ChipModes } from "global/components/chips/Chips";
import { useAuthContext } from "auth/AuthProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { Path } from "../../../path";
import { useMenuContext } from "global/providers/MenuProvider";
import { MenuConfig } from "global/components/selector/MenuItems";
import { toast } from "react-toastify";
import { useConfirm } from "global/providers/PopupProvider";
import { useUserContext } from "user/UserProvider";
import { ChatService } from "chat/services/ChatService";

const WorkerView: React.FC = () => {

    const params = useParams<{ displayName?: string }>()
    const displayName = params.displayName

    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState<WorkerI | null>(null)

    const { t } = useTranslation();
    const { me } = useAuthContext();
    const navigate = useNavigate();
    const menuCtx = useMenuContext();
    const confirm = useConfirm();
    const userCtx = useUserContext();

    const profileCtx = useWorkersSearch();
    const globalCtx = useGlobalContext();

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
        if (profile && me) {
            menuCtx.setupHeaderMenu(getProfileMenuItems(profile))
        }
    }, [profile, me]);

    const getProfileMenuItems = (profile: WorkerI): MenuConfig => {
        const isMyProfile = me?.uid === profile.uid;

        const hasMyLike = profile.likes?.includes(me?.uid || '') || false;

        const menu: MenuConfig = {
            title: t('employeeProfile.profileMenu'),
            items: []
        }

        if (isMyProfile) {
            menu.items.push({
                label: t('employeeProfile.editButton'),
                onClick: () => { goToEditForm() }
            })
            menu.items.push({
                label: profile.status === WorkerStatuses.ACTIVE ? t('employeeProfile.deactivateButton') : t('employeeProfile.activateButton'),
                onClick: () => { profileActivation(profile) }
            })
            menu.items.push({
                label: t('employeeProfile.deleteButton'),
                onClick: () => { deleteProfile() }
            })
        } else {
            menu.items.push({
                label: hasMyLike ? t('employeeProfile.unlikeButton') : t('employeeProfile.likeButton'),
                onClick: () => { likeProfile(profile) }
            })
            menu.items.push({
                label: t('chat.openChat'),
                onClick: openChat
            })
        }
        return menu;
    }

    const openChat = async () => {
        if (!profile) return;
        try {
            const chat = await ChatService.getOrCreateDirectChat(profile.uid)
            navigate(Path.getChatPath(chat.chatId))
        } catch (error) {
            console.error('Failed to open chat:', error)
            toast.error(t('chat.error.cannotOpen'))
        }
    }

    const likeProfile = async (profile: WorkerI) => {
        try {
            setLoading(true);
            const likesBefore = profile.likes?.length || 0;
            const likes = await WorkerService.notifyWorkerLike(profile.workerId);
            profile.likes = likes;
            setProfile({ ...profile });
            if (profile.likes?.length > likesBefore) {
                toast.success(t('employeeProfile.likeSuccessToast'));
            } else {
                toast.info(t('employeeProfile.likeRemoveToast'));
            }
        }
        finally {
            setLoading(false);
        }
    }

    const deleteProfile = async () => {
        const confirmed = await confirm({
            title: t('employeeProfile.deleteButton'),
            message: t('employeeProfile.deleteConfirmMessage'),
            confirmText: t('common.deleteButton'),
            cancelText: t('common.cancelButton'),
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
            setProfile(result);
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
        if (profile?.uid) {
            await WorkerService.notifyWorkerView(profile.uid)
        }
    }

    const _setProfile = (profile: WorkerI | null) => {
        setProfile(profile)
        if (profile) {
            notifyProfileView(profile)
        }
    }

    if (loading) {
        return <Loading />
    }
    if (!profile) {
        return <div className="py-8 text-center secondary-text italic">{t('employeeProfile.notFound')}</div>
    }

    const goToEditForm = () => {
        navigate(Path.WORKER_FORM);
    }

    const range = DateRangeUtil.getFirstRange(profile);

    return (
        <div className="view-container">

            <div>
                <div className="main-tiles">

                    <AvatarTile uid={profile.uid} src={profile.avatarRef?.url} />

                    <CallendarTile range={range}></CallendarTile>

                    <ProfileDataTile profile={profile} languagesDictionary={globalCtx.dics.languages}></ProfileDataTile>

                    <AvailabilityTile profile={profile} languagesDictionary={globalCtx.dics.languages}></AvailabilityTile>

                </div>


                <div className="mt-5 mb-1">{t('employeeProfile.form.experience')}: </div>
                <Chips chips={profile.experience || []} mode={ChipModes.TERTIARY}></Chips>

                <div className="mt-5 mb-1">{t('employeeProfile.form.certificates')}: </div>
                <Chips chips={profile.certificates || []} mode={ChipModes.SECONDARY}></Chips>

                <div className="mt-5 mb-1">{t('employeeProfile.experience')}: </div>
            </div>

        </div>
    );
}

export default WorkerView;