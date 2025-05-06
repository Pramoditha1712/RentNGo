import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ContextObj } from "../contexts/Contexts";
import 'bootstrap/dist/css/bootstrap.min.css';

function Orders_Display() {
  const { userDetails } = useContext(ContextObj);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userDetails && userDetails.userid) {
      fetchOrders();
    }
  }, [userDetails]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `http://localhost:6700/order-api/orders-with-owners/${userDetails.userid}`
      );
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (addressStr) => {
    try {
      if (addressStr.startsWith("{") && addressStr.endsWith("}")) {
        const parsed = JSON.parse(addressStr);
        return `${parsed.street}, ${parsed.city}, ${parsed.state} ${parsed.zipcode}`;
      }

      if (addressStr.includes("street:")) {
        const cleaned = addressStr
          .replace(/\n/g, "")
          .replace(/\s+/g, " ")
          .replace(/'/g, '"')
          .replace(/(\w+):/g, '"$1":');
        const parsed = JSON.parse(cleaned);
        return `${parsed.street}, ${parsed.city}, ${parsed.state} ${parsed.zipcode}`;
      }

      return addressStr;
    } catch (e) {
      console.error("Error parsing address:", e);
      return addressStr;
    }
  };

  if (loading) {
    return <div className="text-center py-4 small">Loading orders...</div>;
  }

  if (!orders.length) {
    return <div className="text-center py-4 small">No orders found</div>;
  }

  return (
    <div className="container my-4">
      <h3 className="mb-3">Your Orders</h3>
      {orders.map((order) => (
        <div key={order._id} className="card mb-3 shadow-sm">
          <div className="card-body row">
            {/* Left: Order Info */}
            <div className="col-md-3 border-end small">
              <p className="fw-semibold mb-1">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p>₹{order.totalAmount}</p>
              <span
                className={`badge ${
                  order.paymentStatus === "Paid"
                    ? "bg-success"
                    : "bg-warning text-dark"
                }`}
              >
                {order.paymentStatus}
              </span>
              <hr />
              <p className="fw-semibold mb-1">Customer:</p>
              <p className="mb-0">{order.userDetails.name}</p>
              <p className="mb-0 text-muted">{order.userDetails.email}</p>
              <p className="mb-0 text-muted">{order.userDetails.phone}</p>
              <p className="mb-0 text-muted">
                {formatAddress(order.userDetails.address)}
              </p>
            </div>

            {/* Right: Products List */}
            <div className="col-md-9">
              <h6 className="fw-semibold">Products:</h6>
              <div className="row">
                {order.products.map((product) => (
                  <div key={product._id} className="col-md-4 mb-3">
                    <div className="border p-2 rounded small h-100 d-flex gap-2">
                      <img
                        src={product.imgUrls[0]}
                        alt={product.name}
                        className="img-thumbnail"
                        // style={{ width: "80px", height: "80px", objectFit: "cover" }}
                      />
                      <div className="flex-grow-1 ms-4 fs-5">
                        <p className="mb-1 fw-semibold text-capitalize small ">{product.name}</p>
                        <p className="mb-1">₹{product.price} × {product.quantity}</p>
                        {/* <p
                          className={`mb-1 small ${
                            product.status === "Delivered"
                              ? "text-success"
                              : product.status === "Cancelled"
                              ? "text-danger"
                              : "text-warning"
                          }`}
                        >
                          {product.status}
                        </p> */}
                        <p className="mb-0 text-muted small">{product.ownerDetails.name}</p>
                        <p className="mb-0 text-muted small">{product.ownerDetails.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Orders_Display;
