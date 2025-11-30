import { MenuItem } from "global/interface/controls.interface";

export interface MenuConfig {
    items: MenuItem[]
    title?: string;
    onClose?: () => void;
}

const MenuItems = ({
    items,
    title,
    onClose,
}: MenuConfig) => {

    const handleItemClick = (item: MenuItem) => {
        item.onClick?.();
        if (!item.onClick) {
            onClose?.();
        }
    }

    return (
        <>
            <div className="bottom-sheet-content">
                {items.map((item, index) => {
                    return (
                        <div
                            key={index}
                            className={`bottom-sheet-item ripple`}
                            onClick={() => handleItemClick(item)}
                        >
                            <div className="bottom-sheet-item-content">
                                {item.icon && (
                                    <span className="bottom-sheet-item-icon">{item.icon}</span>
                                )}
                                {item.src && (
                                    <img
                                        src={item.src}
                                        alt={item.label}
                                        className="bottom-sheet-item-image"
                                    />
                                )}
                                <span className="bottom-sheet-item-label">{item.label}</span>
                            </div>
                        </div>
                    )
                }
                )}
            </div>
        </>
    )
}

export default MenuItems;