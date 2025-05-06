import axios from "axios";
import { createContext, useState ,useEffect} from "react";

export const ContextObj = createContext();

function Contexts({ children }) {
  const [userDetails, setUserDetails] = useState(
    JSON.parse(localStorage.getItem("loggedInUser")) || null
  );
  const [loginStatus,setLoginStatus]=useState(false)

  useEffect(() => {
    if (userDetails === null) {
      localStorage.removeItem("loggedInUser");
    }
  }, [userDetails]);
  
  

  

  async function handleUserDetails(data) {
    try {
      if (!data?.username || !data?.password) {
        console.error("Invalid login data");
        return;
      }

      const response = await axios.get("http://localhost:6700/user-api/users");
      const users = response.data.payload;

      const loggedInUser = users.find(
        (user) => user.username === data.username && user.password === data.password
      );

      if (loggedInUser) {
        console.log("Logged-in User:", loggedInUser);
        setUserDetails(loggedInUser);
        localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));  // Save to storage
      } else {
        console.log("User not found");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }

  async function handleloginstatus(){
    setLoginStatus(false)
    setUserDetails(null)
  }

  return (
    <ContextObj.Provider value={{ userDetails, setUserDetails, handleUserDetails,handleloginstatus }}>
      {children}
    </ContextObj.Provider>
  );
}

export default Contexts;
