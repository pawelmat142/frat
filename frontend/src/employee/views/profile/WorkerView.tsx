import React, { useEffect, useId, useState } from "react";

import { WorkerService } from "employee/services/WorkerService";
import Loading from "global/components/Loading";
import { useNavigate, useParams } from "react-router-dom";
import { WorkerAvailabilityOptions, WorkerI, WorkerStatuses } from "@shared/interfaces/WorkerI";
import { useWorkersSearch } from "../search/WorkersSearchProvider";
import { useTranslation } from "react-i18next";
import { Path } from "../../../path";
import { MenuConfig } from "global/components/selector/MenuItems";
import { toast } from "react-toastify";
import { useConfirm } from "global/providers/PopupProvider";
import { useUserContext } from "user/UserProvider";
import { ChatService } from "chat/services/ChatService";
import PositionWidget from "employee/components/PositionWidget";
import { Ico } from "global/icon.def";
import DateDisplay from "global/components/ui/DateDisplay";
import { useIsDesktop } from "global/hooks/isMobile";
import DictionaryDisplay from "global/components/ui/DictionaryDisplay";
import FloatingActionButton from "global/components/buttons/FloatingActionButton";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { AVATAR_MOCK } from "user/components/AvatarTile";
import { AppConfig } from "@shared/AppConfig";
import { PositionUtil } from "@shared/utils/PositionUtil";
import WorkerSkillsSection from "employee/components/WorkerSkillsSection";
import WorkerImagesSection from "employee/components/WorkerImagesSection";
import ListUi from "global/components/ui/ListUi";
import ChecklistUi from "global/components/ui/ChecklistUi";
import { BtnModes, BtnSizes, MenuItem } from "global/interface/controls.interface";
import Button from "global/components/controls/Button";
import { UserListedItemReferenceTypes, UserListedItemTypes } from "@shared/interfaces/UserListedItem";
import { UserListedItemService } from "user/services/UserListedItemService";
import Header from "global/components/Header";
import WorkerStatItems from "employee/components/WorkerStatItems";
import CategoriesChips from "global/components/chips/CategoriesChips";

