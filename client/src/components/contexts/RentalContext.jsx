import axios from "axios";
import { createContext, useState } from "react";

export const RentalObj = createContext();

function RentalContext({ children }) {
  const [rentalDetails, setRentalDetails] = useState(null);
  
  // Function to fetch rental details based on username and usertype
  async function handleRental({ username, usertype }) {
    try {
      // Call the API endpoint to get the user by username
      const res = await axios.get(`http://localhost:6700/user-api/user/name/${username}`);
      console.log("API Response:", res.data);  // Log the response data to check if it's correct

      const userData = res.data.payload;  // Since the response contains the user in payload
      
      // If no user found, log a message
      if (!userData || userData.usertype !== usertype) {
        console.log("No user found with the given username and usertype.");
      } else {
        // Set the rental details if a user is found
        setRentalDetails(userData);
          // Log the rental details
      }
    } catch (err) {
      console.error("Failed to fetch rental details:", err);
    }
  }

  return (
    <RentalObj.Provider value={{ rentalDetails, handleRental }}>
      {children}
    </RentalObj.Provider>
  );
}

export default RentalContext;
