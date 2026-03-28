import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuthContext } from 'auth/AuthProvider';
import { toast } from 'react-toastify';
import { Position } from '@shared/interfaces/MapsInterfaces';
import WebSocketService from 'global/web-socket/WebSocketService';
import { useTranslation } from 'react-i18next';
import { UserI } from '@shared/interfaces/UserI';
import { UserContextService } from './services/UserContextService';
import { defaultSettings, SettingsI, Theme, Themes } from '@shared/interfaces/SettingsI';
import { MeUserContext } from '@shared/interfaces/UserContext';
import { AuthService } from 'auth/services/AuthService';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';
import { SelectorItem } from 'global/interface/controls.interface';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from "global/providers/ThemeProvider";
import { SettingsService } from './services/SettingsService';
import { AppConfig } from '@shared/AppConfig';
import { PositionUtil } from '@shared/utils/PositionUtil';

interface UserContextType {
	me: UserI | null;
	meCtx: MeUserContext | null;
	settings: SettingsI;
	position: Position | null;

	updateMe: (user: UserI) => void;

	loading: boolean;
	setLoading: (loading: boolean) => void;
	selectLanguage: () => void;
	selectTheme: () => void;
	getDistanceInfo: (_position: Position) => string
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

	const { t, i18n } = useTranslation();
	const authCtx = useAuthContext();
	const bottomSheet = useBottomSheet()
	const { theme, setTheme } = useTheme();

	const [meCtx, setMeCtx] = useState<MeUserContext | null>(null)
	const [me, setMe] = useState<UserI | null>(null)
	const [settings, setSettings] = useState<SettingsI>(defaultSettings)

	const [loading, setLoading] = useState(false)

	const [position, setPosition] = useState<Position | null>(null)
	const [positionWatchId, setPositionWatchId] = useState<number | null>(null)

	useEffect(() => {
		const initUserContext = async () => {
			try {
				setLoading(true);
				const ctx = await UserContextService.getMeUserContext();
				setMeCtx(ctx);
				setMe(ctx.user);
				setSettings(ctx.settings);
				applySettingsWhenLogin(ctx.settings);
				initLocation(true);
				AuthService.saveTelegramLogin(ctx.user);
			} catch (error) {
				onDestroy();
				toast.error(t('user.error.userInitError'));
			} finally {
				setLoading(false);
				WebSocketService.getInstance().connect();
			}
		}

		if (authCtx.firebaseUser) {
			initUserContext();
		} else {
			onDestroy();
		}
		return () => {
			onDestroy();
		}
	}, [authCtx.firebaseUser])

	const onDestroy = () => {
		setMe(null);
		cleanPosition()
		WebSocketService.getInstance().disconnect();
		setLoading(false);
	}

	const updateMe = (user: UserI) => {
		setMe(user);
	}

	const initLocation = async (init?: boolean) => {
		try {
			const status = await navigator.permissions.query({ name: 'geolocation' });
			if (status.state === 'granted' || status.state === 'prompt') {

				// First, try to get a quick position (low accuracy, allow cache)
				navigator.geolocation.getCurrentPosition(
					(p) => {
						setPosition({
							lat: p.coords.latitude,
							lng: p.coords.longitude,
						});
					},
					(error) => {
						console.error("Geolocation error:", error.message);
					},
					{
						enableHighAccuracy: false,
						timeout: 5000,
						maximumAge: 300000, // Accept 5 min old cached position for quick start
					}
				);

				// Then watch for more accurate updates
				const watchId = navigator.geolocation.watchPosition(
					(p) => {
						const _position = {
							lat: p.coords.latitude,
							lng: p.coords.longitude,
						}
						setPosition(_position)
					},
					(error) => {
						if (error.code === 1) {
							locationErrorToast();
						}
						console.warn("Geolocation error:", error.message);
					},
					{
						enableHighAccuracy: true,
						timeout: 30000,           // Increased to 30s for high accuracy
						maximumAge: 60000         // Accept 1 min old position while waiting for fresh one
					}
				);
				setPositionWatchId(watchId);
			}
		} catch (error) {
			locationErrorToast();
		}
		finally {
			if (!init) {
				setLoading(false);
			}
		}
	}

	const cleanPosition = () => {
		setPosition(null);
		if (positionWatchId) {
			navigator.geolocation.clearWatch(positionWatchId!);
		}
	}

	const getDistanceInfo = (_position: Position): string => {
		if (!_position || !position) {
			return '';
		}
		const meters = PositionUtil.getDistanceFromToInMeters(position, _position);

		if (meters < AppConfig.MINIMUM_DISTANCE_FOR_DISPLAY_METERS) {
			return t("others.lessThan", { value: AppConfig.MINIMUM_DISTANCE_FOR_DISPLAY_METERS / 1000, unit: 'km' });
		}
		return `${PositionUtil.displayDistance(meters)}`;
	}

	const locationErrorToast = () => {
		toast.warn(t('common.others.fetchLocationError'));
	}

	const applySettingsWhenLogin = (settings: SettingsI) => {
		const langCode = settings?.languageCode;
		if (langCode) {
			i18n.changeLanguage(langCode);
		}

		const theme = settings?.theme;
		if (theme) {
			setTheme(theme);
		}
	}


	const selectLanguage = () => {
		bottomSheet.openDictionarySelector({
			title: i18n.t('lang.select'),
			translateItems: true,
			code: "LANGUAGES",
			groupCode: "TRANSLATIONS",
			selectedValues: [i18n.language],
			onSelect: async (item) => {
				if (item === i18n.language) return; // no change
				const langCode = String(item);
				if (!item) {
					throw new Error(t('lang.notDefined'));
				}
				await updateSettings({ ...settings, languageCode: langCode });
				i18n.changeLanguage(langCode);
				toast.success(t('lang.changedTo', { lang: langCode }));
			}
		})
	}

	const selectTheme = () => {
		const iconSize = `${AppConfig.DEFAULT_ICON_SIZE}rem`;

		const items: SelectorItem[] = Object.values(Themes).map(item => ({
			label: t(`theme.${item}`),
			value: item,
			icon: item.includes('light') ? <FaSun size={iconSize} /> : <FaMoon size={iconSize} />
		})) // translate labels
		bottomSheet.openSelector({
			title: t("theme.select"),
			selectedValues: [theme],
			items,
			onSelect: async (item) => {
				const newTheme = String(item) as Theme;
				if (newTheme === theme) return; // no change
				await updateSettings({ ...settings, theme: newTheme });
				setTheme(newTheme);
				toast.success(t('theme.changedTo', { theme: newTheme }));
			}
		})
	}

	const updateSettings = async (settings: SettingsI) => {
		if (!me) {
			return
		}
		try {
			const result = await SettingsService.updateSettings(settings);
			setSettings(result);
		} catch (error) {
			toast.error(t('error.settingsUpdate'));
		}

	}

	return (
		<UserContext.Provider value={{
			me,
			meCtx,
			settings: settings,
			updateMe,
			loading: loading,
			setLoading: setLoading,
			position,
			selectLanguage,
			selectTheme,
			getDistanceInfo
		}}>
			{children}
		</UserContext.Provider>
	);
};

/**
 * Hook do dostępu do kontekstu użytkownika
 */
export const useUserContext = (): UserContextType => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error('useUserContext must be used within UserProvider');
	}
	return context;
};