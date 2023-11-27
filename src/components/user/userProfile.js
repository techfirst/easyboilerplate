import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Logout from "./logout";
import axios from "axios";
import "../../App.css";

const UserProfile = () => {
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/getuser`,
          { withCredentials: true }
        );
        if (response.data.success) {
          const userData = response.data.user;

          setValue("firstname", userData.firstname);
          setValue("lastname", userData.lastname);
          setValue("companyName", userData.company_name);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [setValue]);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/update`,
        data,
        { withCredentials: true }
      );
      setResponseMessage(response.data.message);
      setUpdateSuccess(true);
    } catch (error) {
      console.error("Update Error:", error);
      setResponseMessage(error.response?.data?.message || "Update failed");
      setUpdateSuccess(false);
    }
  };

  return (
    <div className="form-container">
      {updateSuccess ? (
        <div className="form-box">
          <p>{responseMessage}</p>
        </div>
      ) : (
        <form
          className="form-box"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            className="form-input"
            type="text"
            placeholder="First Name"
            {...register("firstname", { required: "First name is required" })}
          />
          {errors.firstname && (
            <p className="error-message">{errors.firstname.message}</p>
          )}

          <input
            className="form-input"
            type="text"
            placeholder="Last Name"
            {...register("lastname", { required: "Last name is required" })}
          />
          {errors.lastname && (
            <p className="error-message">{errors.lastname.message}</p>
          )}

          <input
            className="form-input"
            type="text"
            placeholder="Company Name"
            {...register("companyName")}
          />

          <button
            type="submit"
            className="form-button"
          >
            Save
          </button>
          <hr />
          <Logout />
        </form>
      )}
    </div>
  );
};

export default UserProfile;
