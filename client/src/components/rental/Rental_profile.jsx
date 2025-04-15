import { useContext, useEffect, useState } from "react";
import { RentalObj } from "../contexts/RentalContext";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";

function Rental_profile() {
  const { rentalDetails, handleRental } = useContext(RentalObj);
  const [editStatus, setEditStatus] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    street: "",
    city: "",
    state: "",
    zipcode: ""
  });

  useEffect(() => {
    const username = "";
    const usertype = "renter";
    handleRental({ username, usertype });
  }, []);

  useEffect(() => {
    if (rentalDetails) {
      setFormData({
        phone: rentalDetails.phone,
        street: rentalDetails.address.street,
        city: rentalDetails.address.city,
        state: rentalDetails.address.state,
        zipcode: rentalDetails.address.zipcode
      });
    }
  }, [rentalDetails]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const payload = {
        email: rentalDetails.email, 
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipcode: formData.zipcode
        }
      };
  
      const res = await axios.put("http://localhost:6700/user-api/user/update", payload);
      console.log("Updated:", res.data);
  
      handleRental({ username: "", usertype: "renter" });
  
      setEditStatus(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };
  

  return (
    <div className="container mt-5 d-flex justify-content-center">
      {rentalDetails ? (
        editStatus ? (
          <div className="w-50">
            <input type="email" className="form-control mb-3" value={rentalDetails.email} disabled />
            <input type="text" className="form-control mb-3" value={rentalDetails.usertype} disabled />
            <input
              type="number"
              className="form-control mb-3"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <input
              type="text"
              className="form-control mb-3"
              name="street"
              value={formData.street}
              onChange={handleChange}
            />
            <input
              type="text"
              className="form-control mb-3"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            <input
              type="text"
              className="form-control mb-3"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
            <input
              type="text"
              className="form-control mb-3"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleChange}
            />
            <button className="btn btn-success" onClick={handleSave}>Save</button>
          </div>
        ) : (
          <div className="card shadow-lg p-4" style={{ width: "28rem", borderRadius: "15px" }}>
            <h3 className="text-center text-primary mb-4">Renter Profile</h3>
            <ul className="list-group list-group-flush">
              <li className="list-group-item"><strong>Email:</strong> {rentalDetails.email}</li>
              <li className="list-group-item"><strong>Phone:</strong> {rentalDetails.phone}</li>
              <li className="list-group-item"><strong>User Type:</strong> {rentalDetails.usertype}</li>
              <li className="list-group-item"><strong>Address:</strong>
                <div className="ms-3">
                  <p className="mb-1"><strong>Street:</strong> {rentalDetails.address.street}</p>
                  <p className="mb-1"><strong>City:</strong> {rentalDetails.address.city}</p>
                  <p className="mb-1"><strong>State:</strong> {rentalDetails.address.state}</p>
                  <p className="mb-0"><strong>Zipcode:</strong> {rentalDetails.address.zipcode}</p>
                </div>
              </li>
            </ul>
            <button className="btn btn-success mt-3 w-25 mx-auto" onClick={() => setEditStatus(true)}>Edit</button>
            <div>
              <h3>Histroy</h3>
            </div>
          </div>
        )
      ) : (
        <div className="text-center">
          <p className="text-muted">Loading renter profile...</p>
        </div>
      )}
    </div>
  );
}

export default Rental_profile;
