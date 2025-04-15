import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    async function handleRegistration(data) {
        try {
            const response = await axios.post(`http://localhost:6700/user-api/user`, data);
            console.log("User registered:", response.data);
            navigate('/login');
        } catch (error) {
            console.error("Registration failed:", error.response?.data || error.message);
        }
    }

    return (
        <div className='min-vh-100 d-flex align-items-center justify-content-center' style={{ backgroundColor: "#f8f9fa" }}>
            <div className='card p-4 shadow-lg' style={{ width: "50%", borderRadius: "15px" }}>
                <h2 className='text-center mb-4 text-primary'>Create an Account</h2>
                <form onSubmit={handleSubmit(handleRegistration)}>
                    {/* Username */}
                    <div className='mb-3'>
                        <label className='form-label'>Username</label>
                        <input type='text' {...register('username', { required: true })} className='form-control' placeholder='Enter your username' />
                        {errors.username && <small className='text-danger'>*Username is required</small>}
                    </div>
                    
                    {/* Email */}
                    <div className='mb-3'>
                        <label className='form-label'>Email</label>
                        <input type='email' {...register('email', { required: true })} className='form-control' placeholder='Enter your email' />
                        {errors.email && <small className='text-danger'>*Email is required</small>}
                    </div>
                    
                    {/* Phone Number */}
                    <div className='mb-3'>
                        <label className='form-label'>Phone Number</label>
                        <input type='number' {...register('phone', { required: true })} className='form-control' placeholder='Enter your phone number' />
                        {errors.phone && <small className='text-danger'>*Phone number is required</small>}
                    </div>
                    
                    {/* Password */}
                    <div className='mb-3'>
                        <label className='form-label'>Password</label>
                        <input type='password' {...register('password', { required: true })} className='form-control' placeholder='Enter your password' />
                        {errors.password && <small className='text-danger'>*Password is required</small>}
                    </div>
                    
                    {/* User Type */}
                    <div className='mb-3'>
                        <label className='form-label'>User Type</label>
                        <select {...register('usertype', { required: true })} className='form-select'>
                            <option value="">Select</option>
                            <option value="renter">Renter</option>
                            <option value="owner">Owner</option>
                        </select>
                        {errors.usertype && <small className='text-danger'>*User type is required</small>}
                    </div>
                    
                    {/* Address Fields */}
                    <h5 className='text-primary'>Address Details</h5>
                    <div className='mb-3'>
                        <input type='text' {...register('address.street', { required: true })} className='form-control' placeholder='Street' />
                        {errors.address?.street && <small className='text-danger'>*Street is required</small>}
                    </div>
                    <div className='mb-3'>
                        <input type='text' {...register('address.city', { required: true })} className='form-control' placeholder='City' />
                        {errors.address?.city && <small className='text-danger'>*City is required</small>}
                    </div>
                    <div className='mb-3'>
                        <input type='text' {...register('address.zipcode', { required: true })} className='form-control' placeholder='Zip Code' />
                        {errors.address?.zipcode && <small className='text-danger'>*Zip Code is required</small>}
                    </div>
                    <div className='mb-3'>
                        <input type='text' {...register('address.state', { required: true })} className='form-control' placeholder='State' />
                        {errors.address?.state && <small className='text-danger'>*State is required</small>}
                    </div>
                    
                    {/* Submit Button */}
                    <button type='submit' className='btn btn-primary w-100 py-2'>Register</button>
                </form>
            </div>
        </div>
    );
}

export default Register;