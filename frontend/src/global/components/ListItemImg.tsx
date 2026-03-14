import React from "react";

interface Props {
    imgUrl?: string;
    component?: React.ReactNode;
    size?: number //rem
    iconOrAvatarBadge?: React.ReactNode
}

const ListItemImg: React.FC<Props> = ({ imgUrl, component, size = 3, iconOrAvatarBadge }) => {

    if (!imgUrl && !component) return null;

    if (component) return (<div className="list-view-item-icon badge-anchor">
        {iconOrAvatarBadge}
        {component}
        </div>);

    return (
        <div className="list-view-item-img badge-anchor">
            {iconOrAvatarBadge}
            <img src={imgUrl}
                style={{ width: `${size}rem`, height: `${size}rem` }}
                alt="Avatar"
                className="rounded-full object-cover" />
        </div>
    )
}

export default ListItemImg;