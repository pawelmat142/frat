import React, { useEffect, useState } from "react";

import { WorkerService } from "employee/services/WorkerService";
import Loading from "global/components/Loading";
import { useNavigate, useParams } from "react-router-dom";
import { WorkerAvailabilityOptions, WorkerI, WorkerStatuses } from "@shared/interfaces/WorkerI";
import { useWorkersSearch } from "../search/WorkersSearchProvider";
import { useTranslation } from "react-i18next";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { Path } from "../../../path";
import { useMenuContext } from "global/providers/MenuProvider";
import { MenuConfig } from "global/components/selector/MenuItems";
import { toast } from "react-toastify";
import { useConfirm } from "global/providers/PopupProvider";
import { useUserContext } from "user/UserProvider";
import { useWorkerContext } from "employee/WorkerProvider";
import { ChatService } from "chat/services/ChatService";
import PositionWidget from "employee/components/PositionWidget";
import { Ico } from "global/icon.def";
import DateDisplay from "global/components/DateDisplay";
import { useIsDesktop } from "global/hooks/isMobile";
import DictionaryDisplay from "global/components/DictionaryDisplay";
import FloatingActionButton from "global/components/buttons/FloatingActionButton";
import { AVATAR_MOCK } from "user/components/AvatarTile";

const WorkerView: React.FC = () => {

    const params = useParams<{ displayName?: string }>()
    const displayName = params.displayName

    const [loading, setLoading] = useState(false)
    const [worker, setProfile] = useState<WorkerI | null>(null)

    const { t } = useTranslation();
    const navigate = useNavigate();
    const menuCtx = useMenuContext();
    const confirm = useConfirm();
    const userCtx = useUserContext();
    const workerCtx = useWorkerContext();
    const me = userCtx?.me;

    const profileCtx = useWorkersSearch();
    const globalCtx = useGlobalContext();
    const isDesktop = useIsDesktop();

    const isMe = me?.uid === worker?.uid;

    console.log(worker)
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
        if (worker && me) {
            menuCtx.setupHeaderMenu(getProfileMenuItems(worker))
        }
    }, [worker, me]);

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
        if (!worker) return;
        try {
            const chat = await ChatService.getOrCreateDirectChat(worker.uid)
            navigate(Path.getConversationPath(chat.chatId))
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
            workerCtx.initWorker();
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
    if (!worker) {
        return <div className="py-8 text-center secondary-text italic">{t('employeeProfile.notFound')}</div>
    }

    const goToEditForm = () => {
        navigate(Path.WORKER_FORM);
    }

    const range = DateRangeUtil.getFirstRange(worker);

    console.log(range)
    console.log(range)

    const iconSize = `1.5rem`

    const isAnytime = worker.availabilityOption === WorkerAvailabilityOptions.ANYTIME;

    const onAvailabilityClick = () => {
        if (!isAnytime) {
            // TODO show callendar view
        }
    }

    const openPhoneCall = () => {
        if (!worker.phoneNumber || isMe) return;

        const number = `${worker.phoneNumber.prefix}${worker.phoneNumber.number}`
        if (isDesktop) {
            // copy to clipboard
            navigator.clipboard.writeText(number);
            toast.info(t('employeeProfile.phoneNumberCopied', { number }));
            return;
        }
        window.location.href = `tel:${worker.phoneNumber.prefix}${worker.phoneNumber.number}`;
    }

    const listItemClassName = `flex gap-4 px-5 py-3 items-center`;

    return (
        <div className="w-full">

            <div className="flex gap-5 items-center px-5">

                <div className="worker-avatar">
                    <img src={worker.avatarRef?.url || AVATAR_MOCK} alt={worker.displayName} />
                </div>

                <div className="worker-title ">
                    <div className="xl-font font-semibold mb-1">{worker.displayName}</div>
                    <div className="secondary-text">{worker.email}</div>
                </div>

            </div>

            <div className="mb-5 mt-5">
                <div className={`${listItemClassName} ${!isAnytime ? 'ripple' : ''}`} onClick={onAvailabilityClick}>
                    <Ico.CALENDAR size={iconSize}></Ico.CALENDAR>
                    {isAnytime ? (
                        <span>{t('others.availableAnytime')}</span>
                    ) : (
                        !!worker.startDate &&
                        (<span>{t('others.availableFrom')} <DateDisplay localDateString={worker.startDate} showYear={false}></DateDisplay></span>)
                    )}

                    {!isAnytime && (
                        <Ico.CHEVRON_RIGHT className="ml-auto secondary-text"></Ico.CHEVRON_RIGHT>
                    )}
                </div>

                {!!worker.geocodedPosition?.fullAddress && (
                    <div className={listItemClassName}>
                        <Ico.MARKER size={iconSize}></Ico.MARKER>
                        <span>{worker.geocodedPosition.fullAddress}</span>
                    </div>
                )}

                {!!worker.phoneNumber && (
                    <div className={listItemClassName + ' ripple'} onClick={openPhoneCall}>
                        <Ico.PHONE size={iconSize}></Ico.PHONE>
                        <span>
                            <span>{t('employeeProfile.form.phoneNumber')}: </span>
                            <span>{worker.phoneNumber.prefix} {worker.phoneNumber.number}</span>
                        </span>
                        <Ico.CHEVRON_RIGHT className="ml-auto secondary-text"></Ico.CHEVRON_RIGHT>
                    </div>
                )}

                <div className={listItemClassName}>
                    <Ico.EMAIL size={iconSize}></Ico.EMAIL>
                    <span>
                        <span>{t("employeeProfile.form.email")}: </span>
                        <span>{worker.email}</span>
                    </span>
                </div>

                {/* TODO model */}
                {/* TODO dodac krok do wizarda */}
                {/* TODO translacje */}
                <div className={listItemClassName}>
                    <Ico.CLOCK size={iconSize}></Ico.CLOCK>
                    <span>W branży od: 8 lat</span>
                </div>
                <div className={listItemClassName}>
                    <Ico.RULER size={iconSize}></Ico.RULER>
                    <span>Max wysokość: 180 m</span>
                </div>
                <div className={listItemClassName}>
                    <Ico.COMPASS size={iconSize}></Ico.COMPASS>
                    <span>Gotowość do wyjazdów: TAK</span>
                </div>

                {!!worker.communicationLanguages.length && (
                    <div className={listItemClassName}>
                        <Ico.LANGUAGE size={iconSize}></Ico.LANGUAGE>
                        <span>
                            <span>Języki: </span>
                            {worker.communicationLanguages.map(lang => <DictionaryDisplay dictionary="LANGUAGES" value={lang}></DictionaryDisplay>)}
                        </span>
                    </div>
                )}

            </div>

            {worker.certificates?.length && (
                <div className="mb-10 px-5">
                    <div className="secondary-text">Uprawnienia:</div>

                    {worker.certificates.map((cert, index) => (<div className="pl-5 pt-3 flex items-center gap-2" key={index}>
                        <Ico.CHECK className="secondary-text"></Ico.CHECK>
                        <DictionaryDisplay dictionary="CERTIFICATES" value={cert}></DictionaryDisplay>
                    </div>))}

                </div>
            )}

            {/* TODO show if worker experience exists */}
            <div className="mb-10 px-5">
                <div className="secondary-text">Umiejętności / doświadczenie:</div>
                {[
                    "mycie elewacji",
                    "montaż reklam",
                    "serwis turbin wiatrowych",
                    "spawanie na wysokości"
                ].map((cert, index) => (<div className="pl-5 pt-2 flex items-center gap-2" key={index}>
                    <Ico.CHECK className="secondary-text"></Ico.CHECK>
                    <span className="">{cert}</span>
                </div>))}

            </div>

            <div className="px-5 mb-10">
                <PositionWidget position={worker.geocodedPosition || null}></PositionWidget>
            </div>

            <FloatingActionButton onClick={openChat} icon={<Ico.MSG size={32} />}></FloatingActionButton>
        </div>
    );
}

// TODO 
// PORTFOLIO (game changer)
// [zdjęcie] [zdjęcie] [zdjęcie]

// 💡 UX trick:

// grid 2x2
// klik = fullscreen

export default WorkerView;