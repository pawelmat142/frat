import React from "react";
import ListItemImg from "./ListItemImg";

interface Props {
    imgUrl?: string;
    topLeft: string
    topRight?: React.ReactNode
    bottomLeft: string
    bottomRight?: React.ReactNode
    first?: boolean
    last?: boolean
}

const ListItem: React.FC<Props> = ({ imgUrl, topLeft, topRight, bottomLeft, bottomRight, first, last }) => {

    return (
        <div className={`list-view-item${first ? ' first' : ''}${last ? ' last' : ''}`}>
            <ListItemImg imgUrl={imgUrl} />

            <div className="w-full flex flex-col justify-center">

                {/* TODP */}
                <div className="flex justify-between ">
                    <div className="btn-font primary-text">{topLeft}</div>
                    {topRight}
                </div>

                {/* BOTTOM */}
                <div className="flex justify-between">
                    <div className="small-font secondary-text mt-1">{bottomLeft}</div>
                    {bottomRight}
                </div>

            </div>
        </div>
    )
}

export default ListItem;