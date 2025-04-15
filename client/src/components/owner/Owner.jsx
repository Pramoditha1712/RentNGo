import { Link, Outlet } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function Owner() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#2C3E50' }}>
        <div className="container-fluid">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link text-white" to="">
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
          </ul>
        </div>
      </nav>

      {/* Content Area */}
      <div className="container mt-4">
        <Outlet />
      </div>
    </div>
  );
}

export default Owner;
