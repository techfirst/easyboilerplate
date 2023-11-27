import React, { useEffect, useContext } from "react";
import { UserContext } from "../contexts/userProvider";

const StripePriceTable = () => {
  const { user } = useContext(UserContext);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    user !== null &&
    React.createElement("stripe-pricing-table", {
      "pricing-table-id": process.env.REACT_APP_STRIPE_PRICING_TABLE_ID,
      "publishable-key": process.env.REACT_APP_STRIP_PUBLISHABLE_KEY,
      "customer-email": `${user.email}`,
    })
  );
};

export default StripePriceTable;
