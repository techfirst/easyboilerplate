import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import LoginForm from "../loginForm";

const VerifyUser = () => {
  const { token } = useParams();
  const [verificationStatus, setVerificationStatus] = useState({
    loading: true,
    success: false,
    error: false,
  });

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/user/verify-user?token=${token}`
        );
        if (response.status === 200) {
          setVerificationStatus({
            loading: false,
            success: true,
            error: false,
          });
        } else {
          setVerificationStatus({
            loading: false,
            success: false,
            error: true,
          });
        }
      } catch (error) {
        setVerificationStatus({ loading: false, success: false, error: true });
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <div>
      {verificationStatus.loading && <p>Verifying...</p>}
      {verificationStatus.success && (
        <div>
          <p>
            Your account has been successfully verified. You can now log in.
          </p>
          <LoginForm />
        </div>
      )}
      {verificationStatus.error && (
        <p>
          Verification failed. Please try again or contact support for help.
        </p>
      )}
    </div>
  );
};

export default VerifyUser;
