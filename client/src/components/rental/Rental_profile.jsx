import { useContext, useEffect, useState } from "react";
import { RentalObj } from "../contexts/RentalContext"; // Adjust the import path as necessary

const Rental_profile = () => {
  const { handleRental, rentalDetails } = useContext(RentalObj);
  const [isLoading, setIsLoading] = useState(true); // State for loading status

  useEffect(() => {
    // Retrieve the logged-in user's details from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    

    if (loggedInUser) {
      // Call handleRental using the logged-in username and usertype
      handleRental({ username: loggedInUser.username, usertype: loggedInUser.usertype });
    } else {
      console.log("No logged-in user found in localStorage");
    }
  }, [handleRental]); // Empty dependency array ensures it only runs once on mount

  // Log the rentalDetails only when it changes and is fetched
  useEffect(() => {
    if (rentalDetails) {
      console.log("Fetched rental details:", rentalDetails);
      setIsLoading(false); // Stop loading once rental details are fetched
    }
  }, [rentalDetails]); // This will log only when rentalDetails updates

  return (
    <div className="container mt-5">
      {isLoading ? (
        <div className="d-flex justify-content-center">
          <p>Loading...</p>
        </div>
      ) : rentalDetails ? (
        <div className="profile-card p-4 shadow-lg">
          <h2>{rentalDetails.username}'s Profile</h2>

          {/* Display profile picture if available */}
          {rentalDetails.profilePicture ? (
            <img
              src={rentalDetails.profilePicture}
              alt="Profile"
              className="img-fluid rounded-circle mb-3"
              style={{ width: "150px", height: "150px", objectFit: "cover" }}
            />
          ) : (
            <div className="mb-3">
              <p>No Profile Picture</p>
            </div>
          )}

          {/* Dynamic fields displaying user's information */}
          <div className="profile-info">
            <p><strong>Username:</strong> {rentalDetails.username}</p>
            <p><strong>Email:</strong> {rentalDetails.email || "Not available"}</p>
            <p><strong>User Type:</strong> {rentalDetails.usertype}</p>
            <p><strong>Phone:</strong> {rentalDetails.phone || "Not available"}</p>
            {/* Add more fields as necessary */}
          </div>

          {/* Optional: Add a button or actions for updating the profile */}
          <button className="btn btn-primary mt-3">Edit Profile</button>
        </div>
      ) : (
        <div className="d-flex justify-content-center">
          <p>No user details found or error occurred!</p>
        </div>
      )}
    </div>
  );
};

export default Rental_profile;
