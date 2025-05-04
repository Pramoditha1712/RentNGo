import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContextObj } from '../contexts/Contexts';
import axios from 'axios';

function Owner_profile() {
  const { username } = useParams();
  const { userDetails } = useContext(ContextObj);
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If no username in params, redirect or handle appropriately
    if (!username) {
      setError('No username specified');
      setLoading(false);
      return;
    }

    const fetchOwnerData = async () => {
      try {
        // If the profile being viewed is the logged-in user, use context data
        if (userDetails && userDetails.username === username) {
          setOwnerData(userDetails);
          setLoading(false);
          return;
        }

        // Otherwise fetch from API
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
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h3>Owner Profile</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 text-center">
              <div className="mb-3">
                <i className="fas fa-user-circle fa-5x text-secondary"></i>
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
  );
}

export default Owner_profile;