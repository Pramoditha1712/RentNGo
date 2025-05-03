import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContextObj } from '../contexts/Contexts';

function Rental_Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { userDetails } = useContext(ContextObj);

  // Get user data from context or localStorage
  const currentUser = userDetails || JSON.parse(localStorage.getItem('loggedInUser'));
  const userId = currentUser?._id;

  useEffect(() => {
    if (!currentUser) {
      setError("Please login to view your cart");
      setLoading(false);
      navigate('/login');
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await fetch(`http://localhost:6700/cart-api/cart/${userId}`);
        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login');
            return;
          }
          throw new Error(`Failed to fetch cart: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.cart) {
          const validatedCart = {
            ...data.cart,
            products: data.cart.products?.map(product => ({
              ...product,
              ownerId: product.ownerId || { username: 'Unknown owner' },
              imgUrls: product.imgUrls || [],
              quantity: product.quantity || 1,
              price: product.price || 0
            })) || []
          };
          setCart(validatedCart);
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

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const response = await fetch(`http://localhost:6700/cart-api/cart/${userId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity: newQuantity
        })
      });

      if (!response.ok) throw new Error(`Update failed: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setCart(data.updatedCart);
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const response = await fetch(`http://localhost:6700/cart-api/cart/${userId}/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId })
      });

      if (!response.ok) throw new Error(`Removal failed: ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setCart(data.updatedCart);
      }
    } catch (err) {
      console.error("Error removing item:", err);
      setError("Failed to remove item");
    }
  };

  const calculateTotal = () => {
    if (!cart?.products) return 0;
    return cart.products.reduce((total, product) => {
      return total + ((product.price || 0) * (product.quantity || 1));
    }, 0);
  };

  const handleCheckout = () => {
    navigate('/checkout');
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

  if (!cart || !cart.products?.length) {
    return (
      <div className="container mt-5">
        <div className="card text-center">
          <div className="card-body py-5">
            <h2 className="card-title">Your cart is empty</h2>
            <p className="card-text">Start shopping to add items to your cart</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/rental')}
            >
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
                  <div key={product.productId || Math.random()} className="list-group-item mb-3 border rounded">
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
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveItem(product.productId)}
                            >
                              <i className="bi bi-trash"></i> Remove
                            </button>
                          </div>
                          <p className="card-text text-muted small">{product.description || 'No description available'}</p>
                          <p className="card-text">
                            <small className="text-muted">Owner: {product.ownerId?.username || 'Unknown owner'}</small>
                          </p>
                          
                          <div className="d-flex align-items-center justify-content-between mt-3">
                            <div className="input-group" style={{ width: '120px' }}>
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => handleQuantityChange(product.productId, (product.quantity || 1) - 1)}
                                disabled={(product.quantity || 1) <= 1}
                              >
                                -
                              </button>
                              <span className="form-control text-center">{product.quantity || 1}</span>
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => handleQuantityChange(product.productId, (product.quantity || 1) + 1)}
                              >
                                +
                              </button>
                            </div>
                            
                            <h6 className="mb-0">
                              ${((product.price || 0) * (product.quantity || 1)).toFixed(2)}
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
                  Subtotal:
                  <span>${calculateTotal().toFixed(2)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Estimated Tax:
                  <span>$0.00</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center fw-bold">
                  Total:
                  <span>${calculateTotal().toFixed(2)}</span>
                </li>
              </ul>
              
              <button 
                className="btn btn-primary w-100 mt-3 py-2"
                onClick={handleCheckout}
                disabled={!cart.products.length}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Rental_Cart;