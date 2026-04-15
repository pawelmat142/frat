import { MenuItemIdentifier } from "global/interface/controls.interface";

/**
 * Navigation event bus — emitted by MenuProvider on every nav item click.
 * Any overlay/pseudoview can subscribe and close itself when navigation occurs.
 */
export type NavItem = string;
type NavListener = (item: MenuItemIdentifier) => void;

const navListeners = new Set<NavListener>();

export const NavBus = {
    
    emit: (item: MenuItemIdentifier): void => {
        navListeners.forEach(fn => {
            return fn(item)
        });
    },

    subscribe: (fn: NavListener): (() => void) => {
        navListeners.add(fn);
        return () => navListeners.delete(fn);
    },
};
