import React, { useState } from "react";

interface AvatarTileProps {
    src?: string;
    alt?: string;
}

const DEFAULT_AVATAR = "/assets/img/avatar-mock.png";

const AvatarTile: React.FC<AvatarTileProps> = ({ src = DEFAULT_AVATAR, alt = "Avatar" }) => {

    return (
        <div className="square-tile col-tile avatar-tile">
            <img src={src} alt={alt} />
        </div>
    );
}

export default AvatarTile;