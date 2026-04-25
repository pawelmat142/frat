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

    const defaultClassName = "flex gap-4 view-margin  items-center s-font"

    return (
        <div className={className ? className : ""}>
            {items.filter(item => item.if === undefined || !!item.if).map((item, index) => {

                const _itemClassName = `${defaultClassName}${item.className ? ` ${item.className}` : ""}${itemClassName ? ` ${itemClassName}` : ""}`;

                return <div key={index} className={`py-2${item.onClick ? " ripple" : ""}`} onClick={(e) => onItemClick(e, item)}>
                    <div className={_itemClassName}>

                        {item.icon && <item.icon size={iconSize} />}

                        <span>{item.label}</span>

                        {getRightIcon(item)}

                    </div>

                    {!!item.list && (<ul className="xs-font view-margin ml-10 mt-1 list-disc">
                        {item.list.map((subItem, subIndex) => (
                            <li key={subIndex} className="list-disc"> {subItem.label}</li>
                        ))}
                    </ul>)}


                </div>
                
            })}
        </div>
    )
};

export default ListUi;
