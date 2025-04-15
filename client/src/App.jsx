import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import RootLayout from './components/RootLayout'
import Home from './components/Home'
import Register from './components/Register'
import Login from './components/Login'
import Rental from './components/rental/Rental'
import Owner from './components/owner/Owner'
import Rental_home from './components/rental/Rental_home'
import Rental_profile from './components/rental/Rental_profile'
import Owner_addproducts from './components/owner/Owner_addproducts'
import Owner_profile from './components/owner/Owner_profile'
import Owner_Products from './components/owner/Owner_Products'
import Rental_Cart from './components/rental/Rental_Cart'

function App() {
  const router = createBrowserRouter([
    {
      path:"",
      element:<RootLayout />,
      children:[
        {
          path:"",
          element:<Home />
        },
        {
          path:"register",
          element:<Register />
        },
        {
          path:"login",
          element:<Login />
        },
        {
          path:"rental",
          element:<Rental />,
          children:[
            {
              path:"",
              element:<Rental_home />
            },
            {
              path:"rentalprofile",
              element:<Rental_profile />
            },
            {
              path:"rentalcart",
              element:<Rental_Cart />
            }
          ]
        },
        {
          path:"owner",
          element:<Owner />,
          children:[
            {
              path:"owneraddproducts",
              element:<Owner_addproducts />
            },
            {
              path:"",
              element:<Owner_profile />
            },
            {
              path:"owner-products",
              element:<Owner_Products />
            }

          ]
        }
      ]
    }
  ])
  return (
    <div>
      <RouterProvider router={router}></RouterProvider>
    </div>
  )
}

export default App