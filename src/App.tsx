import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Input } from "@/components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";

const socket = io("http://localhost:3000");

function App() {
  const [qrCode, setQrCode] = useState();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected to the server");
    });

    return () => {
      socket.off("connect", () => {
        console.log("connected to the server");
      });
    };
  }, []);

  return (
    <main className="bg-green-100 h-dscreen overflow-hidden flex flex-col">
      <h1 className="text-3xl font-bold p-4 bg-green-400 text-white">
        ChatsApp
      </h1>
      <div className="flex flex-col gap-4 justify-center items-center grow p-8">
        <p className="w-full max-w-sm">Conection status: </p>
        <div className="w-full max-w-sm">
          <Label htmlFor="userId">User ID</Label>
          <Input id="userId" placeholder="+549351..." />
        </div>
        <div className="flex gap-2">
          <Button>Create Client</Button>
          <Button variant="outline">Delete Client</Button>
        </div>
        <div className="flex items-center justify-center grow aspect-square bg-slate-50 rounded-sm border p-6">
          {true ? (
            <QRCode value="hey" className="w-full h-full" />
          ) : (
            <div>Generating Qr...</div>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
