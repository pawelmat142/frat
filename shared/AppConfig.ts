import { Position } from "./interfaces/MapsInterfaces";
import { OfferSearchSortOptions } from "./interfaces/OfferI";
import { WorkerSearchSortOptions } from "./interfaces/WorkerI";

export const AppConfig = {

    DEFAULT_LANG_CODE: 'en',

    // 50 km - used in offer and worker list to display "less than X km" instead of exact distance
    MINIMUM_DISTANCE_FOR_DISPLAY_METERS: 50000,
    MAP: {
        // Gdańsk center as default point when user doesn't allow to access his location
        DEFAUT_POSITION: { lat: 54.3520, lng: 18.6466 } as Position,
        // used in worker search filters for position radius slider
        RADIUS_STEPS_KM: [50, 80, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
    },

    CLOUDINARY_BASE_URL: 'https://api.cloudinary.com/v1_1',

    UPLOAD_IMG: {
        ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        MAX_SIZE_MB: 50, // input limit - accept large files, they will be compressed on output
        MAX_PX: 1080, // for mobile gallery
        QUALITY: 0.82, // for mobile gallery, starting quality; reduced iteratively to hit target size
        TARGET_OUTPUT_SIZE_BYTES: 1 * 1024 * 1024, // 1 MB - max output file size after compression
    },

    CHAT_MAX_IMAGE_STORAGE_MB: 500, // max total image storage per conversation

    ICON: {
        SIZE: {
            DEFAULT: 2, // rem
            FAB_BTN: 28, // rem
        }
    },

    AVATAR: {
        DEFAULT_COLOR: '#6B7280', // neutral gray fallback

        COLOR_BY_CATEGORY: {
            ONSHORE: '#f97316',    // orange (distinct)
            OFFSHORE: '#059669',   // emerald green (distinct from blue)
            WIND: '#4338ca',       // indigo/purple (distinct)
        },

        SIZE: {
            DEFAULT: 3.5, // in rem
            BIG: 6, // in rem
        },

        PLACEHOLDER: "/assets/img/default-avatar.png",
    },

    IMG_PLACEHOLDER: "/assets/img/img-placeholder.png",

    ROUTER_ANIMATION_DURATION: 150, // ms

    CONTEXT_MENU: {
        WIDTH: 180, // px
        ITEM_HEIGHT: 40, // px
        PADDING: 8, // px
        ANIMATION_DURATION: 120, // ms
    },

    DEFAULT_WORKER_SEARCH_SORT_OPTION: WorkerSearchSortOptions.MUTUAL_FRIENDS,
    DEFAULT_OFFER_SEARCH_SORT_OPTION: OfferSearchSortOptions.DISTANCE_ASC,

    DASHBOARD: {
        MOBILE_LIMIT: 3,
        DESKTOP_LIMIT: 5,
    },
} as const;