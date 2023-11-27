import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../contexts/userProvider";
import "../App.css";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(""); // State to handle login errors
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const onSubmit = async (data) => {
    setLoading(true);
    setLoginError(""); // Reset login error message

    const apiUrl = process.env.REACT_APP_API_URL;

    try {
      const response = await axios.post(`${apiUrl}/api/login`, data, {
        withCredentials: true,
      });
      console.log(response.data);
      if (response.data.success) {
        setUser(response.data.user);
        navigate("/user/profile"); // Adjust according to your routing
      } else {
        setLoginError("Login failed. Please try again."); // Setting custom error message
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || "Login error occurred.");
      console.error("Login error:", error);
    }

    setLoading(false);
  };

  const gotoForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="container">
      <div className="form-container">
        <form
          className="form-box"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="form-input-group">
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                  message: "Invalid email format",
                },
              })}
              className="form-input"
              placeholder="Email *"
            />
            {errors.email && (
              <div className="error-message">{errors.email.message}</div>
            )}
          </div>

          <div className="form-input-group">
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className="form-input"
              placeholder="Password *"
            />
            {errors.password && (
              <div className="error-message">{errors.password.message}</div>
            )}
          </div>

          {loginError && <div className="error-message">{loginError}</div>}

          <button
            className="form-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
          <button
            onClick={gotoForgotPassword}
            type="button"
            className="form-button"
          >
            Forgot password?
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
