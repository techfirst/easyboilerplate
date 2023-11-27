import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../../contexts/userProvider";
import { Link } from "react-router-dom";
import "../../App.css";

const Subscription = () => {
  const { user } = useContext(UserContext);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user/check-subscription`,
          {
            withCredentials: true,
          }
        );
        setHasActiveSubscription(response.data.hasActiveSubscription);
      } catch (error) {
        console.error("Error checking subscription status:", error);
        setError(
          "Failed to check subscription status. Please try again later."
        );
      }
      setIsLoading(false);
    };

    if (user.email) {
      checkSubscriptionStatus();
    }
  }, [user.email]);

  const StripePricingTable = () => {
    useEffect(() => {
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/pricing-table.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }, []);

    return React.createElement("stripe-pricing-table", {
      "pricing-table-id": process.env.REACT_APP_STRIPE_PRICING_TABLE_ID,
      "publishable-key": process.env.REACT_APP_STRIP_PUBLISHABLE_KEY,
      "customer-email": `${user.email}`,
    });
  };

  if (isLoading) {
    return (
      <div className="form-container">
        <div className="form-box">Loading ...</div>
      </div>
    );
  }

  return (
    <div className="form-container">
      {error ? (
        <div className="form-box">
          <p className="error-message">{error}</p>
        </div>
      ) : hasActiveSubscription ? (
        <div className="form-box">
          You already have an active subscription. To manage your subscription,
          please visit the{" "}
          <Link to={process.env.REACT_APP_STRIPE_CUSTOMER_PORTAL_LINK}>
            Stripe Customer Portal
          </Link>
          .
        </div>
      ) : (
        <div className="form-box">
          <StripePricingTable />
        </div>
      )}
    </div>
  );
};

export default Subscription;
