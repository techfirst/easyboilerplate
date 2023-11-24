import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../contexts/userProvider";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const onSubmit = async (data) => {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;

    try {
      const response = await axios.post(`${apiUrl}/login`, data, {
        withCredentials: true,
      });
      if (response.data.success) {
        setUser(response.data.userData);
        navigate("/user/profiles"); // Adjust according to your routing
      } else {
        console.log("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
    }

    setLoading(false);
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="md:grid-cols-2 grid grid-cols-1 gap-[30px] mt-6"
    >
      <div className="md:col-span-2 col-span-1">
        <input
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
          })}
          className="from-control"
          placeholder="Email *"
        />
        {errors.email && <div className="error">{errors.email.message}</div>}
      </div>

      <div className="md:col-span-2 col-span-1">
        <input
          type="password"
          {...register("password", { required: "Password is required" })}
          className="from-control"
          placeholder="Password *"
        />
        {errors.password && (
          <div className="error">{errors.password.message}</div>
        )}
      </div>

      <button
        className="btn btn-primary mt-[10px]"
        type="submit"
        name="submit"
      >
        {loading ? "Logging in..." : "Log In"}
      </button>
    </form>
  );
};

export default LoginForm;
