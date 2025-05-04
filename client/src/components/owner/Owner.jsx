import { Link, Outlet } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useContext } from 'react';
import { ContextObj } from '../contexts/Contexts';

function Owner() {
  const { userDetails } = useContext(ContextObj);
  const username = userDetails?.username; // Get from context instead of localStorage

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#2C3E50' }}>
        <div className="container-fluid">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link 
                className="nav-link text-white" 
                to={username ? `/user/name/${username}` : '#'}
                onClick={e => !username && e.preventDefault()}
              >
                <i className="fa-solid fa-user me-2"></i>Profile
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="owneraddproducts">
                <i className="fa-solid fa-plus me-2"></i>Add products
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="owner-products">
                <i className="fa-solid fa-shop"></i>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="ordersdisplay">
                Display
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="container mt-4">
        <Outlet />
      </div>
    </div>
  );
}

export default Owner;