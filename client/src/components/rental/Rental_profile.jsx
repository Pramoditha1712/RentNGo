import { useContext, useEffect, useState } from "react";
import { RentalObj } from "../contexts/RentalContext";
import axios from "axios";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const Rental_profile = () => {
  const { handleRental, rentalDetails } = useContext(RentalObj);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(true);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false); // State to toggle edit modal
  const [editFormData, setEditFormData] = useState({
    phone: "",
    address: ""
  });

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (loggedInUser) {
      handleRental({ username: loggedInUser.username, usertype: loggedInUser.usertype });

      // Fetch user orders with owner details
      axios
        .get(`http://localhost:6700/order-api/orders-with-owners/${loggedInUser._id}`)
        .then((res) => {
          if (res.data.success) {
            setOrders(res.data.orders);
          } else {
            console.log("No orders found.");
          }
          setOrderLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching orders:", err);
          setOrderLoading(false);
        });
    } else {
      console.log("No logged-in user found in localStorage");
    }
  }, [handleRental]);

  useEffect(() => {
    if (rentalDetails) {
      setIsLoading(false);
      setEditFormData({
        phone: rentalDetails.phone || "",
        address: rentalDetails.address || ""
      });
    }
  }, [rentalDetails]);

  const handleViewOwnerDetails = (ownerDetails) => {
    setSelectedOwner(ownerDetails);
    setShowOwnerModal(true);
  };

  const handleCloseOwnerModal = () => {
    setShowOwnerModal(false);
    setSelectedOwner(null);
  };

  const handleEditProfile = () => {
    setShowEditModal(true); // Show the edit modal
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false); // Close the edit modal
  };

  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submit (update profile)
  const handleSubmitEdit = () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    
    if (loggedInUser) {
      axios
        .put(`http://localhost:6700/user-api/user/update`, {
          email: loggedInUser.email, // Pass the email for identifying the user
          phone: editFormData.phone,
          address: editFormData.address
        })
        .then((res) => {
          if (res.data.message === "User updated") {
            // On success, close the modal and update the UI
            handleCloseEditModal();
            setIsLoading(true);
            // Optionally, refetch the rental details or update state here
            rentalDetails.phone = editFormData.phone;
            rentalDetails.address = editFormData.address;
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error("Error updating profile:", err);
        });
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mt-5">
      {isLoading ? (
        <div className="d-flex justify-content-center">
          <p>Loading profile...</p>
        </div>
      ) : rentalDetails ? (
        <div className="profile-card p-4 shadow-lg">
          <h2>{rentalDetails.username}'s Profile</h2>

          {rentalDetails.profilePicture ? (
            <img
              src={rentalDetails.profilePicture}
              alt="Profile"
              className="img-fluid rounded-circle mb-3"
              style={{ width: "150px", height: "150px", objectFit: "cover" }}
            />
          ) : (
            <p>No Profile Picture</p>
          )}

          <div className="profile-info">
            <p><strong>Username:</strong> {rentalDetails.username}</p>
            <p><strong>Email:</strong> {rentalDetails.email || "Not available"}</p>
            <p><strong>User Type:</strong> {rentalDetails.usertype}</p>
            <p><strong>Phone:</strong> {rentalDetails.phone || "Not available"}</p>
          </div>

          <button className="btn btn-primary mt-3" onClick={handleEditProfile}>Edit Profile</button>

          <hr className="my-4" />

          <h4>Order History</h4>
          {orderLoading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="border rounded p-3 mb-3 shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <p className="mb-1"><strong>Order ID:</strong> {order._id}</p>
                    <p className="mb-0"><strong>Placed On:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-end">
                    <p className="mb-1"><strong>Total:</strong> ₹{order.totalAmount}</p>
                    <span className={`badge ${order.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="list-group">
                  {order.products.map((product, index) => (
                    <div key={index} className="list-group-item border rounded mb-2 p-3">
                      <div className="row g-3">
                        <div className="col-md-2">
                          {product.imgUrls?.[0] ? (
                            <img
                              src={product.imgUrls[0]}
                              alt={product.name}
                              className="img-fluid rounded"
                              style={{ width: "100px", height: "100px", objectFit: "cover" }}
                            />
                          ) : (
                            <div className="d-flex align-items-center justify-content-center bg-light rounded" 
                                 style={{ width: "100px", height: "100px" }}>
                              <span className="text-muted">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="col-md-7">
                          <h6 className="mb-1">{product.name}</h6>
                          <p className="small text-muted mb-1">{product.description}</p>
                          <div className="d-flex flex-wrap gap-3">
                            <span className="small">Qty: {product.quantity}</span>
                            <span className="small">Price: ₹{product.price}</span>
                            <span className="small">Subtotal: ₹{product.price * product.quantity}</span>
                          </div>
                        </div>
                        <div className="col-md-3 text-end">
                          <span className={`badge ${
                            product.status === 'Delivered' ? 'bg-success' : 
                            product.status === 'Cancelled' ? 'bg-danger' : 'bg-warning'
                          } mb-2`}>
                            {product.status}
                          </span>
                          <button 
                            className="btn btn-sm btn-outline-primary d-block w-100"
                            onClick={() => handleViewOwnerDetails(product.ownerDetails)}
                          >
                            View Owner Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <p>No user details found or error occurred!</p>
      )}

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                id="phone"
                name="phone"
                value={editFormData.phone}
                onChange={handleFormChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="address" className="form-label">Address</label>
              <input
                type="text"
                className="form-control"
                id="address"
                name="address"
                value={editFormData.address}
                onChange={handleFormChange}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>Close</Button>
          <Button variant="primary" onClick={handleSubmitEdit}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

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
};

export default Rental_profile;
