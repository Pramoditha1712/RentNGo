// src/components/OrderedDetails.jsx

import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContextObj } from '../contexts/Contexts';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function OrderedDetails() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const navigate = useNavigate();
  const { userDetails } = useContext(ContextObj);

  const currentUser = userDetails || JSON.parse(localStorage.getItem('loggedInUser'));
  const userId = currentUser?._id;

  useEffect(() => {
    if (!currentUser) {
      setError("Please login to view your orders");
      setLoading(false);
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(`http://localhost:6700/order-api/orders-with-owners/${userId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setOrders(data.orders || []);
        } else {
          setError(data.message || "No orders found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, currentUser, navigate]);

  const handleViewOwnerDetails = (ownerDetails) => {
    setSelectedOwner(ownerDetails);
    setShowOwnerModal(true);
  };

  const handleCloseOwnerModal = () => {
    setShowOwnerModal(false);
    setSelectedOwner(null);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center mt-5 mx-auto" style={{ maxWidth: '500px' }}>
        {error}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mt-5">
        <div className="card text-center">
          <div className="card-body py-5">
            <h2 className="card-title">No Orders Found</h2>
            <p className="card-text">You haven't placed any orders yet</p>
            <button className="btn btn-primary" onClick={() => navigate('/rental')}>
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Your Order History</h2>
  
      {orders.map((order) => (
        <div key={order._id} className="card mb-4">
          {/* ... (keep the order header section the same) */}
  
          <div className="card-body">
            <div className="list-group">
              {order.products.map((product) => (
                <div key={product._id} className="list-group-item mb-3 border rounded">
                  <div className="row g-0">
                    <div className="col-md-3">
                      {product.imgUrls?.[0] ? (
                        <img
                          src={product.imgUrls[0]}
                          className="img-fluid rounded-start"
                          alt={product.name}
                          style={{ height: '150px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200';
                            e.target.className = 'img-fluid rounded-start bg-light';
                          }}
                        />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center bg-light rounded-start" style={{ height: '150px' }}>
                          <span className="text-muted">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="col-md-9">
                      <div className="card-body">
                        <div className="d-flex justify-content-between">
                          <h5 className="card-title">{product.name || 'Product'}</h5>
                          <h6 className="mb-0">${(product.price * product.quantity).toFixed(2)}</h6>
                        </div>
                        <p className="card-text text-muted small">{product.description || 'No description'}</p>
                        
                        <div className="d-flex flex-wrap align-items-center mb-2">
                          <div className="me-3">
                            <span className="me-1">Quantity:</span>
                            <span className="badge bg-secondary">{product.quantity}</span>
                          </div>
                          <div className="me-3">
                            <span className="me-1">Rental Period:</span>
                            <span className="text-muted">
                              {product.rentalStartDate ? formatDate(product.rentalStartDate) : 'Not specified'} to{' '}
                              {product.rentalEndDate ? formatDate(product.rentalEndDate) : 'Not specified'}
                            </span>
                          </div>
                          <div>
                            <span className="me-1">Owner:</span>
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleViewOwnerDetails(product.ownerDetails)}
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Owner Details Modal */}
      <Modal show={showOwnerModal} onHide={handleCloseOwnerModal}>
        <Modal.Header closeButton>
          <Modal.Title>Owner Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOwner ? (
            <div>
              <p><strong>Name:</strong> {selectedOwner.name || 'Not provided'}</p>
              <p><strong>Email:</strong> {selectedOwner.email || 'Not provided'}</p>
              <p><strong>Phone:</strong> {selectedOwner.phone || 'Not provided'}</p>
            </div>
          ) : (
            <p>No owner details available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseOwnerModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default OrderedDetails;