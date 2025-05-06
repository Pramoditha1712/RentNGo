
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContextObj } from '../contexts/Contexts';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function Rental_Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const navigate = useNavigate();
  const { userDetails } = useContext(ContextObj);

  const currentUser = userDetails || JSON.parse(localStorage.getItem('loggedInUser'));
  const userId = currentUser?._id;
  const RAZORPAY_KEY_ID = "rzp_test_cf3IMTnsiInNqs";

  useEffect(() => {
    if (!currentUser) {
      setError("Please login to view your cart");
      setLoading(false);
      navigate('/login');
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await fetch(`http://localhost:6700/cart-api/cart-with-owners/${userId}`);
        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login');
            return;
          }
          throw new Error(`Failed to fetch cart: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.payload) {
          const validatedCart = validateCart(data.payload);
          setCart(validatedCart);
          // Initialize selectedProducts with all products selected by default
          setSelectedProducts(validatedCart.products.map(product => product._id));
        } else {
          setError(data.message || "Cart not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [userId, currentUser, navigate]);

  const validateCart = (cartData) => {
    if (!cartData) return null;

    return {
      ...cartData,
      products: cartData.products?.map(product => ({
        ...product,
        _id: product._id || product.productId,
        imgUrls: product.imgUrls || [],
        quantity: product.quantity || 1,
        price: product.price || product.rentPrice || 0,
        ownerDetails: product.ownerDetails
      })) || []
    };
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleViewOwnerDetails = (ownerDetails) => {
    setSelectedOwner(ownerDetails);
    setShowOwnerModal(true);
  };

  const handleCloseOwnerModal = () => {
    setShowOwnerModal(false);
    setSelectedOwner(null);
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedProducts = cart.products.map(product =>
      product.productId === productId ? { ...product, quantity: newQuantity } : product
    );
    setCart({ ...cart, products: updatedProducts });

    try {
      const response = await fetch('http://localhost:6700/cart-api/update-quantity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity: newQuantity })
      });

      const data = await response.json();
      if (data.success && data.updatedCart) {
        setCart(validateCart(data.updatedCart));
      }
    } catch (err) {
      setError("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (productId) => {
    const confirmDelete = window.confirm('Are you sure you want to remove this item from your cart?');
    if (!confirmDelete) return;

    try {
      setCart(prevCart => ({
        ...prevCart,
        products: prevCart.products.filter(product => product._id !== productId)
      }));
      setSelectedProducts(prev => prev.filter(id => id !== productId));

      await fetch(`http://localhost:6700/cart-api/cart/${userId}/${productId}`, {
        method: 'DELETE',
      });

      const refreshResponse = await fetch(`http://localhost:6700/cart-api/cart-with-owners/${userId}`);
      const refreshData = await refreshResponse.json();

      if (refreshData.success && refreshData.payload) {
        setCart(validateCart(refreshData.payload));
      }
    } catch (err) {
      setError("Failed to remove item");
      const revertResponse = await fetch(`http://localhost:6700/cart-api/cart-with-owners/${userId}`);
      const revertData = await revertResponse.json();
      if (revertData.success && revertData.payload) {
        setCart(validateCart(revertData.payload));
      }
    }
  };

  const calculateTotal = () => {
    if (!cart?.products) return 0;
    return cart.products.reduce((total, product) => {
      if (selectedProducts.includes(product._id)) {
        return total + ((product.price || 0) * (product.quantity || 1));
      }
      return total;
    }, 0);
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
  
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  
  const handleOrderNow = async () => {
    try {
      setShowConfirmModal(false);
      setError(null);
      
      // Filter products to only include selected ones
      const productsToOrder = cart.products.filter(product => 
        selectedProducts.includes(product._id)
      );

      if (productsToOrder.length === 0) {
        throw new Error('Please select at least one product to order');
      }

      const isRazorpayLoaded = await loadRazorpay();
      if (!isRazorpayLoaded) {
        throw new Error('Failed to load payment gateway');
      }
  
      // Create order on backend with only selected products
      const response = await fetch('http://localhost:6700/order-api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId,
          products: productsToOrder.map(product => ({
            productId: product._id,
            ownerId: product.ownerId,
            name: product.name,
            description: product.description,
            price: product.price,
            imgUrls: product.imgUrls,
            quantity: product.quantity
          }))
        })
      });
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }
  
      const { razorpayOrder } = data;
  
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "RentNGo",
        description: "Rental Payment",
        image: "/logo.png",
        order_id: razorpayOrder.id,
        handler: function(response) {
          setOrderSuccess(true);
          // Remove ordered products from cart
          setCart(prev => ({
            ...prev,
            products: prev.products.filter(product => 
              !selectedProducts.includes(product._id))
          }));
          setSelectedProducts([]);
        },
        prefill: {
          name: currentUser.username,
          email: currentUser.email,
          contact: currentUser.phone || ''
        },
        theme: {
          color: "#3399cc"
        },
        modal: {
          ondismiss: () => {
            setError('Payment was cancelled by user');
          }
        }
      };
  
      const rzp = new window.Razorpay(options);
      rzp.open();
      
      rzp.on('payment.failed', function(response) {
        setError(`Payment failed: ${response.error.description}`);
      });
  
    } catch (err) {
      setError(err.message || 'Error processing payment');
    }
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

  if (!currentUser) {
    return (
      <div className="alert alert-warning text-center mt-5 mx-auto" style={{ maxWidth: '500px' }}>
        Please login to view your cart
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="container mt-5">
        <div className="card text-center">
          <div className="card-body py-5">
            <div className="alert alert-success">
              <h4 className="alert-heading">Order Placed Successfully!</h4>
              <p>Your order has been confirmed. Thank you for shopping with us.</p>
            </div>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => navigate('/rental/orderedDetails')}
            >
              View Your Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.products?.length) {
    return (
      <div className="container mt-5">
        <div className="card text-center">
          <div className="card-body py-5">
            <h2 className="card-title">Your cart is empty</h2>
            <p className="card-text">Start shopping to add items to your cart</p>
            <button className="btn btn-primary" onClick={() => navigate('/rental')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h2 className="mb-0">Your Rental Cart</h2>
            </div>
            <div className="card-body">
              <p className="text-muted">
                <small>Cart created: {new Date(cart.createdAt).toLocaleDateString()}</small>
              </p>

              <div className="list-group">
                {cart.products.map((product) => (
                  <div key={product.productId} className="list-group-item mb-3 border rounded">
                    <div className="row g-0">
                      <div className="col-md-3">
                        {product.imgUrls?.[0] ? (
                          <img
                            src={product.imgUrls[0]}
                            className="img-fluid rounded-start"
                            alt={product.name || 'Product image'}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/200';
                              e.target.className = 'img-fluid rounded-start bg-light';
                            }}
                          />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center bg-light rounded-start" style={{ height: '100%', minHeight: '150px' }}>
                            <span className="text-muted">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="col-md-9">
                        <div className="card-body">
                          <div className="d-flex justify-content-between">
                            <h5 className="card-title">{product.name || 'Unnamed product'}</h5>
                            <div>
                              <button
                                className={`btn btn-sm me-2 ${
                                  selectedProducts.includes(product._id)
                                    ? 'btn-success'
                                    : 'btn-outline-secondary'
                                }`}
                                onClick={() => toggleProductSelection(product._id)}
                              >
                                {selectedProducts.includes(product._id) ? 'Selected' : 'Select'}
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoveItem(product._id)}
                              >
                                <i className="bi bi-trash"></i> Remove
                              </button>
                            </div>
                          </div>
                          <p className="card-text text-muted small">{product.description || 'No description available'}</p>

                          <div className="d-flex align-items-center mb-2">
                            <span className="me-2">Owner:</span>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleViewOwnerDetails(product.ownerDetails)}
                            >
                              {product.ownerDetails?.username || 'Unknown owner'}
                            </button>
                          </div>

                          <div className="d-flex align-items-center justify-content-between mt-3">
                            <div className="input-group" style={{ width: '120px' }}>
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => handleQuantityChange(product.productId, product.quantity - 1)}
                                disabled={product.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="form-control text-center">{product.quantity}</span>
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() => handleQuantityChange(product.productId, product.quantity + 1)}
                              >
                                +
                              </button>
                            </div>

                            <h6 className="mb-0">
                              ₹{(product.price * product.quantity).toFixed(2)}
                              {!selectedProducts.includes(product._id) && (
                                <span className="text-muted small ms-2">(not selected)</span>
                              )}
                            </h6>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header bg-white">
              <h3 className="mb-0">Order Summary</h3>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Selected Items:
                  <span>{selectedProducts.length}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Subtotal:
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Estimated Tax:
                  <span>₹0.00</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center fw-bold">
                  Total:
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </li>
              </ul>

              <button
                className="btn btn-success w-100 mt-3 py-2"
                onClick={() => setShowConfirmModal(true)}
                disabled={selectedProducts.length === 0}
              >
                Order Now ({selectedProducts.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Owner Details Modal */}
      <Modal show={showOwnerModal} onHide={handleCloseOwnerModal}>
        <Modal.Header closeButton>
          <Modal.Title>Owner Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOwner ? (
            <div>
              <p><strong>Name:</strong> {selectedOwner.username}</p>
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

      {/* Order Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Your Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to place an order for {selectedProducts.length} selected items?</p>
          <p className="fw-bold">Total Amount: ₹{calculateTotal().toFixed(2)}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleOrderNow}>
            Confirm Order
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Rental_Cart;