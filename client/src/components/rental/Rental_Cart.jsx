import React, { useEffect, useState } from 'react';

function Rental_Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [addedToTotal, setAddedToTotal] = useState([]);
  const [address, setAddress] = useState({
    street: "Default Street",
    city: "City",
    state: "State",
    country: "India",
    zip: "000000"
  });

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please log in first!");
    return <div>Please log in to continue.</div>;
  }
  const fetchCart = async () => {
    try {
      const response = await fetch(`http://localhost:6700/cart-api/cart/${user._id}`);
      const data = await response.json();
  
      if (response.ok) {
        setCart(data.payload);
      } else {
        setError(data.message || 'Failed to fetch cart');
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Error fetching cart details');
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (productId) => {
    try {
      const res = await fetch(`http://localhost:6700/cart-api/cart/${user._id}/${productId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        alert("Product removed from cart");
        setCart(data.payload);
        setTotal(0);
        setAddedToTotal([]);
      } else {
        alert(data.message || "Failed to remove product");
      }
    } catch (err) {
      console.error("Error removing product:", err);
      alert("Error removing product from cart");
    }
  };

  const toggleTotal = (productId, price, quantity = 1) => {
    const isAdded = addedToTotal.includes(productId);
    const amount = price * quantity;

    if (isAdded) {
      setTotal(prev => prev - amount);
      setAddedToTotal(prev => prev.filter(id => id !== productId));
    } else {
      setTotal(prev => prev + amount);
      setAddedToTotal(prev => [...prev, productId]);
    }
  };

  const handleRentNow = async () => {
    if (!cart || !cart.products || cart.products.length === 0) {
      alert("Cart is empty!");
      return;
    }

    if (total <= 0) {
      alert("Please add some products to the total before placing the order.");
      return;
    }

    const products = cart.products
      .filter(p => addedToTotal.includes(p.productId))
      .map(product => ({
        productId: product.productId,
        ownerId: product.ownerId,
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        imgUrls: product.imgUrls || []
      }));

    const orderPayload = {
      userId: user._id,
      address,
      products,
      totalAmount: total
    };

    console.log('Order Payload:', orderPayload);

    try {
      const response = await fetch('http://localhost:6700/order-api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();
      console.log("Response Data:", data);

      if (response.ok) {
        alert('Order placed successfully!');
        setCart(null); // Reset cart
        setTotal(0);
        setAddedToTotal([]);
        fetchCart(); // Refresh cart
      } else {
        alert(`Failed to place order: ${data.message || 'Unknown error'}`);
        console.error('Error details:', data);
      }
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Error placing order');
    }
  };

  if (loading) return <div>Loading cart...</div>;
  if (error) return <div>{error}</div>;
  if (!cart || !cart.products || cart.products.length === 0) {
    return <h2 className="text-center mt-4">Your Cart is empty</h2>;
  }

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">Your Cart</h2>
      <div className="row">
        {cart.products.map((product, index) => (
          <div key={index} className="col-md-4 mb-4 p-2">
            <div className="card h-100 shadow-sm">
              {product.imgUrls?.[0] && (
                <img
                  src={product.imgUrls[0]}
                  className="card-img-top p-3"
                  alt={product.name}
                  style={{ height: '400px', width: '100%', objectFit: 'cover' }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">{product.description}</p>
                <p><strong>Price:</strong> ₹{product.price}</p>
                <p><strong>Quantity:</strong> {product.quantity}</p>
                <button
                  className="btn btn-danger me-3"
                  onClick={() => handleRemove(product.productId)}
                >
                  Remove from cart
                </button>
                <button
                  className={`btn ${addedToTotal.includes(product.productId) ? 'btn-warning' : 'btn-success'}`}
                  onClick={() => toggleTotal(product.productId, product.price, product.quantity)}
                >
                  {addedToTotal.includes(product.productId) ? 'Remove from Total' : 'Add to Total'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-4">
        <h4>Total Amount: ₹{total}</h4>
        <button
          className="btn btn-primary mt-3"
          onClick={handleRentNow}
        >
          Rent Now
        </button>
      </div>
    </div>
  );
}

export default Rental_Cart;
