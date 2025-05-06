import React, { useEffect, useState } from "react";
import axios from "axios";

function Orders_Display({ ownerEmail }) {
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = "6816580a3123a2572a610c97"; // This is the renter's ID

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:6700/order-api/orders-with-owners/${userId}`);
        if (response.data.success) {
          const allOrders = response.data.orders;

          // Filter only the products that belong to the current owner
          const ownerOrders = allOrders
            .map(order => {
              const ownerProducts = order.products.filter(
                product => product.ownerDetails.email === ownerEmail
              );

              if (ownerProducts.length > 0) {
                return {
                  ...order,
                  products: ownerProducts
                };
              }
              return null;
            })
            .filter(Boolean); // remove nulls

          setFilteredOrders(ownerOrders);
        } else {
          setError(response.data.message || "Failed to fetch orders");
        }
      } catch (err) {
        setError("Error fetching orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [ownerEmail]);

  if (loading) return <div className="p-3">Loading orders...</div>;
  if (error) return <div className="p-3 text-danger">Error: {error}</div>;

  return (
    <div className="container mt-4">
      <h2>Orders for You</h2>
      {filteredOrders.length === 0 ? (
        <p>No relevant orders found.</p>
      ) : (
        filteredOrders.map((order) => (
          <div className="card mb-4" key={order._id}>
            <div className="card-body">
              <h5 className="card-title">Order ID: {order._id}</h5>
              <p><strong>Total Amount (Relevant):</strong> ₹{order.products.reduce((sum, p) => sum + p.price * p.quantity, 0)}</p>
              <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

              <h6 className="mt-3">Your Products:</h6>
              {order.products.map((product, index) => (
                <div className="row mb-3" key={index}>
                  <div className="col-md-3">
                    <img src={product.imgUrls[0]} alt={product.name} className="img-fluid rounded" />
                  </div>
                  <div className="col-md-9">
                    <h6>{product.name}</h6>
                    <p>{product.description}</p>
                    <p><strong>Price:</strong> ₹{product.price}</p>
                    <p><strong>Quantity:</strong> {product.quantity}</p>
                    <p><strong>Status:</strong> {product.status}</p>
                    <p><strong>Ordered by:</strong> {order.userDetails.name} ({order.userDetails.email})</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Orders_Display;
