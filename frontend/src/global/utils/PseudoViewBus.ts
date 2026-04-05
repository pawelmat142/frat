/**
 * Lightweight pub/sub bus for coordinating PseudoView open/close across providers.
 * When one provider opens its PseudoView it emits its ID — all other subscribers
 * can react (e.g. close themselves).
 */

type PseudoViewListener = (openerId: string) => void;

const pseudoViewListeners = new Set<PseudoViewListener>();

export const PseudoViewBus = {
    emit: (openerId: string): void => {
        pseudoViewListeners.forEach(fn => fn(openerId));
    },
    subscribe: (fn: PseudoViewListener): (() => void) => {
        pseudoViewListeners.add(fn);
        return () => pseudoViewListeners.delete(fn);
    },
};

/**
 * Navigation event bus — emitted by MenuProvider on every nav item click.
 * Any overlay/pseudoview can subscribe and close itself when navigation occurs.
 */
export type NavItem = string;
type NavListener = (item: NavItem) => void;

const navListeners = new Set<NavListener>();

export const NavBus = {
    emit: (item: NavItem): void => {
        navListeners.forEach(fn => fn(item));
    },
    subscribe: (fn: NavListener): (() => void) => {
        navListeners.add(fn);
        return () => navListeners.delete(fn);
    },
};
