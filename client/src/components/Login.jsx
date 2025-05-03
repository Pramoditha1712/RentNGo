import React, { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ContextObj } from '../components/contexts/Contexts';

function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { userDetails, setUserDetails } = useContext(ContextObj); 
  const [error, setError] = useState(''); 
  const navigate = useNavigate();

  useEffect(() => {
    if (userDetails?.usertype === "owner") {
      navigate('/owner');
    } else if (userDetails?.usertype === "renter") {
      navigate('/rental');
    }
  }, [userDetails, navigate]);

  async function handleLogin(data) {
    try {
      const response = await axios.get("http://localhost:6700/user-api/users");
      const users = response.data.payload;
      const loggedInUser = users.find(
        (user) => user.username === data.username && user.password === data.password
      );

      if (!loggedInUser) {
        setError('Invalid username or password');
        return;
      }

      setUserDetails(loggedInUser); // Update context
      localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser)); // ✅ Consistent key

    } catch (error) {
      setError('Login failed. Please try again.');
      console.error("Login error:", error);
    }
  }

  return (
    <div className='min-vh-100 d-flex align-items-center justify-content-center' style={{ backgroundColor: "#f8f9fa" }}>
      <div className='card p-4 shadow-lg' style={{ width: "40%", borderRadius: "15px" }}>
        <h2 className='text-center mb-4 text-primary'>Login</h2>
        <form onSubmit={handleSubmit(handleLogin)}>
          <div className='mb-3'>
            <label className='form-label'>Username</label>
            <input
              type='text'
              className='form-control'
              {...register('username', { required: true })}
              placeholder='Enter your username'
            />
            {errors.username && <small className='text-danger'>*Username is required</small>}
          </div>

          <div className='mb-3'>
            <label className='form-label'>Password</label>
            <input
              type='password'
              className='form-control'
              {...register('password', { required: true })}
              placeholder='Enter your password'
            />
            {errors.password && <small className='text-danger'>*Password is required</small>}
          </div>

          {error && <p className='text-danger text-center'>{error}</p>}

          <button type='submit' className='btn btn-primary w-100 py-2'>Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
