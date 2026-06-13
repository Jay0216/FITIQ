import React from "react";
import landingImage from "../assets/2150845530.jpg";
import HeadingText from "./HeadingText";

const Background: React.FC = () => {
  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: `url(${landingImage})`,
      }}
    >

      <HeadingText/>
    
    </div>
  );
};

export default Background;




