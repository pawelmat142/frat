import React from "react";

interface Props {
    imgUrl?: string;
    component?: React.ReactNode;
    size?: number //rem
}

const ListItemImg: React.FC<Props> = ({ imgUrl, component, size = 3.5 }) => {

    if (!imgUrl && !component) return null;

    if (component) return <div className="list-view-item-icon">{component}</div>;

    return (
        <div className="list-view-item-img">
            <img src={imgUrl}
                style={{ width: `${size}rem`, height: `${size}rem` }}
                alt="Avatar"
                className="rounded-full object-cover" />
        </div>
    )
}

export default ListItemImg;