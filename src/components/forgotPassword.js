import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import "../App.css";

function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [message, setMessage] = useState("");
  const BASE_API_URL = process.env.REACT_APP_API_URL;

  const onSubmit = async (data) => {
    try {
      await axios.post(`${BASE_API_URL}/api/forgot-password`, data);
      setMessage(
        "If an account with that e-mail exists, a password reset link has been sent."
      );
    } catch (error) {
      // Use the server-side error message
      const errorMessage =
        error.response?.data?.message ||
        "Error occurred while sending reset link.";
      setMessage(errorMessage);
    }
  };

  return (
    <div className="form-container">
      <form
        className="form-box"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="form-input-group">
          <input
            type="email"
            {...register("email", {
              required: "E-mail is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: "Invalid email format",
              },
            })}
            className="form-input"
            placeholder="Enter your e-mail"
          />
          {errors.email && (
            <div className="error-message">{errors.email.message}</div>
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
    </div>
  );
}

export default ForgotPassword;
