import React, { useEffect, useState } from 'react';

function Rental_Cart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("rentalCart")) || [];
    setCartItems(storedCart);
  }, []);

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">Your Rental Cart</h2>
      <div className="row">
        {cartItems.length === 0 ? (
          <p className="text-center">Your cart is empty.</p>
        ) : (
          cartItems.map((item, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                {item.imgUrls?.length > 0 && (
                  <img
                    src={item.imgUrls[0]}
                    className="card-img-top"
                    alt={item.nameOfProduct}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{item.nameOfProduct}</h5>
                  <p className="card-text">{item.description}</p>
                  <p><strong>Category:</strong> {item.category}</p>
                  <p><strong>Rent:</strong> ₹{item.rentPrice} / day</p>
                  <p><strong>Status:</strong> {item.availability ? "Available" : "Not Available"}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Rental_Cart;
