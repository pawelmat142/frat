import React from "react";
import ListItemImg from "./ListItemImg";

interface Props {
    imgComponent?: React.ReactNode
    imgUrl?: string;
    topLeft: React.ReactNode
    topRight?: React.ReactNode
    bottomLeft: React.ReactNode
    bottomRight?: React.ReactNode
    first?: boolean
    last?: boolean

    rightSection?: React.ReactNode
    iconOrAvatarBadge?: React.ReactNode
}

const ListItem: React.FC<Props> = ({
    imgComponent,
    imgUrl,
    topLeft,
    topRight,
    bottomLeft,
    bottomRight,
    first,
    last,
    rightSection,
    iconOrAvatarBadge
}) => {

    if (typeof topLeft === 'string') {
        topLeft = <span className="font-medium primary-text">{topLeft}</span>
    }
    return (
        <div className={`ripple list-view-item${first ? ' first' : ''}${last ? ' last' : ''}`}>
            <ListItemImg imgUrl={imgUrl} component={imgComponent} iconOrAvatarBadge={iconOrAvatarBadge}/>

            <div className="w-full flex flex-col justify-center">

                {/* TOP */}
                <div className="flex justify-between ">
                    {topLeft}
                    {topRight}
                </div>

                {/* BOTTOM */}
                <div className="flex justify-between">
                    {bottomLeft}
                    {bottomRight}
                </div>

            </div>
            {rightSection}
        </div>
    )
}

export default ListItem;