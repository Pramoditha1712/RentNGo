import { useContext, useEffect, useState } from "react";
import { productObj } from "../contexts/ProductsContext";
import { useOutletContext } from "react-router-dom";
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap/Modal';

function Rental_home() {
  const [successMessages, setSuccessMessages] = useState({});
  const { handleProductData, productDetails } = useContext(productObj);
  const { searchQuery } = useOutletContext();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  // Fetch product data when the component mounts
  useEffect(() => {
    handleProductData();
  }, [handleProductData]);

  // Filter products based on search query
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

  const handleImageClick = (imgUrl) => {
    setSelectedImage(imgUrl);
    setShowModal(true);
  };

  async function handleAddToCart(product) {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    
    if (!user || !user._id) {
      toast.error("Please log in to add items to cart.");
      return;
    }
  
    setLoadingStates(prev => ({ ...prev, [product._id]: true }));
  
    try {
      const response = await fetch('http://localhost:6700/cart-api/cart', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user._id,
          products: [{
            productId: product._id,
            ownerId: product.ownerId,
            name: product.nameOfProduct,
            description: product.description,
            price: product.rentPrice,
            imgUrls: product.imgUrls,
            quantity: 1
          }]
        }),
      });
  
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add to cart');
      }
  
      // Show toast and set success message
      toast.success(`${product.nameOfProduct} added to cart!`);
      setSuccessMessages(prev => ({ ...prev, [product._id]: true }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessages(prev => ({ ...prev, [product._id]: false }));
      }, 3000);
  
    } catch (error) {
      toast.error(error.message || 'Error adding to cart. Please try again.');
    } finally {
      setLoadingStates(prev => ({ ...prev, [product._id]: false }));
    }
  }

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">All Rental Products</h2>
      
      {/* Image Zoom Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Body className="p-0">
          <img 
            src={selectedImage} 
            alt="Zoomed product" 
            className="img-fluid w-100"
            style={{ cursor: 'zoom-out' }}
            onClick={() => setShowModal(false)}
          />
        </Modal.Body>
      </Modal>

      <div className="row">
        {filteredProducts.length === 0 ? (
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
                    style={{ 
                      height: "400px", 
                      objectFit: "cover",
                      cursor: 'zoom-in'
                    }}
                    onClick={() => handleImageClick(product.imgUrls[0])}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{product.nameOfProduct}</h5>
                  <p className="card-text">{product.description}</p>
                  <p><strong>Category:</strong> {product.category}</p>
                  <p><strong>Rent:</strong> ₹{product.rentPrice} / day</p>
                  <p><strong>Status:</strong> 
                    <span className={product.availability ? "text-success" : "text-danger"}>
                      {product.availability ? " Available" : " Not Available"}
                    </span>
                  </p>
                </div>
                <button
                  className={`btn btn-primary w-50 mx-auto mb-3 ${
                    loadingStates[product._id] ? 'disabled' : ''
                  } ${
                    !product.availability ? 'btn-secondary' : ''
                  }`}
                  onClick={() => handleAddToCart(product)}
                  disabled={loadingStates[product._id] || !product.availability}
                >
                  {loadingStates[product._id] ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Adding...
                    </>
                  ) : product.availability ? (
                    'Add to cart'
                  ) : (
                    'Not Available'
                  )}
                </button>
                {successMessages[product._id] && (
                  <div className="text-center text-success mb-2">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Added to cart!
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Rental_home;