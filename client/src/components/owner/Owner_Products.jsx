import { useContext, useEffect } from "react";
import { productObj } from "../contexts/ProductsContext";
import { ContextObj } from "../contexts/Contexts";

function Owner_Products() {
  const { handleProductData, productDetails } = useContext(productObj);
  const { userDetails } = useContext(ContextObj);

  useEffect(() => {
    handleProductData();
  }, []);

  // Get user from localStorage or context
  const localUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const user = localUser || userDetails;
  const userId = user?.userid || user?._id;

  // Filter only products owned by the logged-in user
  const ownerProducts = productDetails?.filter(
    (product) => product.ownerId === userId
  );

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">Your Products</h2>
      <div className="row">
        {ownerProducts?.length === 0 ? (
          <p className="text-center">No products available.</p>
        ) : (
          ownerProducts?.map((product, index) => (
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Owner_Products;