const WorkerView: React.FC = () => {

    const params = useParams<{ displayName?: string }>()
    const displayName = params.displayName

    const [loading, setLoading] = useState(false)
    const [worker, setProfile] = useState<WorkerI | null>(null)
    const [hideFloatingBtn, setHideFloatingBtn] = useState(false);

    const { t } = useTranslation();
    const navigate = useNavigate();
    const confirm = useConfirm();
    const userCtx = useUserContext();
    const globalCtx = useGlobalContext();
    const me = userCtx?.me;
    const fabId = useId();

    const profileCtx = useWorkersSearch();
    const isDesktop = useIsDesktop();

    const isMe = me?.uid === worker?.uid;
    const isSavedOnList = (userCtx.meCtx?.listedItems ?? [])
        .some(item => item.reference === worker?.workerId?.toString() && item.referenceType === UserListedItemReferenceTypes.WORKER);

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
        if (!worker || isMe) return;
        globalCtx.setFloatingButton(
            <FloatingActionButton
                forceVisible={!hideFloatingBtn}
                onClick={openChat}
                icon={<Ico.MSG size={AppConfig.FAB_BTN_ICON_SIZE} />}
            />,
            fabId
        );
    }, [worker, isMe, hideFloatingBtn]);

    useEffect(() => {
        return () => globalCtx.setFloatingButton(null);
    }, []);

    const goToUserProfile = () => {
        if (!worker) return;
        navigate(Path.getProfilePath(worker?.uid));
    }

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
            if (isSavedOnList) {
                menu.items.push({
                    label: t('user.removeFromList'),
                    onClick: removeListItem
                })
            } else {
                menu.items.push({
                    label: t('user.addToList'),
                    onClick: addListItem
                })
            }
        }
        menu.items.push({
            label: t('user.openProfile'),
            onClick: goToUserProfile
        })
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
        if (me && profile?.uid) {
            await WorkerService.notifyWorkerView(profile.workerId)
        }
    }

    const _setProfile = (profile: WorkerI | null) => {
        setProfile(profile)
        if (profile) {
            notifyProfileView(profile)
        }
    }

    const getDistanceInfo = (): string => {
        if (!worker?.point) {
            return '';
        }

        const distanceInfo = userCtx.getDistanceInfo(PositionUtil.fromGeoPoint(worker.point));
        if (!distanceInfo) {
            return '';
        }

        return `(${distanceInfo} ${t('others.away')})`;
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

    const getWorksInIndustry = () => {
        if (!worker.careerStartDate) {
            return null;
        }
        const start = new Date(worker.careerStartDate);
        const now = new Date();
        const years = now.getFullYear() - start.getFullYear();

        if (years > 2) {
            return t('employeeProfile.worksInIndurstryYears', { years });
        }
        const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        return t('employeeProfile.worksInIndurstryMonths', { months });
    }

    const worksInIndurstry = getWorksInIndustry();

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
                toast.error("Nie można dodać tego wpisu do listy");
                return;
            }
            userCtx.updateMeCtx({
                ...meCtx,
                listedItems: [...(meCtx.listedItems ?? []), item]
            });
            toast.success("Dodano wpis do Twojej listy");
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
            toast.success("Usunięto wpis z Twojej listy");
        }
        finally {
            setLoading(false);
        }
    }

    const getListItems = (): MenuItem[] => {
        return [{
            if: isAnytime,
            label: t('others.availableAnytime'),
            icon: Ico.CALENDAR
        }, {
            if: !isAnytime && worker.startDate,
            label: `${t('others.availableFrom')} ${DateDisplay({
                date: new Date(worker.startDate!),
                showYear: false, t
            })}`,
            icon: Ico.CALENDAR,
            onClick: onAvailabilityClick
        }, {
            if: worker.geocodedPosition?.fullAddress,
            label: `${worker.geocodedPosition?.fullAddress} ${getDistanceInfo()}`,
            icon: Ico.MARKER
        }, {
            if: worker.phoneNumber,
            label: `${t('employeeProfile.form.phoneNumber')}: ${worker.phoneNumber.prefix} ${worker.phoneNumber.number}`,
            icon: Ico.PHONE,
            onClick: openPhoneCall
        }, {
            label: `${t("employeeProfile.form.email")}: ${worker.email}`,
            icon: Ico.EMAIL
        }, {
            if: worksInIndurstry,
            label: worksInIndurstry,
            icon: Ico.CLOCK
        }, {
            if: worker.maxAltitude,
            label: `${t('employeeProfile.form.career.maxAltitudeShort')}: ${worker.maxAltitude}[m]`,
            icon: Ico.RULER
        }, {
            if: typeof worker.readyToTravel === 'boolean',
            label: `${t('employeeProfile.form.career.readyToTravel')}: ${worker.readyToTravel ? t('common.yes') : t('common.no')}`,
            icon: Ico.COMPASS
        }, {
            if: !!worker.communicationLanguages.length,
            label: `${t('others.languages')}: ${worker.communicationLanguages.map(lang => DictionaryDisplay({ dictionary: "LANGUAGES", value: lang, t }))}`,
            icon: Ico.LANGUAGE
        }];
    }

    return (<>
        <Header title={t('employeeProfile.title')} menu={getProfileMenuItems(worker)}></Header>

        <div className="w-full flex flex-col flex-1">

            <div className="flex gap-5 items-center px-5 flex-1">

                <div className="worker-avatar" onClick={goToUserProfile}>
                    <img src={worker.avatarRef?.url || AVATAR_MOCK} alt={worker.displayName} />
                </div>

                <div className="worker-profile-top">
                    <div className="worker-profile-top-row one">
                        <CategoriesChips categories={worker.categories} />
                    </div>
                    <div className="worker-profile-top-row two">
                        <div>
                            <div className="l-font font-semibold">{worker.displayName}</div>
                            <div className="s-font secondary-text">{worker.email}</div>
                        </div>
                    </div>
                    <div className="worker-profile-top-row three">
                        <WorkerStatItems worker={worker} />
                    </div>
                </div>

            </div>

            {!isMe && <div className="flex justify-end">

                {isSavedOnList ? (
                    <Button onClick={removeListItem}
                        mode={BtnModes.PRIMARY_TXT} size={BtnSizes.SMALL} className="gap-2">
                        <Ico.BOOKMARK size={14} />
                        {t('user.removeFromList')}
                    </Button>
                ) : (
                    <Button onClick={addListItem}
                        mode={BtnModes.PRIMARY_TXT} size={BtnSizes.SMALL} className="gap-2">
                        <Ico.BOOKMARK size={14} />
                        {t('user.addToList')}
                    </Button>
                )}
            </div>}

            <div className="mb-5 mt-5">
                <ListUi items={getListItems()}></ListUi>
            </div>

            <ChecklistUi icon={Ico.CHECK} title={t('employeeProfile.form.certificates.title')}
                items={worker.certificates?.map(cert => ({ label: DictionaryDisplay({ dictionary: "CERTIFICATES", value: cert, t }) })) || []}
            ></ChecklistUi>

            <WorkerSkillsSection worker={worker} />

            <WorkerImagesSection worker={worker} onWorkerUpdate={_setProfile} onOpenCloseLightbox={(open) => {
                setHideFloatingBtn(open);
            }} />

            <div className="px-5 mb-10">
                <PositionWidget position={worker.geocodedPosition || null}></PositionWidget>
            </div>

        </div>
    </>);
}

export default WorkerView;