import React, { useContext, useEffect, useState } from 'react';
import { ContextObj } from '../contexts/Contexts';
import axios from 'axios';

function Orders_Display() {
  const { userDetails } = useContext(ContextObj);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOwnerOrders = async () => {
      try {
        if (!userDetails?._id) {
          setError('User not logged in');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:6700/order-api/orders/owner/${userDetails._id}`
        );

        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          setError(response.data.message || 'Failed to fetch orders');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerOrders();
  }, [userDetails]);

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

  if (orders.length === 0) {
    return (
      <div className="alert alert-info mt-5 mx-auto" style={{ maxWidth: '500px' }}>
        No orders found for your products
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Your Product Orders</h2>
      
      {orders.map(order => (
        <div key={order._id} className="card mb-4">
          <div className="card-header bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Order #{order._id.slice(-6).toUpperCase()}</h5>
              <div>
                <span className="badge bg-light text-dark me-2">
                  Status: {order.orderStatus}
                </span>
                <span className="badge bg-light text-dark">
                  Payment: {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
          
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-6">
                <h6>Customer Details</h6>
                <hr />
                <p><strong>Name:</strong> {order.customer.name}</p>
                <p><strong>Email:</strong> {order.customer.email}</p>
                <p><strong>Phone:</strong> {order.customer.phone}</p>
              </div>
              <div className="col-md-6">
                <h6>Order Summary</h6>
                <hr />
                <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
                <p><strong>Total Amount:</strong> ₹{order.totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <h6 className="mt-3">Ordered Products</h6>
            <hr />
            <div className="row">
              {order.products.map(product => (
                <div key={product._id} className="col-md-6 mb-3">
                  <div className="card h-100">
                    <div className="row g-0">
                      <div className="col-md-4">
                        {product.imgUrls[0] ? (
                          <img
                            src={product.imgUrls[0]}
                            className="img-fluid rounded-start h-100"
                            alt={product.name}
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center bg-light h-100">
                            <span className="text-muted">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="col-md-8">
                        <div className="card-body">
                          <h5 className="card-title">{product.name}</h5>
                          <p className="card-text text-muted small">
                            {product.description || 'No description available'}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <p className="mb-0"><strong>Price:</strong> ₹{product.price}</p>
                              <p className="mb-0"><strong>Quantity:</strong> {product.quantity}</p>
                            </div>
                            <div>
                              <span className="badge bg-info text-dark">
                                Subtotal: ₹{(product.price * product.quantity).toFixed(2)}
                              </span>
                            </div>
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
    </div>
  );
}

export default Orders_Display;