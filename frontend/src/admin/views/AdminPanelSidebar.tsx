import { NavLink } from 'react-router-dom';
import TranslateIcon from '@mui/icons-material/Translate';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import MessageIcon from '@mui/icons-material/Message';
import { Path } from '../../path';

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
        <PeopleIcon />
        <span>Users</span>
      </NavLink>

      <NavLink
        to={Path.ADMIN_FEEDBACKS}
        className={({ isActive }) => `btn ripple secondary-txt${isActive ? ' active' : ''}`}    
      >
          <MessageIcon />
        <span>Feedbacks</span>
      </NavLink>
    </div>
  );
}

export default AdminPanelSidebar;

