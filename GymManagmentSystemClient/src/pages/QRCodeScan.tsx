import React from "react";
import Scanner from "../components/Scanner";

const QRCodeScan: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-center">Scan Your QR</h1>
      <Scanner />
    </div>
  );
};

export default QRCodeScan;