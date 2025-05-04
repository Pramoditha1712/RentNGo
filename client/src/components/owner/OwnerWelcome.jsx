import { useContext } from 'react';
import { ContextObj } from '../contexts/Contexts';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function OwnerWelcome() {
  const { userDetails } = useContext(ContextObj);

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: `url('https://www.rentngo.co.uk/wp-content/uploads/2021/11/logo-grays.png')`, // Background image
        backgroundSize: 'contain', // Ensure the entire image is visible without being cropped
        backgroundPosition: 'center', // Center the image in the container
        backgroundRepeat: 'no-repeat', // Prevent repeating the image
        position: 'relative',
        height: '100vh', // Ensure the div takes the full height of the screen
      }}
    >
      {/* Apply dark overlay with backdrop filter */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay to improve readability
          backdropFilter: 'blur(10px)', // Apply blur to the background
        }}
      ></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center p-5 rounded"
        style={{
          backdropFilter: 'blur(15px)', // Optional additional blur effect for the content area
          backgroundColor: 'rgba(255, 255, 255, 0.2)', // Slight white background for content
          borderRadius: '20px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
          maxWidth: '700px',
          width: '90%',
          color: '#fff',
          position: 'relative', // Ensure the content is positioned above the overlay
          zIndex: 1, // Make sure the content is on top
        }}
      >
        <h1 className="mb-3 fw-bold" style={{ fontSize: '2.5rem', textTransform: 'uppercase' }}>
          Welcome, {userDetails?.username}!
        </h1>
        <p className="lead mb-4" style={{ fontSize: '1.2rem', fontWeight: '500' }}>
          Start managing your rentals — add exciting products and track orders effortlessly.
        </p>

        <motion.div
          className="d-flex flex-wrap justify-content-center gap-3 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {["Electronics", "Furniture", "Books", "Appliances", "Sports Gear", "Tools"].map((cat, index) => (
            <motion.div
              key={cat}
              className="px-4 py-3 border rounded"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                fontSize: '1.1rem',
                fontWeight: '600',
                textTransform: 'capitalize',
              }}
              whileHover={{ scale: 1.1, transition: { duration: 0.3 } }}
            >
              <i className="fa-solid fa-box-open me-2"></i>{cat}
            </motion.div>
          ))}
        </motion.div>

        <div className="d-flex flex-column align-items-center gap-3">
          <Link to="owneraddproducts" className="btn btn-success btn-lg px-4">
            <i className="fa-solid fa-plus me-2"></i>Add Product
          </Link>
          <Link to="owner-products" className="btn btn-outline-light px-4">
            <i className="fa-solid fa-shop me-2"></i>Your Products
          </Link>
          <Link to="ordersdisplay" className="btn btn-outline-light px-4">
            <i className="fa-solid fa-boxes-packing me-2"></i>View Orders
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default OwnerWelcome;
