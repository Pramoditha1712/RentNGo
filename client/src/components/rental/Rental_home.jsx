import { useContext, useEffect, useState } from "react";
import { productObj } from "../contexts/ProductsContext";
import { useOutletContext } from "react-router-dom";

function Rental_home() {
  const { handleProductData, productDetails } = useContext(productObj);
  const { searchQuery } = useOutletContext();
  const [filteredProducts, setFilteredProducts] = useState(productDetails || []); // Default to empty array
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fetch product data when the component mounts
  useEffect(() => {
    handleProductData();
  }, [handleProductData]);

  // Filter products based on the search query
  useEffect(() => {
    if (productDetails) {
      const filtered = productDetails.filter((product) =>
        product.nameOfProduct.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, productDetails]);

  // Handle adding a product to the cart
  async function handleAddToCart(product) {
    if (isAddingToCart) return; // Prevent multiple clicks

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) {
      alert("Please log in to add items to cart.");
      return;
    }

    setIsAddingToCart(true); // Disable the button while adding

    try {
      const response = await fetch('http://localhost:6700/cart-api/cart', { // Ensure the correct backend URL is used
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          productId: product._id, // Send the productId, not an array
        }),
      });

      if (!response.ok) {
        const errorData = await response.text(); // Get the response text in case of an error
        console.error('Error:', errorData);
        alert(`Error: ${response.statusText}`);
        return;
      }

      const data = await response.json();
      alert(`${product.nameOfProduct} added to cart!`);
      console.log('Cart:', data.payload);
    } catch (err) {
      console.error('Add to cart error:', err);
      alert('Error occurred while adding to cart.');
    } finally {
      setIsAddingToCart(false); // Re-enable the button after the request is done
    }
  }

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">All Rental Products</h2>
      <div className="row">
        {filteredProducts && filteredProducts.length === 0 ? (
          <p className="text-center">No products available.</p>
        ) : (
          filteredProducts.map((product, index) => (
            <div key={index} className="col-md-4 mb-4 p-2">
              <div className="card h-100 shadow-sm">
                {product.imgUrls?.length > 0 && (
                  <img
                    src={product.imgUrls[0]}
                    className="card-img-top"
                    alt={product.nameOfProduct}
                    style={{ height: "400px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{product.nameOfProduct}</h5>
                  <p className="card-text">{product.description}</p>
                  <p><strong>Category:</strong> {product.category}</p>
                  <p><strong>Rent:</strong> ₹{product.rentPrice} / day</p>
                  <p><strong>Status:</strong> {product.availability ? "Available" : "Not Available"}</p>
                </div>
                <button
                  className={`btn btn-primary w-50 mx-auto mb-3 ${isAddingToCart ? 'disabled' : ''}`}
                  onClick={() => handleAddToCart(product)}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? 'Adding...' : 'Add to cart'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Rental_home;
