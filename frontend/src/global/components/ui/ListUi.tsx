import React from "react";
import { Ico } from "global/icon.def";
import { MenuGroup, MenuItem } from "global/interface/controls.interface";

interface Props {
    items?: MenuItem[];
    groups?: MenuGroup[];
    className?: string;
    itemClassName?: string;
}

const ListUi: React.FC<Props> = ({ items, groups, className, itemClassName }) => {

    const visibleGroups = (groups ?? [{ items: items ?? [] }])
        .map(group => ({
            ...group,
            items: group.items.filter(item => item.if === undefined || !!item.if),
        }))
        .filter(group => group.items.length > 0);

    if (!visibleGroups.length) {
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
            {visibleGroups.map((group, groupIndex) => (
                <React.Fragment key={groupIndex}>
                    {groupIndex > 0 && <div className="mx-5 my-2 border-t border-[var(--border-color)]" role="separator" />}
                    {group.title && <div className="secondary-text px-5 pt-3 text-sm font-medium">{group.title}</div>}
                    {group.items.map((item, index) => {

                        const _itemClassName = `${defaultClassName}${item.className ? ` ${item.className}` : ""}${itemClassName ? ` ${itemClassName}` : ""}`;

                        return <div key={index} className={`py-2${item.onClick ? " ripple" : ""}`} onClick={(e) => onItemClick(e, item)}>
                            <div className={_itemClassName}>

                                {item.icon && <item.icon size={iconSize} />}

                                {item.labelComponent ? item.labelComponent : <span>{item.label}</span>}

                                {getRightIcon(item)}

                            </div>

                            {!!item.list && (<ul className="xs-font view-margin ml-10 mt-1 list-disc">
                                {item.list.map((subItem, subIndex) => (
                                    <li key={subIndex} className="list-disc"> {subItem.label}</li>
                                ))}
                            </ul>)}


                        </div>
                    })}
                </React.Fragment>
            ))}
        </div>
    )
};

export default ListUi;
