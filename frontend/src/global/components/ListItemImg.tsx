import React from "react";

interface Props {
    imgUrl?: string;
    size?: number //rem
}

const ListItemImg: React.FC<Props> = ({ imgUrl, size = 3.5 }) => {

    if (!imgUrl) return null;
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