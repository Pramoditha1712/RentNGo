import axios from "axios"
import { createContext, useState } from "react"
export const RentalObj = createContext()

function RentalContext({children}) {
    let [rentalDetails,setRentalDetails]=useState(null)
    async function handleRental({username,usertype}){
        let res=await axios.get("http://localhost:6700/user-api/users")
        let userData=res.data.payload.find(user => user.usertype==="renter")
        setRentalDetails(userData)
        // console.log(rentalDetails)
    }
  return (
    <div>
        <RentalObj.Provider value={{rentalDetails,handleRental}}>
            {children}
        </RentalObj.Provider>
    </div>
  )
}

export default RentalContext