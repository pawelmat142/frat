import React, { useEffect, useState } from "react";
import Loading from "global/components/Loading";
import { UserI } from "@shared/interfaces/UserI";
import { useParams } from "react-router-dom";
import { UserPublicService } from "user/services/UserPublicService";
import { useAuthContext } from "auth/AuthProvider";
import Buton from "global/components/controls/Buton";
import { AuthService } from "auth/services/AuthService";

const ProfilePage: React.FC = () => {

  const { userI, loading } = useAuthContext();
  const [user, setUser] = useState<UserI | null>(null);
  const { uid } = useParams<{ uid?: string }>();

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

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <div className="p-5 text-center secondary-text">User not found.</div>;
  }

  return (
    <div className="flex flex-col gap-6 w-full px-5 pb-20 pt-10 max-w-xl mx-auto">
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

        <Buton className="mx-auto" onClick={() => {
            AuthService.logout()
        }}>Logout</Buton>
      </div>
    </div>
  );
};

export default ProfilePage;
