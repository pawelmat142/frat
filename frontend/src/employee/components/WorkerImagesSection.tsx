import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { WorkerI } from "@shared/interfaces/WorkerI";
import { AvatarRef } from "@shared/interfaces/UserI";
import { Ico } from "global/icon.def";
import { useUserContext } from "user/UserProvider";
import { FileUtil } from "global/utils/FileUtil";
import { WorkerService } from "employee/services/WorkerService";
import { toast } from "react-toastify";
import { AnimatePresence } from "framer-motion";
import Loading from "global/components/Loading";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { CloudinaryService } from "user/services/CloudinaryService";
import { CloudinaryFolderNames, CloudinaryTags } from "@shared/utils/CloudinaryUtil";
import { useWorkerContext } from "employee/WorkerProvider";
import Lightbox from "global/components/img/LightBox";
import { useConfirm } from "global/providers/PopupProvider";
import LongTapHandler from "global/components/LongTapHandler";

interface Props {
    worker: WorkerI;
    onWorkerUpdate?: (updated: WorkerI) => void;
}

interface PendingImage {
    file: File;
    previewUrl: string;
}

const MAX_IMAGES = 6;
const HOLD_MS = 600;

// TODO wyciagnac do komponentu efekt z lightboxa - pseudowidok - bez nawigacji
// TODO reuzyc efekt psudowidoku do datepickera duzego 
// TODO reuzyc efekt pseudowidoku do filtrow worker i oferty

const WorkerImagesSection: React.FC<Props> = ({ worker }) => {
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const workerCtx = useWorkerContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [pending, setPending] = useState<PendingImage | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const confirm = useConfirm();

    const me = userCtx.me;
    const isMyProfile = me?.uid === worker.uid;

    const savedImages: AvatarRef[] = workerCtx.worker?.images ?? worker.images ?? [];
    const canAddMore = savedImages.length < MAX_IMAGES;

    const allDisplayUrls = [
        ...savedImages.map((img) => img.url),
        ...(pending ? [pending.previewUrl] : []),
    ];

    if (!savedImages.length && !isMyProfile) {
        return null;
    }

    const openFilePicker = () => {
        if (!canAddMore || pending) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        const error = FileUtil.validateImage(file);
        if (error) {
            toast.error(t(error, { allowed: FileUtil.ALLOWED_IMAGE_EXTENSIONS.join(', '), max: FileUtil.MAX_FILE_SIZE_MB }));
            return;
        }

        setLoading(true);
        try {
            const optimized = await FileUtil.resizeForMobile(file);
            const previewUrl = URL.createObjectURL(optimized);
            setPending({ file: optimized, previewUrl });
        } catch {
            toast.error(t('error.imageProcessingFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleCancelPending = () => {
        if (pending) URL.revokeObjectURL(pending.previewUrl);
        setPending(null);
    };

    const handleSave = async () => {
        if (!pending) return;

        try {
            setSaving(true);
            setLoading(true);

            // Upload to Cloudinary
            const folder = `${CloudinaryFolderNames.WORKER_PROFILE}/${worker.uid}`;
            const tags = [
                CloudinaryTags.WORKER_PROFILE,
                CloudinaryTags.uid(worker.uid)
            ]
            const avatarRef = await CloudinaryService.uploadImage(pending.file, folder, tags);
            await WorkerService.addImage(avatarRef);
            await workerCtx.initWorker();
        } finally {
            setSaving(false);
            setLoading(false);
        }
        handleCancelPending();
    };

    const handleRemove = async (publicId: string) => {
        try {
            setLoading(true);
            await WorkerService.removeImage(publicId);
            await workerCtx.initWorker();
        } catch {
            toast.error(t('error.imageRemoveFailed'));
        }
        finally {
            setLoading(false);
        }
    };

    const confirmRemove = async (publicId: string) => {
        const ok = await confirm({
            title: t('gallery.deleteTitle'),
            message: t('gallery.deleteMessage'),
        });
        if (ok) handleRemove(publicId);
    };

    const openLightbox = (index: number) => {
        if (allDisplayUrls.length > 0) {
            setLightboxIndex(index);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="mb-10 px-5">
            <div className="secondary-text mb-3">{t('gallery.title')}</div>

            <div className="grid grid-cols-2 gap-2">
                {/* Saved images */}
                {savedImages.map((img, i) => (
                    isMyProfile ? (
                        <LongTapHandler
                            key={img.publicId}
                            className="relative aspect-square tile-radius overflow-hidden secondary-bg cursor-pointer select-none"
                            holdMs={HOLD_MS}
                            onTap={() => openLightbox(i)}
                            onLongTap={() => confirmRemove(img.publicId)}
                        >
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </LongTapHandler>
                    ) : (
                        <div
                            key={img.publicId}
                            className="relative aspect-square tile-radius overflow-hidden secondary-bg cursor-pointer"
                            onClick={() => openLightbox(i)}
                        >
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </div>
                    )
                ))}

                {/* Pending image (not yet saved) */}
                {pending && (
                    <div className="relative aspect-square tile-radius overflow-hidden secondary-bg">
                        <img
                            src={pending.previewUrl}
                            alt=""
                            className="w-full h-full object-cover opacity-70"
                        />
                        <div className="absolute inset-0 flex items-end justify-end p-2 gap-1">
                            <Button
                                mode={BtnModes.ERROR}
                                size={BtnSizes.SMALL}
                                disabled={saving}
                                onClick={handleCancelPending}
                                fullWidth
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                fullWidth
                                mode={BtnModes.PRIMARY}
                                size={BtnSizes.SMALL}
                                disabled={saving}
                                onClick={handleSave}
                            >
                                {saving ? '...' : t('common.save')}
                            </Button>
                        </div>
                    </div>
                )}

            </div>

            {isMyProfile && canAddMore && !pending && (
                <Button
                    mode={BtnModes.PRIMARY_TXT}
                    size={BtnSizes.SMALL}
                    className="ml-auto mt-3"
                    onClick={openFilePicker}
                >
                    <Ico.PLUS className="w-4 h-4" />
                    {t('gallery.addImage')}
                </Button>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept={FileUtil.ALLOWED_IMAGE_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
                onChange={handleFileChange}
                hidden
            />

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <Lightbox
                        images={allDisplayUrls}
                        startIndex={lightboxIndex}
                        onClose={() => setLightboxIndex(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default WorkerImagesSection;

