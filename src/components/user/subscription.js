import React, { useContext, useEffect } from "react";
import { UserContext } from "../../contexts/userProvider";

const Subscription = () => {
  const StripePricingTable = () => {
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

    return React.createElement("stripe-pricing-table", {
      "pricing-table-id": "prctbl_1OGgiQFHE9uClOn5lmwKvK9r",
      "publishable-key": process.env.REACT_APP_STRIP_PUBLISHABLE_KEY,
      "customer-email": `${user.email}`,
    });
  };

  return (
    <div>
      <br />
      <StripePricingTable />
    </div>
  );
};

export default Subscription;
