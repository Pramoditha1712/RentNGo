import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useContext } from "react";
import { ContextObj } from "./contexts/Contexts";

function Header() {
  const { userDetails, handleloginstatus } = useContext(ContextObj);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 py-2">
      <div className="container-fluid">
        
        {/* Logo / Brand */}
        <Link className="navbar-brand fw-bold fs-3" to="">
          Rentngo
        </Link>

        {/* Toggle button for mobile view */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav gap-3 align-items-center">
            <li className="nav-item">
              <Link className="nav-link fw-semibold text-darka fw-bold" to="register">Register</Link>
            </li>
            {userDetails === null ? (
              <li className="nav-item">
                <Link className="btn btn-outline-primary" to="login">Login</Link>
              </li>
            ) : (
              <li className="nav-item">
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    localStorage.removeItem("loggedInUser");
                    handleloginstatus();  // Clear user session
                  }}
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
