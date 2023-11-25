import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import "../App.css";

function ResetPassword() {
  const { token } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [message, setMessage] = useState("");
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);
  const BASE_API_URL = process.env.REACT_APP_API_URL;

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      await axios.post(`${BASE_API_URL}/api/reset-password`, {
        token,
        password: data.password,
      });
      setMessage("Your password has been successfully reset");
      setIsResetSuccessful(true);
    } catch (error) {
      // Extracting the message from the server response
      const serverMessage =
        error.response?.data?.message || "Failed to reset password";
      setMessage(serverMessage);
    }
  };

  return (
    <div className="form-container">
      {!isResetSuccessful ? (
        <form
          className="form-box"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="form-input-group">
            <input
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters long",
                },
              })}
              className="form-input"
              placeholder="New Password"
            />
            {errors.password && (
              <div className="error-message">{errors.password.message}</div>
            )}
          </div>
          <div className="form-input-group">
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Confirm Password is required",
              })}
              className="form-input"
              placeholder="Confirm New Password"
            />
            {errors.confirmPassword && (
              <div className="error-message">
                {errors.confirmPassword.message}
              </div>
            )}
          </div>
          <button
            className="form-button"
            type="submit"
          >
            Reset Password
          </button>
          {message && <div className="message">{message}</div>}
        </form>
      ) : (
        <div>
          <div className="success-message">{message}</div>
          <Link to="/login">Go to Login Page</Link>
        </div>
      )}
    </div>
  );
}

export default ResetPassword;
