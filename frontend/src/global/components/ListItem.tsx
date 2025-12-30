import React from "react";

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
            {imgUrl && <div className="list-view-item-img">
                <img src={imgUrl} alt="Avatar" className="w-14 h-14 rounded-full object-cover" />
            </div>}

            <div className="w-full flex flex-col justify-center gap-1">

                {/* TODP */}
                <div className="flex justify-between ">
                    <div className="btn-font primary-text">{topLeft}</div>
                    {topRight}
                </div>

                {/* BOTTOM */}
                <div className="flex justify-between">
                    <div className="small-font secondary-text">{bottomLeft}</div>
                    {bottomRight}
                </div>

            </div>
        </div>
    )
}

export default ListItem;