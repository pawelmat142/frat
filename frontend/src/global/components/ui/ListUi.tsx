import { Ico } from "global/icon.def";
import { MenuItem } from "global/interface/controls.interface";

interface Props {
    items: MenuItem[];
    className?: string;
    itemClassName?: string;
}

const ListUi: React.FC<Props> = ({ items, className, itemClassName }) => {

    if (!items.length) {
        return null;
    }

    const iconSize = `1.2rem`;

    const getRightIcon = (item: MenuItem) => {
        if (item.rightIcon) {
            return <span className="ml-auto secondary-text"><item.rightIcon /></span>;
        }
        if (item.onClick) {
            return <span className="ml-auto secondary-text"><Ico.CHEVRON_RIGHT /></span>;
        }
        return null;
    }

    const onItemClick = (e: React.MouseEvent, item: MenuItem) => {
        if (!item.onClick) {
            return;
        }
        item.onClick?.(e);
    }

    const defaultClassName = "flex gap-4 px-5 py-2 items-center s-font"

    return (
        <div className={className ? className : ""}>
            {items.filter(item => item.if === undefined || !!item.if).map((item, index) => {

                const _itemClassName = `${defaultClassName}${item.onClick ? " ripple" : ""}${item.className ? ` ${item.className}` : ""}${itemClassName ? ` ${itemClassName}` : ""}`;

                return <div key={index} className={_itemClassName} onClick={(e) => onItemClick(e, item)}>

                    {item.icon && <item.icon size={iconSize} />}

                    <span>{item.label}</span>

                    {getRightIcon(item)}

                </div>
            })}
        </div>
    )
};

export default ListUi;
