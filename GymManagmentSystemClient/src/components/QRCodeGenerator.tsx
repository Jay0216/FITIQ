import React from "react";
import { QRCodeCanvas } from "qrcode.react";

const QRCodeGenerator: React.FC = () => {
  const dummyUser = {
    id: "U001",
    name: "John Doe",
    role: "Member"
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-xl font-semibold">Dummy User QR Code</h2>
      <QRCodeCanvas
        value={JSON.stringify(dummyUser)}
        size={200}
        includeMargin={true}
      />
      <p>Scan this QR with your scanner page.</p>
    </div>
  );
};

export default QRCodeGenerator;
