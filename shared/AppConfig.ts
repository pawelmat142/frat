import { Position } from "./interfaces/MapsInterfaces";

export const AppConfig = {
    // 50 km - used in offer and worker list to display "less than X km" instead of exact distance
    MINIMUM_DISTANCE_FOR_DISPLAY_METERS: 50000,


    // Gdańsk center as default point when user doesn't allow to access his location
    DEFAUT_POSITION: { lat: 54.3520, lng: 18.6466 } as Position,
    
    
    // used in worker search filters for position radius slider
    RADIUS_STEPS_KM: [50, 80, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 1000],

    DEFAULT_LANG_CODE: 'en',

    DEFAULT_AVATAR_SIZE: 3,
    DEFAULT_ICON_SIZE: 2,
    FAB_BTN_ICON_SIZE: 28,

} as const;