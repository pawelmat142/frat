import React, { useState, useEffect } from "react";
import { WorkerI, WorkerStatuses } from "@shared/interfaces/WorkerProfileI";
import Button from "global/components/controls/Button";
import { EmployeeProfilesAdminService } from "admin/services/EmployeeProfilesAdmin.service";
import { userAdminPanelContext } from "../AdminPanelProvider";
import Loading from "global/components/Loading";
import { BtnModes } from "global/interface/controls.interface";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";

interface SelectedProfileProps {
  profile: WorkerI | null;
}

const SelectedProfile: React.FC<SelectedProfileProps> = (props: SelectedProfileProps) => {
  const { profile } = props;

  const adminPanelCtx = userAdminPanelContext();
  const workers = adminPanelCtx?.workers;

  const [localWorker, setLocalWorker] = useState<WorkerI | null>(profile);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalWorker(profile);
  }, [profile]);

  if (!localWorker) {
    return (
      <div className="py-8 text-center secondary-text italic">No profile selected.</div>
    );
  }

  const isActive = localWorker.status === WorkerStatuses.ACTIVE;

  const handleActivation = async () => {
    if (!localWorker) return;
    try {
      setLoading(true);
      const updated = await EmployeeProfilesAdminService.activation(localWorker.workerId, isActive
        ? WorkerStatuses.INACTIVE
        : WorkerStatuses.ACTIVE);
      workers?.initWorkers();
      setLocalWorker(updated);
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
        <h3 className="h2 pl-2 primary-text">Employee Profile #{localWorker.workerId}</h3>
        {!!adminPanelCtx && getActvationButton()}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6">
        <div className="flex flex-col gap-2">
          <div><span className="font-semibold secondary-text">UID:</span> <span className="primary-text font-mono">{localWorker.uid}</span></div>
          <div><span className="font-semibold secondary-text">Status:</span> <span className="primary-text">{localWorker.status}</span></div>
          <div><span className="font-semibold secondary-text">Display Name:</span> <span className="primary-text">{localWorker.displayName}</span></div>
          <div><span className="font-semibold secondary-text">Email:</span> <span className="primary-text">{localWorker.email}</span></div>
          <div><span className="font-semibold secondary-text">Full Name:</span> <span className="primary-text">{localWorker.fullName}</span></div>
          <div><span className="font-semibold secondary-text">Phone Number:</span> <span className="primary-text">{localWorker.phoneNumber.prefix} {localWorker.phoneNumber.phoneNumber}</span></div>
        </div>
        <div className="flex flex-col gap-2">
          <div><span className="font-semibold secondary-text">Experience:</span> <span className="primary-text">{localWorker.experience?.join(", ") || '-'}</span></div>
          <div><span className="font-semibold secondary-text">Certificates:</span> <span className="primary-text">{localWorker.certificates?.join(", ") || '-'}</span></div>
          <div><span className="font-semibold secondary-text">Languages:</span> <span className="primary-text">{localWorker.communicationLanguages?.join(", ") || '-'}</span></div>
          <div><span className="font-semibold secondary-text">Location Option:</span> <span className="primary-text">{localWorker.locationOption}</span></div>
          <div><span className="font-semibold secondary-text">Location Countries:</span> <span className="primary-text">{localWorker.locationCountries?.join(", ") || '-'}</span></div>
          <div><span className="font-semibold secondary-text">Address:</span> <span className="primary-text">{localWorker.fullAddress || '-'}</span></div>
          <div><span className="font-semibold secondary-text">Availability Option:</span> <span className="primary-text">{localWorker.availabilityOption}</span></div>
        </div>
      </div>

      {localWorker.availabilityDateRanges && localWorker.availabilityDateRanges.length > 0 && (
        <div className="px-6 pb-4 mt-4">
          <div className="font-semibold secondary-text mb-2">Availability Date Ranges:</div>
          <div className="flex flex-col gap-2">
            {localWorker.availabilityDateRanges.map((range) => {
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

      <div className="px-6 pb-4 mt-2 text-xs secondary-text">Created: {localWorker.createdAt ? new Date(localWorker.createdAt).toLocaleString() : '-'}</div>
    </div>
  );
};

export default SelectedProfile;
