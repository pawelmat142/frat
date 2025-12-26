import React, { useEffect, useState } from "react";
import Loading from "global/components/Loading";
import { UserI } from "@shared/interfaces/UserI";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "auth/AuthProvider";
import Button from "global/components/controls/Button";
import { AuthService } from "auth/services/AuthService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";
import { UserPublicService } from "user/services/UserPublicService";
import AvatarTile from "user/components/AvatarTile";
import { Path } from "../../path";
import { BtnModes } from "global/interface/controls.interface";
import { FaBriefcase, FaIdCard } from "react-icons/fa";

const AccountPage: React.FC = () => {

    const { me, loading, firebaseUser } = useAuthContext();
    const { employeeProfile, offers } = useUserContext();
    const [user, setUser] = useState<UserI | null>(null);
    const { uid } = useParams<{ uid?: string }>();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [localLoading, setLocalLoading] = useState(true);

    const isMyAccount = uid === me?.uid;

    useEffect(() => {
        const initUser = async () => {
            if (uid) {
                if (uid === me?.uid) {
                    setUser(me);
                } else {
                    const _user = await UserPublicService.fetchUser(uid);
                    setUser(_user);
                }
            }
        }

        initUser();
    }, [uid, me]);

    useEffect(() => {
        setLocalLoading(loading);
    }, [loading]);

    if (localLoading) {
        return <Loading />;
    }

    const sendVerificationEmail = async () => {
        try {
            await AuthService.sendVerificationEmail();
            toast.success(t('signup.verificationEmailSent'));
        } catch (error) { } finally {
        }
    }

    // Show warning if email not verified
    const emailNotVerifiedWarning = isMyAccount && !firebaseUser?.emailVerified ? (
        <div className="mb-6 p-4 rounded border error-color text-center flex flex-col items-center">
            <div className="font-bold mb-2">{t('signup.emailVerificationRequired')}</div>
            <div className="mb-2">{t('signup.emailVerificationMessage')}</div>
            <Button
                className="mx-auto"
                onClick={sendVerificationEmail}
            >{t('signup.resendVerificationEmail')}</Button>
        </div>
    ) : null;

    if (!user) {
        return <div className="p-5 text-center secondary-text">{t('user.error.notFound')}</div>;
    }

    const goToEmployeeProfile = () => {
        if (employeeProfile) {
            navigate(Path.getEmployeeProfilePath(employeeProfile.displayName));
        } else {
            navigate(Path.EMPLOYEE_PROFILE_FORM);
        }
    };

    const goToMyOffers = () => {
        navigate(Path.getOffersPath(user.uid));
    };

    return (
        <div className="view-container">

            {emailNotVerifiedWarning}

            <div className="flex flex-col items-center gap-4 mb-6">
                <AvatarTile
                    editable={isMyAccount}
                    uid={user.uid}
                    src={user.avatarRef?.url}
                />

                <div className="text-center">
                    <h2 className="text-xl font-bold">{user.displayName}</h2>
                    <p className="secondary-text">{user.email}</p>
                </div>
            </div>

            {isMyAccount && (
                <div className="flex flex-col gap-3 mt-6">
                    <Button
                        fullWidth
                        mode={BtnModes.SECONDARY}
                        onClick={goToEmployeeProfile}
                    >
                        <FaIdCard className="mr-2" />
                        {employeeProfile
                            ? t('account.showEmployeeProfile')
                            : t('account.createEmployeeProfile')
                        }
                    </Button>

                    <Button
                        fullWidth
                        mode={BtnModes.SECONDARY}
                        onClick={goToMyOffers}
                    >
                        <FaBriefcase className="mr-2" />
                        {t('account.offers')} ({offers?.length || 0})
                    </Button>
                </div>
            )}

        </div>
    );
};

export default AccountPage;
