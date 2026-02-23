import { NavLink } from 'react-router-dom';
import TranslateIcon from '@mui/icons-material/Translate';
import HomeIcon from '@mui/icons-material/Home';
import MessageIcon from '@mui/icons-material/Message';
import { Path } from '../../path';
import { Icons } from 'global/icon.def';

const AdminPanelSidebar: React.FC = () => {

  return (
    <div className="admin-panel-sidebar">
      <NavLink
        to={Path.ADMIN_DICTIONARIES}
        className={({ isActive }) => `btn ripple secondary-txt${isActive ? ' active' : ''}`}
      >
        <HomeIcon />
        <span>Dictionaries</span>
      </NavLink>

      <NavLink
        to={Path.ADMIN_TRANSLATIONS}
        className={({ isActive }) => `btn ripple secondary-txt${isActive ? ' active' : ''}`}
      >
        <TranslateIcon />
        <span>Translations</span>
      </NavLink>

      <NavLink
        to={Path.ADMIN_USERS}
        className={({ isActive }) => `btn ripple secondary-txt${isActive ? ' active' : ''}`}    
      >
        <Icons.FRIENDS />
        <span>Users</span>
      </NavLink>

      <NavLink
        to={Path.ADMIN_FEEDBACKS}
        className={({ isActive }) => `btn ripple secondary-txt${isActive ? ' active' : ''}`}    
      >
          <MessageIcon />
        <span>Feedbacks</span>
      </NavLink>

      <NavLink
        to={Path.ADMIN_EMPLOYEE_PROFILES}
        className={({ isActive }) => `btn ripple secondary-txt${isActive ? ' active' : ''}`}    
      >
          <Icons.WORKER />
        <span>Employee Profiles</span>
      </NavLink>

      <NavLink
        to={Path.ADMIN_OFFERS}
        className={({ isActive }) => `btn ripple secondary-txt${isActive ? ' active' : ''}`}    
      > 
        <Icons.OFFER className="svg-icon" />
        <span>Offers</span>
      </NavLink>
    </div>
  );
}

export default AdminPanelSidebar;

