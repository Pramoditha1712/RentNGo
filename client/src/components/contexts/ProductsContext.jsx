import axios from "axios"
import { createContext, useState } from "react"
export const productObj=createContext()

function ProductsContext({children}) {
  let [productDetails,setProductDetails]=useState(null)
  async function handleProductData(data){
    const response=await axios.get(`http://localhost:6700/owner-api/owners`)
   
    setProductDetails(response.data.payload)
    
  }
  return (
    <div>
      <productObj.Provider value={{handleProductData,productDetails}}>
        {children}
      </productObj.Provider>
    </div>
  )
}

export default ProductsContext