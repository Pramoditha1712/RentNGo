import { useContext, useEffect, useState } from "react";
import { productObj } from "../contexts/ProductsContext";
import { useOutletContext } from "react-router-dom";

function Rental_home() {
  const { handleProductData, productDetails } = useContext(productObj);
  const { searchQuery } = useOutletContext();  // Get search query from parent component

  const [filteredProducts, setFilteredProducts] = useState(productDetails);

  useEffect(() => {
    handleProductData();
  }, [handleProductData]);

  useEffect(() => {
    const filtered = productDetails?.filter((product) =>
      product.nameOfProduct.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, productDetails]); 

  async function handleAddToCart(product) {
    // Example: log the product
    console.log("Adding to cart:", product);
  
    // You can use localStorage or a context/cart API
    alert(`${product.nameOfProduct} added to cart!`);
  
    // If using localStorage for temporary cart:
    const existingCart = JSON.parse(localStorage.getItem("rentalCart")) || [];
    existingCart.push(product);
    localStorage.setItem("rentalCart", JSON.stringify(existingCart));
  }
  

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">All Rental Products</h2>
      <div className="row">
        {filteredProducts?.length === 0 ? (
          <p className="text-center">No products available.</p>
        ) : (
          filteredProducts?.map((product, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                {product.imgUrls?.length > 0 && (
                  <img
                    src={product.imgUrls[0]}
                    className="card-img-top"
                    alt={product.nameOfProduct}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{product.nameOfProduct}</h5>
                  <p className="card-text">{product.description}</p>
                  <p><strong>Category:</strong> {product.category}</p>
                  <p><strong>Rent:</strong> ₹{product.rentPrice} / day</p>
                  <p><strong>Status:</strong> {product.availability ? "Available" : "Not Available"}</p>
                </div>
                <button className="btn btn-primary w-50 mx-auto mb-3" onClick={() => handleAddToCart(product)}>Add to cart</button>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Rental_home;
