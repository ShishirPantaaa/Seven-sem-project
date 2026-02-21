import { useEffect, useState, useRef } from "react";

export default function Queue() {
  const [tokens, setTokens] = useState([]);
  const [status, setStatus] = useState("disconnected");
  const wsRef = useRef(null);

  useEffect(() => {
    // Configurable WebSocket URL; change as needed for your backend
    // Vite exposes env vars starting with VITE_; set `VITE_QUEUE_WS` in a .env file.
    const WS_URL = import.meta.env.VITE_QUEUE_WS || "ws://localhost:4000/queue";

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      setStatus("connecting");

      ws.onopen = () => setStatus("connected");

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          // Expecting messages like { type: 'snapshot'|'update', payload: [...] }
          if (data.type === "snapshot") setTokens(data.payload || []);
          else if (data.type === "update") {
            setTokens((prev) => {
              // naive merge: replace or append
              const map = new Map(prev.map((t) => [t.id, t]));
              (data.payload || []).forEach((p) => map.set(p.id, p));
              return Array.from(map.values()).sort((a, b) => a.position - b.position);
            });
          }
        } catch (e) {
          console.error("Invalid message", e);
        }
      };

      ws.onclose = () => setStatus("disconnected");
      ws.onerror = () => setStatus("error");

      return () => {
        ws.close();
      };
    } catch (e) {
      console.warn("WebSocket failed, falling back to simulation", e);
      setStatus("unavailable");
    }
  }, []);

  // Fallback simulation: if no WebSocket, simulate tokens locally
  useEffect(() => {
    if (status === "connected") return; // don't simulate when connected

    const generate = () => {
      const next = [];
      const count = 6;
      for (let i = 1; i <= count; i++) {
        next.push({
          id: i,
          label: `P-${100 + i}`,
          position: i,
          status: i === 1 ? "serving" : "waiting",
        });
      }
      setTokens(next);
    };

    generate();
    const t = setInterval(() => {
      // rotate queue
      setTokens((prev) => {
        if (!prev.length) return prev;
        const rotated = prev.map((p) => ({ ...p }));
        const first = rotated.shift();
        rotated.push({ ...first, position: rotated.length + 1 });
        return rotated.map((p, idx) => ({ ...p, position: idx + 1, status: idx === 0 ? "serving" : "waiting" }));
      });
    }, 5000);

    return () => clearInterval(t);
  }, [status]);

  return (
    <div className="min-h-[70vh] px-4 py-8 mx-auto max-w-5xl">
      <h2 className="mb-4 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
        Live Queue
      </h2>

      <div className="p-4 space-y-4 bg-slate-800 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">Connection: <span className="font-medium text-white">{status}</span></div>
          <div className="text-sm text-slate-300">Tokens: <span className="font-medium text-white">{tokens.length}</span></div>
        </div>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {tokens.map((t) => (
            <li key={t.id} className="p-4 bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-300">Token</div>
                  <div className="text-xl font-bold text-white">{t.label}</div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 text-xs rounded ${t.status === "serving" ? "bg-green-600" : "bg-slate-600"} text-white`}>{t.status}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-300">Position: {t.position}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
