import { useEffect, useRef } from "react";
import Peer from "peerjs";

export function usePeer(onMessage) {
  const peerRef = useRef(null);
  const connections = useRef([]);

  useEffect(() => {
    const peer = new Peer({
      debug: 3, // Enable verbose logging
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478?transport=udp" },
        ],
      },
    });

    peerRef.current = peer;

    peer.on("open", (id) => {
      console.log("My Peer ID:", id);
      window.myPeerId = id;
    });

    peer.on("error", (err) => {
      console.error("PeerJS error:", err);
    });

    peer.on("connection", (conn) => {
      console.log("Incoming connection from:", conn.peer);

      conn.on("open", () => {
        console.log("Connection established with:", conn.peer);
      });

      conn.on("data", (msg) => {
        console.log("Received message from", conn.peer, ":", msg);
        if (msg?.type === "search") {
          const value = localStorage.getItem(msg.key);
          if (value) {
            conn.send({
              type: "response",
              key: msg.key,
              data: JSON.parse(value),
              peerId: window.myPeerId,
            });
          }
        } else {
          onMessage(msg);
        }
      });

      conn.on("close", () => {
        console.log("Connection closed with:", conn.peer);
        connections.current = connections.current.filter(
          (c) => c.peer !== conn.peer
        );
      });

      connections.current.push(conn);
    });

    return () => {
      connections.current.forEach((conn) => conn.close());
      peer.destroy();
    };
  }, [onMessage]);

  function connectToPeer(peerId) {
    return new Promise((resolve, reject) => {
      const conn = peerRef.current.connect(peerId, {
        reliable: true,
        serialization: "json",
      });

      conn.on("open", () => {
        console.log(`Connected to ${peerId}`);
        connections.current.push(conn);
        resolve(conn);
      });

      conn.on("error", (err) => {
        console.error("Connection error:", err);
        reject(err);
      });
    });
  }

  function sendToAllPeers(msg) {
    connections.current.forEach((conn) => {
      if (conn.open) {
        console.log("Sending to peer:", conn.peer, msg);
        conn.send({
          ...msg,
          peerId: window.myPeerId, // Always include sender ID
        });
      }
    });
  }

  return { connectToPeer, sendToAllPeers };
}
