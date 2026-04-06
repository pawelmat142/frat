import { NavLink } from 'react-router-dom';
import TranslateIcon from '@mui/icons-material/Translate';
import HomeIcon from '@mui/icons-material/Home';
import MessageIcon from '@mui/icons-material/Message';
import { Path } from '../../path';
import { Ico } from 'global/icon.def';

const AdminPanelSidebar: React.FC = () => {

  const iconSize = 36

  return (
    <div className="admin-panel-sidebar">
      <NavLink
        to={Path.ADMIN_DICTIONARIES}
        className={({ isActive }) => `btn ripple secondary-txt${isActive ? ' active' : ''}`}
      >
        <Ico.SETTINGS size={iconSize} />
        <span>Dictionaries</span>
      </NavLink>

      <NavLink
        to={Path.ADMIN_TRANSLATIONS}
        className={({ isActive }) => `btn ripple secondary-txt${isActive ? ' active' : ''}`}
      >
        <Ico.LANGUAGE size={iconSize} />
        <span>Translations</span>
      </NavLink>

      <NavLink
        to={Path.ADMIN_USERS}
        className={({ isActive }) => `btn ripple secondary-txt${isActive ? ' active' : ''}`}    
      >
        <Ico.FRIENDS size={iconSize} />
        <span>Users</span>
      </NavLink>

      <NavLink
        to={Path.ADMIN_FEEDBACKS}
        className={({ isActive }) => `btn ripple secondary-txt${isActive ? ' active' : ''}`}    
      >
          <Ico.MSG size={iconSize} />
        <span>Feedbacks</span>
      </NavLink>

      <NavLink
        to={Path.ADMIN_EMPLOYEE_PROFILES}
        className={({ isActive }) => `btn ripple secondary-txt${isActive ? ' active' : ''}`}    
      >
          <Ico.WORKER size={iconSize} />
        <span>Worker Profiles</span>
      </NavLink>

      <NavLink
        to={Path.ADMIN_OFFERS}
        className={({ isActive }) => `btn ripple secondary-txt${isActive ? ' active' : ''}`}    
      > 
        <Ico.OFFER className="svg-icon" />
        <span>Offers</span>
      </NavLink>

      <NavLink
        to={Path.HOME}
        className={({ isActive }) => `btn ripple secondary-txt${isActive ? ' active' : ''}`}    
      > 
        <Ico.HOME className="svg-icon" />
        <span>HOME</span>
      </NavLink>
    </div>
  );
}

export default AdminPanelSidebar;

