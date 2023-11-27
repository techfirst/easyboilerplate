import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import "../App.css"; // Ensure this import path is correct for your project structure

const Register = () => {
  const [emailSent, setEmailSent] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const password = watch("password1", "");

  const onSubmit = async (data) => {
    const apiUrl = process.env.REACT_APP_API_URL;

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const body = JSON.stringify(data);
      const res = await axios.post(`${apiUrl}/api/register`, body, config);

      if (res.status === 200) {
        setEmailSent(true);
      }
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        {emailSent ? (
          <div className="form-box">
            <h4>Thank you for registering!</h4>
            <p>
              Please check your email and click the link to verify your account
              and start using our service!
            </p>
          </div>
        ) : (
          <form
            className="form-box"
            onSubmit={handleSubmit(onSubmit)}
          >
            <input
              className="form-input"
              type="text"
              placeholder="First name"
              {...register("firstname", { required: "First name is required" })}
            />
            {errors.firstname && (
              <p className="error-message">{errors.firstname.message}</p>
            )}

            <input
              className="form-input"
              type="text"
              placeholder="Last name"
              {...register("lastname", { required: "Last name is required" })}
            />
            {errors.lastname && (
              <p className="error-message">{errors.lastname.message}</p>
            )}

            <input
              className="form-input"
              type="text"
              placeholder="Company name"
              {...register("company_name")}
            />

            <input
              className="form-input"
              type="email"
              placeholder="E-mail"
              {...register("email", {
                required: "E-mail is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                  message: "Invalid e-mail address",
                },
              })}
            />
            {errors.email && (
              <p className="error-message">{errors.email.message}</p>
            )}

            <input
              className="form-input"
              type="password"
              placeholder="Password"
              {...register("password1", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must have at least 8 characters",
                },
              })}
            />
            {errors.password1 && (
              <p className="error-message">{errors.password1.message}</p>
            )}

            <input
              className="form-input"
              type="password"
              placeholder="Confirm password"
              {...register("password2", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />
            {errors.password2 && (
              <p className="error-message">{errors.password2.message}</p>
            )}

            <button
              className="form-button"
              type="submit"
            >
              Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
