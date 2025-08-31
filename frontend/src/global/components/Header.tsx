import { Link, useLocation } from 'react-router-dom';
import { Path } from '../../path';

const Header: React.FC = () => {

    const location = useLocation();

    const isActive = (path: string): boolean => {
        return location.pathname === path;
    };

    return (
        <nav className="main-nav">
            <div className="container nav-container">
                <Link to={Path.HOME} className="nav-brand">
                    JobHigh
                </Link>

                <ul className="nav-links">
                    <li>
                        <Link
                            to={Path.HOME}
                            className={isActive(Path.HOME) ? 'active' : ''}
                        >
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={Path.ADMIN_PANEL}
                            className={isActive(Path.ADMIN_PANEL) ? 'active' : ''}
                        >
                            Admin Panel
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Header;
