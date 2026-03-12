import { UserRole } from "@shared/interfaces/UserI";
import { useUserContext } from "user/UserProvider";
import Loading from "./Loading";

interface Props {
  roles: UserRole[];
  children: React.ReactNode;
}

const RoleGuard: React.FC<Props> = ({ roles, children }) => {

    const userCtx = useUserContext();
    if (userCtx.loading) {
        return <Loading></Loading>
    }
    if (userCtx.me?.roles.some(role => roles.includes(role))) {
        return (<>{children}</>);
    }
    return null;
}

export default RoleGuard;