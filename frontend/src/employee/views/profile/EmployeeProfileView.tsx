import React, { useEffect, useState } from "react";

import { EmployeeProfileService } from "employee/services/EmployeeProfileService";
import Loading from "global/components/Loading";
import { useParams } from "react-router-dom";
import { EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI";
import { useEmployeeSearch } from "../search/EmployeeSearchProvider";
import AvatarTile from "./AvatarTile";
import CallendarTile from "./CallendarTile";

const EmployeeProfileView: React.FC = () => {

    const params = useParams<{ displayName?: string }>()
    const displayName = params.displayName
    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState<EmployeeProfileI | null>(null)

    const profileCtx = useEmployeeSearch();

    useEffect(() => {
        const initEmployeeProfile = async () => {
            if (displayName) {
                const p = profileCtx.results?.find(p => p.displayName === displayName)
                if (p) {
                    setProfile(p);
                    return;
                }
                try {
                    setLoading(true);
                    const result = await EmployeeProfileService.getEmployeeProfileByDisplayName(displayName)
                    setProfile(result);
                } finally {
                    setLoading(false);
                }
            }
        }
        initEmployeeProfile();
    }, []);


    if (loading) {
        return <Loading />;
    }
    if (!profile) {
        return <div className="py-8 text-center secondary-text italic">Profile not found.</div>;
    }



    return (
        <div className="view-container">

            <div>
                <div className="main-tiles">

                    <AvatarTile />

                    <CallendarTile profile={profile}></CallendarTile>

                    <div className="square-tile col-tile">a</div>

                    <div className="square-tile col-tile">a</div>

                </div>
            </div>

        </div>
    );
}

export default EmployeeProfileView;