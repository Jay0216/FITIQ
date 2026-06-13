import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

const QRScanner: React.FC = () => {
  const [result, setResult] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleScan = async (res: any) => {
    if (res && res[0]?.rawValue) {
      const membershipId = res[0].rawValue;
      setResult(membershipId);

      try {
        const response = await fetch("http://localhost:8080/api/attendance/mark", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ membershipId }),
        });

        const data = await response.json();

        if (data.status === "success") {
          setMessage("✅ Attendance marked successfully!");
        } else {
          setMessage(`❌ Error: ${data.message}`);
        }
      } catch (err) {
        console.error(err);
        setMessage("❌ Error marking attendance");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-xl font-semibold">QR Code Scanner</h2>

      <div className="w-[300px] h-[300px] border-2 border-gray-400 rounded-lg overflow-hidden">
        <Scanner
          onScan={handleScan}
          onError={(error) => console.error(error)}
          constraints={{ facingMode: "environment" }}
        />
      </div>

      {result && (
        <div className="mt-4 p-2 bg-green-100 rounded">
          <p>✅ Scanned Result:</p>
          <p className="font-mono">{result}</p>
        </div>
      )}

      {message && (
        <div className="mt-2 p-2 bg-blue-100 rounded">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default QRScanner;



