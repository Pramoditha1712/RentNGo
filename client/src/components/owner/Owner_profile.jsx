import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContextObj } from '../contexts/Contexts';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function Owner_profile() {
  const { username } = useParams();
  const { userDetails } = useContext(ContextObj);
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) {
      setError('No username specified');
      setLoading(false);
      return;
    }

    const fetchOwnerData = async () => {
      try {
        if (userDetails && userDetails.username === username) {
          setOwnerData(userDetails);
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:6700/user-api/user/name/${username}`);
        if (response.data.payload) {
          setOwnerData(response.data.payload);
        } else {
          setError('User not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [username, userDetails, navigate]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-5 mx-auto" style={{ maxWidth: '500px' }}>
        {error}
      </div>
    );
  }

  if (!ownerData) {
    return (
      <div className="alert alert-warning mt-5 mx-auto" style={{ maxWidth: '500px' }}>
        User profile not found
      </div>
    );
  }

  return (
    <div>
      {/* Owner Navigation Header */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#2C3E50' }}>
        <div className="container-fluid">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link 
                className="nav-link text-white active" 
                to={`/user/name/${ownerData.username}`}
              >
                <i className="fa-solid fa-user me-2"></i>Profile
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/owner/owneraddproducts">
                <i className="fa-solid fa-plus me-2"></i>Add products
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/owner/owner-products">
                <i className="fa-solid fa-shop me-2"></i>My Products
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/owner/ordersdisplay">
                <i className="fa-solid fa-box me-2"></i>Orders
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Profile Content */}
      <div className="container mt-4">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h3>Owner Profile</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4 text-center">
                <div className="mb-3">
                  {ownerData.profileImage ? (
                    <img 
                      src={ownerData.profileImage} 
                      alt="Profile" 
                      className="rounded-circle img-fluid"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                  ) : (
                    <i className="fas fa-user-circle fa-5x text-secondary"></i>
                  )}
                </div>
                <h4>{ownerData.username}</h4>
                <p className="text-muted">{ownerData.usertype === 'owner' ? 'Product Owner' : 'User'}</p>
              </div>
              <div className="col-md-8">
                <h5>Contact Information</h5>
                <hr />
                <div className="row mb-3">
                  <div className="col-sm-4">
                    <strong>Email:</strong>
                  </div>
                  <div className="col-sm-8">
                    {ownerData.email || 'Not provided'}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-sm-4">
                    <strong>Phone:</strong>
                  </div>
                  <div className="col-sm-8">
                    {ownerData.phone || 'Not provided'}
                  </div>
                </div>
                
                <h5 className="mt-4">Address</h5>
                <hr />
                {ownerData.address ? (
                  <>
                    <div className="row mb-2">
                      <div className="col-sm-4">
                        <strong>Street:</strong>
                      </div>
                      <div className="col-sm-8">
                        {ownerData.address.street || 'Not provided'}
                      </div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-sm-4">
                        <strong>City:</strong>
                      </div>
                      <div className="col-sm-8">
                        {ownerData.address.city || 'Not provided'}
                      </div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-sm-4">
                        <strong>State:</strong>
                      </div>
                      <div className="col-sm-8">
                        {ownerData.address.state || 'Not provided'}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-4">
                        <strong>Zip Code:</strong>
                      </div>
                      <div className="col-sm-8">
                        {ownerData.address.zipcode || 'Not provided'}
                      </div>
                    </div>
                  </>
                ) : (
                  <p>Address not provided</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Owner_profile;