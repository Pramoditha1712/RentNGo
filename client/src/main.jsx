import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Contexts from './components/contexts/Contexts.jsx'
import RentalContext from './components/contexts/RentalContext.jsx'
import ProductsContext from './components/contexts/ProductsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Contexts>
      <RentalContext>
        <ProductsContext>
          <App />
        </ProductsContext>
      </RentalContext>
    </Contexts>
  </StrictMode>,
)
