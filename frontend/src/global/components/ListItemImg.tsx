import React from "react";

interface Props {
    imgUrl?: string;
}

const ListItemImg: React.FC<Props> = ({ imgUrl }) => {

    if (!imgUrl) return null;
    return (
        <div className="list-view-item-img">
            <img src={imgUrl} alt="Avatar" className="rounded-full object-cover" />
        </div>
    )
}

export default ListItemImg;