import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

const Register = () => {
  const [emailSent, setEmailSent] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const password = watch("password1");

  const onSubmit = async (data) => {
    const newUser = {
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      password: data.password1,
    };

    const apiUrl = process.env.REACT_APP_API_URL;

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const body = JSON.stringify(newUser);
      const res = await axios.post(`${apiUrl}/api/user/register`, body, config);

      if (res.status === 200) {
        setEmailSent(true);
      }
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return emailSent ? (
    <div>
      <h4>Thank you for registering!</h4>
      <p>
        Please check your email and click the link to verify your account and
        start using our service!
      </p>
    </div>
  ) : (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="text"
        placeholder="First name"
        {...register("firstname", { required: "First name is required" })}
      />
      {errors.firstname && <p>{errors.firstname.message}</p>}

      <input
        type="text"
        placeholder="Last name"
        {...register("lastname", { required: "Last name is required" })}
      />
      {errors.lastname && <p>{errors.lastname.message}</p>}

      <input
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
      {errors.email && <p>{errors.email.message}</p>}

      <input
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
      {errors.password1 && <p>{errors.password1.message}</p>}

      <input
        type="password"
        placeholder="Confirm password"
        {...register("password2", {
          required: "Please confirm your password",
          validate: (value) => value === password || "Passwords do not match",
        })}
      />
      {errors.password2 && <p>{errors.password2.message}</p>}

      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
