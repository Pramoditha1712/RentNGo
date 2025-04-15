import { useContext, useEffect, useState } from "react";
import { ContextObj } from "../contexts/Contexts";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

function Owner_profile() {
  const { userDetails } = useContext(ContextObj);
  const [editStatus, setEditStatus] = useState(false);
  const [ownerData, setOwnerData] = useState(null);
  const [formData, setFormData] = useState({
    phone: "",
    street: "",
    city: "",
    state: "",
    zipcode: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (userDetails) {
      setOwnerData(userDetails);
    } else if (storedUser) {
      setOwnerData(JSON.parse(storedUser));
    }
  }, [userDetails]);

  useEffect(() => {
    if (ownerData) {
      setFormData({
        phone: ownerData.phone || "",
        street: ownerData.address?.street || "",
        city: ownerData.address?.city || "",
        state: ownerData.address?.state || "",
        zipcode: ownerData.address?.zipcode || ""
      });
    }
  }, [ownerData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const payload = {
        email: ownerData.email,
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

      // Update local state
      const updatedUser = { ...ownerData, ...payload };
      updatedUser.address = payload.address;
      setOwnerData(updatedUser);
      localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

      setEditStatus(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  if (!ownerData) {
    return (
      <div className="text-center mt-5">
        <p className="text-muted">Loading owner profile...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 d-flex justify-content-center">
      {editStatus ? (
        <div className="w-50">
          <input type="email" className="form-control mb-3" value={ownerData.email} disabled />
          <input type="text" className="form-control mb-3" value={ownerData.usertype} disabled />
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
          <h3 className="text-center text-primary mb-4">Owner Profile</h3>
          <ul className="list-group list-group-flush">
            <li className="list-group-item"><strong>Email:</strong> {ownerData.email}</li>
            <li className="list-group-item"><strong>Phone:</strong> {ownerData.phone}</li>
            <li className="list-group-item"><strong>User Type:</strong> {ownerData.usertype}</li>
            <li className="list-group-item"><strong>Address:</strong>
              <div className="ms-3">
                <p className="mb-1"><strong>Street:</strong> {ownerData.address?.street}</p>
                <p className="mb-1"><strong>City:</strong> {ownerData.address?.city}</p>
                <p className="mb-1"><strong>State:</strong> {ownerData.address?.state}</p>
                <p className="mb-0"><strong>Zipcode:</strong> {ownerData.address?.zipcode}</p>
              </div>
            </li>
          </ul>
          <button className="btn btn-success mt-3 w-25 mx-auto" onClick={() => setEditStatus(true)}>Edit</button>
        </div>
      )}
    </div>
  );
}

export default Owner_profile;
