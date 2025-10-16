import React, { useEffect, useState } from "react";
import Loading from "global/components/Loading";
import { UserI } from "@shared/interfaces/UserI";
import { useNavigate, useParams } from "react-router-dom";
import { UserPublicService } from "user/services/UserPublicService";
import { useAuthContext } from "auth/AuthProvider";
import Button from "global/components/controls/Button";
import { AuthService } from "auth/services/AuthService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Path } from "./../../path";

const ProfilePage: React.FC = () => {

    const { userI, loading, firebaseUser } = useAuthContext();
    const [user, setUser] = useState<UserI | null>(null);
    const { uid } = useParams<{ uid?: string }>();
    const [_loading, _setLoading] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        const initUser = async () => {
            if (uid) {
                if (uid === userI?.uid) {
                    setUser(userI);
                } else {
                    const _user = await UserPublicService.fetchUser(uid);
                    setUser(_user);
                }
            }
        }

        initUser();
    }, [uid]);

    if (loading || _loading) {
        return <Loading />;
    }

    const sendVerificationEmail = async () => {
        _setLoading(true);
        try {
            await AuthService.sendVerificationEmail();
            toast.success(t('signup.verificationEmailSent'));
        } catch (error) { } finally {
            _setLoading(false);
        }
    }

    // Show warning if email not verified
    const emailNotVerifiedWarning = !firebaseUser?.emailVerified ? (
        <div className="mb-6 p-4 rounded border border-red-400 bg-red-50 text-red-700 text-center flex flex-col items-center">
            <div className="font-bold mb-2">Email Verification Required</div>
            <div className="mb-2">You need to verify your email address to access all features.</div>
            <Button
                className="mx-auto"
                onClick={sendVerificationEmail}
            >Resend verification email</Button>
        </div>
    ) : null;

    if (!user) {
        return <div className="p-5 text-center secondary-text">User not found.</div>;
    }

    return (
        <div className="flex flex-col gap-6 w-full px-5 pb-20 pt-10 max-w-xl mx-auto">
            {emailNotVerifiedWarning}
            <h2 className="text-2xl font-bold mb-6 primary-text">Profile</h2>
            <div className="rounded-lg shadow border border-color p-6 bg-white">
                <div className="flex flex-col gap-3">
                    <div><span className="font-semibold">UID:</span> {user.uid}</div>
                    <div><span className="font-semibold">Display Name:</span> {user.displayName}</div>
                    <div><span className="font-semibold">Email:</span> {user.email}</div>
                    <div><span className="font-semibold">Status:</span> {user.status}</div>
                    <div><span className="font-semibold">Roles:</span> {user.roles.join(", ")}</div>
                    <div><span className="font-semibold">Provider:</span> {user.provider}</div>
                    <div><span className="font-semibold">Verified:</span> {user.verified ? "Yes" : "No"}</div>
                    {user.photoURL && (
                        <div>
                            <span className="font-semibold">Photo:</span><br />
                            <img src={user.photoURL} alt="User avatar" className="mt-2 rounded-full w-24 h-24 object-cover border" />
                        </div>
                    )}
                </div>

                <div className="flex gap-5 mt-10">
                    <Button onClick={() => {
                        AuthService.logout()
                    }}>Logout</Button>

                    <Button onClick={() => {
                        navigate(Path.EMPLOYEE_PROFILE_FORM)
                    }}>{t('employeeProfile.create')}</Button>

                </div>

            </div>
        </div>
    );
};

export default ProfilePage;
