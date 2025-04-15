import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FaUser, FaShoppingCart } from 'react-icons/fa';

function Rental() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);  
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 py-2">
        <div className="container-fluid">

          {/* Search Bar */}
          <form className="d-flex mx-auto align-items-center" style={{ width: "40%" }} onSubmit={handleSearchSubmit}>
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search Here"
              aria-label="Search"
              value={searchQuery}
              onChange={handleSearchChange}  // Update query on change
            />
            <button className="btn btn-outline-secondary" type="submit">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>

          {/* Icons */}
          <div className="d-flex align-items-center gap-4">
            <Link className="nav-link" to="rentalprofile">
              <FaUser size={20} />
            </Link>
            <Link className="nav-link" to="">
              <FaShoppingCart size={20} />
            </Link>
            <Link className="nav-link" to="rentalcart">
            <i className="fa-solid fa-bag-shopping" size={20}></i>
            </Link>
          </div>
        </div>
      </nav>

      {/* Pass the search query to the child components */}
      <Outlet context={{ searchQuery }} />
    </div>
  );
}

export default Rental;
