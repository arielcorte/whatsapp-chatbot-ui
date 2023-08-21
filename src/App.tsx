import { Helmet } from "react-helmet";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { Input } from "@/components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { cn } from "./lib/utils";

const socket = io("http://localhost:3000");

function App() {
  const [apiUrl, setApiUrl] = useState<string>();
  const [apiKey, setApiKey] = useState<string>();
  const [connected, setConnected] = useState<boolean>();
  const [qrCode, setQrCode] = useState<string | undefined>();
  const [showQr, setShowQr] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

  const userIdRef = useRef<HTMLInputElement>(null);
  const apiUrlRef = useRef<HTMLInputElement>(null);
  const apiKeyRef = useRef<HTMLInputElement>(null);

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

  function createClient(userId: string, api: string, key: string) {
    socket.emit("new-client", { userId, api, key });
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
        <section className="flex gap-8 items-center grow p-8">
          <div className="flex flex-col gap-4 justify-center items-center grow">
            <p className="w-full max-w-sm">
              Connection status:{" "}
              <span
                className={cn(connected ? "text-green-500" : "text-red-500")}
              >
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
              <Input
                id="api"
                placeholder="+549351..."
                ref={apiUrlRef}
                disabled={!connected}
              />
            </div>
            <div className="w-full max-w-sm">
              <Label htmlFor="key">Key</Label>
              <Input
                id="Key"
                placeholder="+549351..."
                ref={apiKeyRef}
                disabled={!connected}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (
                    userIdRef.current &&
                    apiUrlRef.current &&
                    apiKeyRef.current
                  ) {
                    createClient(
                      userIdRef.current.value,
                      apiUrlRef.current.value,
                      apiKeyRef.current.value
                    );
                  }
                }}
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
          </div>
          <div className="flex items-center justify-center grow aspect-square bg-slate-50 rounded-sm border p-6 max-w-md">
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
        </section>
      </main>
    </>
  );
}

export default App;
