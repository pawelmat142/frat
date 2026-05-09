import React, { createContext, useContext, useEffect, useState } from "react";
import { FriendshipI } from "@shared/interfaces/FriendshipI";
import { FriendsService } from "friends/services/FriendsService";
import { friendsSocket } from "friends/services/FriendsSocketService";
import { useUserContext } from "user/UserProvider";

interface FriendsContextType {
    friendships: FriendshipI[];
    initFriendships: () => Promise<void>;
    cleanFriendships: () => void;
    putFriendship: (friendship: FriendshipI) => void;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const userCtx = useUserContext();
    const { me, meCtx } = userCtx;

    const [friendships, setFriendships] = useState<FriendshipI[]>([]);

    useEffect(() => {
        if (me) {
            onInit();
        } else {
            onDestroy();
        }
        return () => onDestroy();
    }, [me]);

    const onInit = () => {
        setFriendships(meCtx?.friendships || []);
        registerListeners();
    };

    const onDestroy = () => {
        unregisterListeners();
        setFriendships([]);
    };

    const initFriendships = async () => {
        if (!me?.uid) return;
        try {
            const result = await FriendsService.getFriendships(me.uid);
            setFriendships(result || []);
        } catch {
            setFriendships([]);
        }
    };

    const cleanFriendships = () => {
        setFriendships([]);
    };

    const putFriendship = (friendship: FriendshipI) => {
        setFriendships(prev => {
            const exists = prev.some(f => f.friendshipId === friendship.friendshipId);
            if (exists) {
                return prev.map(f => f.friendshipId === friendship.friendshipId ? friendship : f);
            }
            return [...prev, friendship];
        });
    };

    // Socket listeners
    const registerListeners = () => {
        friendsSocket.registerInviteListener(onInviteFriend);
        friendsSocket.registerRejectListener(onRejectInvite);
        friendsSocket.registerAcceptListener(onAcceptInvite);
        friendsSocket.registerRemoveListener(onRemoveFriend);
    };

    const unregisterListeners = () => {
        friendsSocket.unregisterInviteListener(onInviteFriend);
        friendsSocket.unregisterRejectListener(onRejectInvite);
        friendsSocket.unregisterAcceptListener(onAcceptInvite);
        friendsSocket.unregisterRemoveListener(onRemoveFriend);
    };

    const onInviteFriend = (friendship: FriendshipI) => {
        setFriendships(prev => {
            const exists = prev.some(f => f.friendshipId === friendship.friendshipId);
            if (exists) {
                return prev.map(f => f.friendshipId === friendship.friendshipId ? friendship : f);
            }
            return [...prev, friendship];
        });
    };

    const onRejectInvite = (friendship: FriendshipI) => {
        setFriendships(prev =>
            prev.map(f => f.friendshipId === friendship.friendshipId ? friendship : f)
        );
    };

    const onAcceptInvite = (friendship: FriendshipI) => {
        setFriendships(prev => {
            const filtered = prev.filter(f => f.friendshipId !== friendship.friendshipId);
            return [...filtered, friendship];
        });
    };

    const onRemoveFriend = (friendship: FriendshipI) => {
        setFriendships(prev =>
            prev.filter(f => f.friendshipId !== friendship.friendshipId)
        );
    };

    return (
        <FriendsContext.Provider value={{
            friendships,
            initFriendships,
            cleanFriendships,
            putFriendship,
        }}>
            {children}
        </FriendsContext.Provider>
    );
};

export const useFriendsContext = (): FriendsContextType => {
    const context = useContext(FriendsContext);
    if (!context) {
        throw new Error("useFriendsContext must be used within FriendsProvider");
    }
    return context;
};
