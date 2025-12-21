import React, { useState, useEffect } from "react";
import { EmployeeProfileI, EmployeeProfileStatuses } from "@shared/interfaces/EmployeeProfileI";
import Button from "global/components/controls/Button";
import { EmployeeProfilesAdminService } from "admin/services/EmployeeProfilesAdmin.service";
import { userAdminPanelContext } from "../AdminPanelProvider";
import Loading from "global/components/Loading";
import { BtnModes } from "global/interface/controls.interface";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";

interface SelectedProfileProps {
  profile: EmployeeProfileI | null;
}

const SelectedProfile: React.FC<SelectedProfileProps> = (props: SelectedProfileProps) => {
  const { profile } = props;

  const adminPanelCtx = userAdminPanelContext();
  const employeeProfiles = adminPanelCtx?.employeeProfiles;

  const [localProfile, setLocalProfile] = useState<EmployeeProfileI | null>(profile);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  if (!localProfile) {
    return (
      <div className="py-8 text-center secondary-text italic">No profile selected.</div>
    );
  }

  const isActive = localProfile.status === EmployeeProfileStatuses.ACTIVE;

  const handleActivation = async () => {
    if (!localProfile) return;
    try {
      setLoading(true);
      const updated = await EmployeeProfilesAdminService.activation(localProfile.employeeProfileId, isActive
        ? EmployeeProfileStatuses.INACTIVE
        : EmployeeProfileStatuses.ACTIVE);
      employeeProfiles?.initProfiles();
      setLocalProfile(updated);
    } finally {
      setLoading(false);
    }
  };

  const getActvationButton = () => {
    return (
      <Button
        onClick={handleActivation}
        mode={BtnModes.PRIMARY_TXT}
      >
        {isActive ? 'Deactivate' : 'Activate'}
      </Button>
    )
  }

  if (loading) {
    return <Loading></Loading>
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 mb-10 border border-color rounded-lg secondary-bg shadow p-5">
      <div className="flex justify-between items-center mb-6">
        <h3 className="h2 pl-2 primary-text">Employee Profile #{localProfile.employeeProfileId}</h3>
        {!!adminPanelCtx && getActvationButton()}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6">
        <div className="flex flex-col gap-2">
          <div><span className="font-semibold secondary-text">UID:</span> <span className="primary-text font-mono">{localProfile.uid}</span></div>
          <div><span className="font-semibold secondary-text">Status:</span> <span className="primary-text">{localProfile.status}</span></div>
          <div><span className="font-semibold secondary-text">Display Name:</span> <span className="primary-text">{localProfile.displayName}</span></div>
          <div><span className="font-semibold secondary-text">Email:</span> <span className="primary-text">{localProfile.email}</span></div>
          <div><span className="font-semibold secondary-text">First Name:</span> <span className="primary-text">{localProfile.firstName}</span></div>
          <div><span className="font-semibold secondary-text">Last Name:</span> <span className="primary-text">{localProfile.lastName}</span></div>
          {/* <div><span className="font-semibold secondary-text">Residence Country:</span> <span className="primary-text">{localProfile.residenceCountry}</span></div> */}
        </div>
        <div className="flex flex-col gap-2">
          <div><span className="font-semibold secondary-text">Skills:</span> <span className="primary-text">{localProfile.skills?.join(", ") || '-'}</span></div>
          <div><span className="font-semibold secondary-text">Certificates:</span> <span className="primary-text">{localProfile.certificates?.join(", ") || '-'}</span></div>
          <div><span className="font-semibold secondary-text">Languages:</span> <span className="primary-text">{localProfile.communicationLanguages?.join(", ") || '-'}</span></div>
          <div><span className="font-semibold secondary-text">Location Option:</span> <span className="primary-text">{localProfile.locationOption}</span></div>
          <div><span className="font-semibold secondary-text">Location Countries:</span> <span className="primary-text">{localProfile.locationCountries?.join(", ") || '-'}</span></div>
          <div><span className="font-semibold secondary-text">Address:</span> <span className="primary-text">{localProfile.fullAddress || '-'}</span></div>
          <div><span className="font-semibold secondary-text">Point Radius:</span> <span className="primary-text">{localProfile.pointRadius ?? '-'} km</span></div>
          <div><span className="font-semibold secondary-text">Availability Option:</span> <span className="primary-text">{localProfile.availabilityOption}</span></div>
        </div>
      </div>

      {localProfile.availabilityDateRanges && localProfile.availabilityDateRanges.length > 0 && (
        <div className="px-6 pb-4 mt-4">
          <div className="font-semibold secondary-text mb-2">Availability Date Ranges:</div>
          <div className="flex flex-col gap-2">
            {localProfile.availabilityDateRanges.map((range) => {
              const parsed = DateRangeUtil.toDateRange(range);
              return (
                <div key={range.id} className="primary-text text-sm">
                  • {parsed?.start ? DateRangeUtil.displayLocalDate(parsed.start) : '-'}
                  {' → '}
                  {parsed?.end ? DateRangeUtil.displayLocalDate(parsed.end) : 'open-ended'}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-6 pb-4 mt-2 text-xs secondary-text">Created: {localProfile.createdAt ? new Date(localProfile.createdAt).toLocaleString() : '-'}</div>
    </div>
  );
};

export default SelectedProfile;
