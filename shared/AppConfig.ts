import { Position } from "./interfaces/MapsInterfaces";

export const AppConfig = {

    DEFAULT_LANG_CODE: 'en',

    // 50 km - used in offer and worker list to display "less than X km" instead of exact distance
    MINIMUM_DISTANCE_FOR_DISPLAY_METERS: 50000,
    // Gdańsk center as default point when user doesn't allow to access his location
    DEFAUT_POSITION: { lat: 54.3520, lng: 18.6466 } as Position,
    // used in worker search filters for position radius slider
    RADIUS_STEPS_KM: [50, 80, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 1000],

    CLOUDINARY_BASE_URL: 'https://api.cloudinary.com/v1_1',

    DEFAULT_AVATAR_SIZE: 3,
    DEFAULT_ICON_SIZE: 2,
    FAB_BTN_ICON_SIZE: 28,

    UPLOAD_IMG_ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    UPLOAD_IMG_MAX_SIZE_MB: 50, // input limit - accept large files, they will be compressed on output

    UPLOAD_IMG_MAX_PX: 1080, // for mobile gallery
    UPLOAD_IMG_QUALITY: 0.82, // for mobile gallery, starting quality; reduced iteratively to hit target size
    UPLOAD_IMG_TARGET_OUTPUT_SIZE_BYTES: 1 * 1024 * 1024, // 1 MB - max output file size after compression

    AVATAR_PLACEHOLDER: "/assets/img/default-avatar.png",

    ROUTER_ANIMATION_DURATION: 150, // ms
} as const;