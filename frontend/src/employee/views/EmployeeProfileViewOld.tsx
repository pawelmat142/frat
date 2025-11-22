import React, { useEffect } from "react";

import { EmployeeProfileService } from "employee/services/EmployeeProfileService";
import Loading from "global/components/Loading";
import { useParams } from "react-router-dom";
import SelectedProfile from "admin/views/employee_profiles/SelectedProfile";
import { EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI";
import BackBtn from "global/components/controls/BackBtn";

const EmployeeProfileViewOld: React.FC = () => {

    const params = useParams<{ displayName?: string }>();
    const displayName = params.displayName;
    const [loading, setLoading] = React.useState(false);
    const [profile, setProfile] = React.useState<EmployeeProfileI | null>(null);

    useEffect(() => {
        const initEmployeeProfile = async () => {
            if (displayName) {
                try {
                    setLoading(true);
                    const result = await EmployeeProfileService.getEmployeeProfileByDisplayName(displayName);
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

        <div className="mt-10">

            <BackBtn></BackBtn>
            <SelectedProfile profile={profile} />
        </div>
    );
}

export default EmployeeProfileViewOld;