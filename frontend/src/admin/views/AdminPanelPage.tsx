import MobileMock from "../../global/components/MobileMock";
import { useIsMobile } from "../../global/hooks/isMobile";
import AdminPanelSidebar from "./AdminPanelSidebar";

const AdminPanelPage: React.FC = () => {

  const mobile = useIsMobile();

  if (mobile) {
    return <MobileMock />;
  }

  return (<div className="admin-panel">

    <AdminPanelSidebar />

    admin panel

  </div>)
}

export default AdminPanelPage;
