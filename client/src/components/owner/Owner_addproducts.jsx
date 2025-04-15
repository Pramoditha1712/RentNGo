import { useForm } from "react-hook-form";
import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ContextObj } from "../contexts/Contexts";
import { productObj } from "../contexts/ProductsContext";

function Owner_addproducts() {
  const { register, handleSubmit, reset } = useForm();
  const { userDetails } = useContext(ContextObj);
  const { fetchProducts, products } = useContext(productObj); 
  const navigate = useNavigate();

  const localUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const user = localUser || userDetails;
  const userId = user?.userid || user?._id;

  async function handleOwnerForm(data) {
    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      alert("User ID is missing or invalid. Please log in again.");
      return;
    }

    data.ownerId = userId;
    data.availability = data.availability === "true" || data.availability === true;
    data.rentPrice = parseFloat(data.rentPrice);

    if (typeof data.imgUrls === "string") {
      data.imgUrls = data.imgUrls.split(",").map((url) => url.trim());
    }

    try {
      await axios.post(`http://localhost:6700/owner-api/owner`, data);
      alert("Product added successfully!");
      reset();             
      fetchProducts();      
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Failed to submit product.");
    }
  }

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">Add a New Product</h2>
      <form onSubmit={handleSubmit(handleOwnerForm)} className="border p-4 rounded shadow-sm bg-light">

        <div className="mb-3">
          <label className="form-label">Product Image URLs (comma separated):</label>
          <input type="text" {...register('imgUrls')} className="form-control" placeholder="https://image1.jpg, https://image2.jpg" />
        </div>

        <div className="mb-3">
          <label className="form-label">Product Category:</label>
          <input type="text" {...register('category')} className="form-control" placeholder="Electronics, Furniture..." />
        </div>

        <div className="mb-3">
          <label className="form-label">Product Name:</label>
          <input type="text" {...register('nameOfProduct')} className="form-control" />
        </div>

        <div className="mb-3">
          <label className="form-label">Description:</label>
          <textarea {...register('description')} className="form-control" rows="3" />
        </div>

        <div className="mb-3">
          <label className="form-label">Rent Price (per day):</label>
          <input type="number" step="0.01" {...register('rentPrice')} className="form-control" />
        </div>

        <div className="mb-3">
          <label className="form-label">Availability:</label>
          <select {...register('availability')} className="form-select">
            <option value={true}>Available</option>
            <option value={false}>Not Available</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary w-100">Submit Product</button>
      </form>
</div>
      
  );
}

export default Owner_addproducts;