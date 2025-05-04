import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ContextObj } from '../contexts/Contexts';

function Orders_Display() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userDetails } = useContext(ContextObj);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!userDetails?.userid) {
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:6700/order-api/orders/owner/${userDetails.userid}`
        );

        if (response.data.success) {
          setOrders(response.data.orders);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userDetails?.userid]);

  if (loading) return <div className="text-center py-4">Loading orders...</div>;
  if (error) return <div className="text-center py-4 text-danger">Error: {error}</div>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">Your Product Orders</h2>
      {orders.length === 0 ? (
        <p className="text-muted">No orders found for your products.</p>
      ) : (
        <div className="accordion" id="ordersAccordion">
          {orders.map((order, index) => (
            <div key={order.userid} className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="mb-1">Order ID: {order.userid}</h5>
                  <small className="text-muted">
                    Date: {new Date(order.orderDate).toLocaleString()}
                  </small>
                </div>
                <div className="text-end">
                  <span className={`badge me-2 ${
                    order.paymentStatus === 'Completed'
                      ? 'bg-success'
                      : 'bg-warning text-dark'
                  }`}>
                    Payment: {order.paymentStatus}
                  </span>
                  <span className={`badge ${
                    order.orderStatus === 'Delivered'
                      ? 'bg-success'
                      : order.orderStatus === 'Cancelled'
                        ? 'bg-danger'
                        : 'bg-warning text-dark'
                  }`}>
                    Status: {order.orderStatus}
                  </span>
                </div>
              </div>

              <div className="card-body">
                <h6>Customer Details</h6>
                <div className="row mb-3">
                  <div className="col-md-4">
                    <strong>Name:</strong> {order.customer?.name || 'Not provided'}
                  </div>
                  <div className="col-md-4">
                    <strong>Email:</strong> {order.customer?.email || 'Not provided'}
                  </div>
                  <div className="col-md-4">
                    <strong>Phone:</strong> {order.customer?.phone || 'Not provided'}
                  </div>
                </div>

                <h6>Products Ordered</h6>
                {order.products.map(product => (
                  <div key={product.userid} className="border-bottom pb-3 mb-3">
                    <div className="row">
                      <div className="col-md-3">
                        {product.imgUrls?.length > 0 && (
                          <img 
                            src={product.imgUrls[0]}
                            alt={product.name}
                            className="img-fluid rounded border"
                            style={{ maxHeight: '150px' }}
                          />
                        )}
                      </div>
                      <div className="col-md-9">
                        <h5>{product.name}</h5>
                        <p>{product.description}</p>
                        <div className="row">
                          <div className="col-md-3">
                            <strong>Price:</strong> ₹{product.price}
                          </div>
                          <div className="col-md-3">
                            <strong>Quantity:</strong> {product.quantity}
                          </div>
                          <div className="col-md-3">
                            <strong>Subtotal:</strong> ₹{product.price * product.quantity}
                          </div>
                          <div className="col-md-3">
                            <strong>Status:</strong>{' '}
                            <span className={`badge ${
                              product.status === 'Delivered'
                                ? 'bg-success'
                                : product.status === 'Cancelled'
                                  ? 'bg-danger'
                                  : 'bg-warning text-dark'
                            }`}>
                              {product.status || 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-end mt-3">
                  <h5>Total Amount: ₹{order.totalAmount}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders_Display;
