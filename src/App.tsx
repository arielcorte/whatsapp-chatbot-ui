import { Helmet } from "react-helmet";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { Input } from "@/components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { cn } from "./lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";

const socket = io("http://localhost:3001");

function App() {
  const [apiState, setApiState] = useState<string>();
  const [connected, setConnected] = useState<boolean>();
  const [qrCode, setQrCode] = useState<string | undefined>();
  const [showQr, setShowQr] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

  const userIdRef = useRef<HTMLInputElement>(null);
  const apiRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    function onConnect() {
      console.log("connected to the server");
      setConnected(true);
    }

    function onDisconnect() {
      console.log("disconnected from the server");
      setConnected(false);
    }

    function onQr(qr: string) {
      console.log("qr received");
      setQrCode(qr);
    }

    function newClientStatus(status: string) {
      console.log(status);
      if (status === "success") {
        setQrCode(undefined);
        setShowQr(true);
      }
    }

    function clientReady(status: string) {
      console.log(status);
      if (status === "ready") {
        setQrCode(undefined);
        setReady(true);
        setShowQr(false);
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("qr-code", onQr);
    socket.on("new-client", newClientStatus);
    socket.on("ready", clientReady);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("qr-code", onQr);
      socket.off("new-client", newClientStatus);
      socket.off("ready", clientReady);
    };
  }, []);

  function createClient(input: HTMLInputElement | null, api: string) {
    if (!input) return;
    const userId = input.value;
    socket.emit("new-client", { userId, api });
  }

  function deleteClient(input: HTMLInputElement | null) {
    if (!input) return;
    const userId = input.value;
    socket.emit("delete-client", userId);
    setShowQr(false);
    setReady(false);
  }

  return (
    <>
      <Helmet>
        <title>ChatsappAI</title>
        <meta
          name="description"
          content="ChatsappAI, a chatbot for whatsapp. By RevHouse."
        />
      </Helmet>
      <main className="bg-green-100 h-dscreen overflow-hidden flex flex-col">
        <h1 className="text-3xl font-bold p-4 bg-green-400 text-white">
          ChatsappAI
        </h1>
        <div className="flex flex-col gap-4 justify-center items-center grow p-8">
          <p className="w-full max-w-sm">
            Connection status:{" "}
            <span className={cn(connected ? "text-green-500" : "text-red-500")}>
              {connected ? "Connected" : "Disconnected"}
            </span>
          </p>
          <div className="w-full max-w-sm">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              placeholder="+549351..."
              ref={userIdRef}
              disabled={!connected}
            />
          </div>
          <div className="w-full max-w-sm">
            <Label htmlFor="api">API</Label>
            <Select
              disabled={!connected}
              onValueChange={(value) => setApiState(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="API" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chatsapp">ChatsappAI</SelectItem>
                <SelectItem value="umma">Umma</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => createClient(userIdRef.current)}
              disabled={!connected}
            >
              Create Client
            </Button>
            <Button
              variant="outline"
              onClick={() => deleteClient(userIdRef.current)}
              disabled={!connected}
            >
              Delete Client
            </Button>
          </div>
          <div className="flex items-center justify-center grow aspect-square bg-slate-50 rounded-sm border p-6">
            {showQr ? (
              qrCode ? (
                <QRCode value={qrCode} className="w-full h-full" />
              ) : (
                <div className="flex flex-col gap-2 w-full max-w-xs items-center">
                  <div>Generating Qr...</div>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                </div>
              )
            ) : ready ? (
              <div>Client ready!</div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
