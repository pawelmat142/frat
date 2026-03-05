import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { UserI } from '@shared/interfaces/UserI';
import { toast } from 'react-toastify';
import { UserPublicService } from 'user/services/UserPublicService';
import { useTranslation } from 'react-i18next';

interface UsersStorageContextType {
    getUser: (uid: string) => Promise<UserI | null>;
    getUsers: (uids: string[]) => Promise<UserI[]>;
}

const UsersStorageContext = createContext<UsersStorageContextType | undefined>(undefined);

export const UsersStorageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const { t } = useTranslation();

    // Mapa użytkowników - klucz to uid
    const [usersMap, setUsersMap] = useState<Map<string, UserI>>(new Map());

    const getUser = useCallback(async (uid: string): Promise<UserI | null> => {
        // Sprawdź czy użytkownik już jest w cache
        if (usersMap.has(uid)) {
            return usersMap.get(uid)!;
        }

        const fetchedUser = await fetchUser(uid);
        if (fetchedUser) {
            setUsersMap(prev => {
                prev.set(uid, fetchedUser)
                return prev
            });
            return fetchedUser;
        }

        return null;
    }, [usersMap]);

    const getUsers = useCallback(async (uids: string[]): Promise<UserI[]> => {
        const storedUsers: UserI[] = [];
        const uidsToFetch: string[] = [];

        // Sprawdź które użytkownicy są już w cache
        uids.forEach(uid => {
            if (usersMap.has(uid)) {
                storedUsers.push(usersMap.get(uid)!);
            } else {
                uidsToFetch.push(uid);
            }
        });


        let fetchedUsers: UserI[] = [];

        if (uidsToFetch.length) {
            fetchedUsers = await fetchUsers(uidsToFetch);
            setUsersMap(prev => {
                fetchedUsers.forEach(user => {
                    prev.set(user.uid, user);
                })
                return new Map(prev);
            })
        }

        return [...storedUsers, ...fetchedUsers];
    }, [usersMap]);

    const fetchUser = async (uid: string): Promise<UserI | null> => {
        try {
            const result = await UserPublicService.fetchUser(uid);
            return result;
        } catch (error) {
            toast.error(t('user.error.notFound'));
            return null;
        }
    }

    const fetchUsers = async (uids: string[]): Promise<UserI[]> => {
        try {
            const result = await UserPublicService.fetchUsers(uids);
            return result;
        } catch (error) {
            toast.error(t('user.error.notFound'));
            return [];
        }
    }

    return (
        <UsersStorageContext.Provider value={{
            getUser,
            getUsers
        }}>
            {children}
        </UsersStorageContext.Provider>
    );
};

/**
 * Hook do dostępu do kontekstu przechowywania użytkowników
 */
export const useUsersStorage = (): UsersStorageContextType => {
    const context = useContext(UsersStorageContext);
    if (context === undefined) {
        throw new Error('useUsersStorage must be used within UsersStorageProvider');
    }
    return context;
};