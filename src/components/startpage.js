import React from "react";
import "./startpage.css";
import StripePriceTable from "./stripepricetable";

const StartPage = () => {
  return (
    <div className="start-page">
      <h1>Welcome to your new project</h1>
      <p>
        Let's get started - The magic you are looking for is in the work you are
        avoiding
      </p>
      {/* <button className="form-button btn-start">Register now</button> */}
      <div className="startpage-price-table">
        <StripePriceTable />
      </div>
    </div>
  );
};

export default StartPage;
