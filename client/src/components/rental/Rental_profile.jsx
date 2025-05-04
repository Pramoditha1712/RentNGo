import { useContext, useEffect, useState } from "react";
import { RentalObj } from "../contexts/RentalContext";
import axios from "axios";

const Rental_profile = () => {
  const { handleRental, rentalDetails } = useContext(RentalObj);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(true);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (loggedInUser) {
      handleRental({ username: loggedInUser.username, usertype: loggedInUser.usertype });

      // Fetch user orders
      axios
        .get(`http://localhost:6700/order-api/orders/${loggedInUser._id}`)
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
    }
  }, [rentalDetails]);

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

          <button className="btn btn-primary mt-3">Edit Profile</button>

          <hr className="my-4" />

          <h4>Order History</h4>
          {orderLoading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="border rounded p-3 mb-3 shadow-sm">
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
                <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                <p><strong>Placed On:</strong> {new Date(order.createdAt).toLocaleString()}</p>

                <ul className="list-group mt-2">
                  {order.products.map((product, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <p className="mb-1"><strong>{product.name}</strong></p>
                        <p className="mb-0">Qty: {product.quantity} | ₹{product.price}</p>
                        <small>Status: {product.status}</small>
                      </div>
                      {product.imgUrls?.[0] && (
                        <img
                          src={product.imgUrls[0]}
                          alt="Product"
                          style={{ width: "60px", height: "60px", objectFit: "cover" }}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      ) : (
        <p>No user details found or error occurred!</p>
      )}
    </div>
  );
};

export default Rental_profile;
