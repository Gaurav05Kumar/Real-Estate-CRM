import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  // Removed name field
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const res = await axios.post("/api/auth/register", data);
         console.log(res.data);
      setSuccess("Registration successful! Please login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="12" fill="#EEF2FF"/>
            <path d="M24 14L34 22V34H14V22L24 14Z" fill="#4F46E5"/>
          </svg>
        </div>
        <h1>Register</h1>
        <p>Create your account with email</p>

        {error && (
          <div style={{ 
            padding: '12px', 
            background: '#fee2e2', 
            color: '#b91c1c', 
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ 
            padding: '12px', 
            background: '#d1fae5', 
            color: '#047857', 
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>


          {/* Name Field Removed */}

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>


          {/* Password Field */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{ paddingRight: '40px' }}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                opacity: 0.8
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={0}
              role="button"
            >
              {showPassword ? (
                // Eye-off SVG
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="22" height="22">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.584 10.587A2.25 2.25 0 0112 9.75c1.243 0 2.25 1.007 2.25 2.25 0 .414-.112.803-.308 1.134m-1.358 1.358A2.25 2.25 0 0112 14.25c-1.243 0-2.25-1.007-2.25-2.25 0-.414.112-.803.308-1.134m1.358-1.358A2.25 2.25 0 0112 9.75m0 0c3.728 0 6.75 3 6.75 3s-.857 1.03-2.25 2.25m-9-2.25s.857-1.03 2.25-2.25m0 0c-.414.112-.803.308-1.134.308m1.134-.308c.414-.112.803-.308 1.134-.308m0 0c.414.112.803.308 1.134.308" />
                </svg>
              ) : (
                // Eye SVG
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="22" height="22">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.022-4.5 9.75-4.5 9.75 4.5 9.75 4.5-3.022 4.5-9.75 4.5S2.25 12 2.25 12z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </span>
          </div>

          {/* Confirm Password Field */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Confirm Password</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              style={{ paddingRight: '40px' }}
            />
            <span
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                opacity: 0.8
              }}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              tabIndex={0}
              role="button"
            >
              {showConfirmPassword ? (
                // Eye-off SVG
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="22" height="22">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.584 10.587A2.25 2.25 0 0112 9.75c1.243 0 2.25 1.007 2.25 2.25 0 .414-.112.803-.308 1.134m-1.358 1.358A2.25 2.25 0 0112 14.25c-1.243 0-2.25-1.007-2.25-2.25 0-.414.112-.803.308-1.134m1.358-1.358A2.25 2.25 0 0112 9.75m0 0c3.728 0 6.75 3 6.75 3s-.857 1.03-2.25 2.25m-9-2.25s.857-1.03 2.25-2.25m0 0c-.414.112-.803.308-1.134.308m1.134-.308c.414-.112.803-.308 1.134-.308m0 0c.414.112.803.308 1.134.308" />
                </svg>
              ) : (
                // Eye SVG
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="22" height="22">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.022-4.5 9.75-4.5 9.75 4.5 9.75 4.5-3.022 4.5-9.75 4.5S2.25 12 2.25 12z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </span>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Register
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
          Already have an account? <a href="/login" style={{ color: '#4f46e5', fontWeight: 500 }}>Login</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
