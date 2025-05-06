import React from 'react';
import { Carousel, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Home() {
  const navigate = useNavigate();

  const handleShopNow = () => {
    navigate('/login');
  };

  const handleAgreeTerms = () => {
    toast.success('✅ You can now login');
  };

  return (
    <div className="bg-light">
      {/* Toast Container */}
      <ToastContainer />

      {/* Hero Carousel */}
      <Carousel fade controls={false} indicators={false}>
        <Carousel.Item interval={3000}>
          <img
            className="d-block w-100"
            src="https://designdash.com/wp-content/uploads/2023/10/2-5.png"
            alt="First slide"
            style={{ height: '80vh', objectFit: 'cover' }}
          />
          <Carousel.Caption className="text-start mb-5" style={{ bottom: '20%' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="display-4 fw-bold">Modern Furniture Collection</h1>
              <p className="lead">Transform your space with our premium designs</p>
              <Button variant="primary" size="lg" className="mt-3" onClick={handleShopNow}>
                Shop Now
              </Button>
            </motion.div>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>



      {/* Terms and Conditions */}
      <Container className="py-5">
        <h2 className="text-center mb-4">Terms and Conditions</h2>
        <p className="text-center lead mb-4">
          Our platform only facilitates the communication between the owner and the renter.
          We are not responsible for any loss, damage, or issue arising during or after
          the transaction or communication. Users are advised to verify all details and act responsibly.
        </p>
        <div className="text-center">
          <Button variant="outline-success" onClick={handleAgreeTerms}>
            I Agree to the Terms & Conditions
          </Button>
        </div>
      </Container>

     
    </div>
  );
}

export default Home;
