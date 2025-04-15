import axios from "axios"
import { createContext, useState } from "react"
export const productObj=createContext()

function ProductsContext({children}) {
  let [productDetails,setProductDetails]=useState(null)
  async function handleProductData(data){
    const response=await axios.get(`http://localhost:6700/owner-api/owners`)
    console.log(response.data.payload)
    setProductDetails(response.data.payload)
    console.log("pd",productDetails)
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