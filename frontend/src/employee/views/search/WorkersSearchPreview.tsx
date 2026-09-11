import React from "react";
import { WorkerI } from "@shared/interfaces/WorkerI";
import { AVATAR_MOCK } from "user/components/AvatarTile";
import CategoriesChips from "global/components/chips/CategoriesChips";
import WorkerStatItems from "employee/components/WorkerStatItems";
import WorkerDataSection from "employee/components/WorkerDataSection";
import WorkerCertificatesSection from "employee/components/WorkerCertificatesSection";
import WorkerSkillsSection from "employee/components/WorkerSkillsSection";
import WorkerImagesSection from "employee/components/WorkerImagesSection";
import WorkerBioSection from "employee/components/WorkerBioSection";
import PositionWidget from "employee/components/PositionWidget";

interface Props {
    worker: WorkerI;
}

const WorkersSearchPreview: React.FC<Props> = ({ worker }) => (
    <aside className="workers-search-preview">
        <div className="workers-search-preview-header">
            <div className="worker-avatar">
                <img src={worker.avatarRef?.url || AVATAR_MOCK} alt={worker.displayName} />
            </div>
            <div className="worker-profile-top">
                <div className="worker-profile-top-row one">
                    <CategoriesChips categories={worker.categories} smaller color="primary" />
                </div>
                <div className="worker-profile-top-row two">
                    <div className="l-font font-semibold">{worker.displayName}</div>
                </div>
                <div className="worker-profile-top-row three">
                    <WorkerStatItems worker={worker} />
                </div>
            </div>
        </div>

        <WorkerDataSection worker={worker} />
        <WorkerCertificatesSection worker={worker} />
        <WorkerSkillsSection worker={worker} />
        <WorkerImagesSection worker={worker} />
        <WorkerBioSection worker={worker} />
        <div className="view-margin mb-10">
            <PositionWidget position={worker.geocodedPosition || null} />
        </div>
    </aside>
);

export default WorkersSearchPreview;