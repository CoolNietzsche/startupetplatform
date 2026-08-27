"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface RealtimeConfig {
  onMessage?: (data: any) => void;
  onNotification?: (data: any) => void;
  onTyping?: (data: any) => void;
  onUserStatus?: (data: any) => void;
}

export function useRealtime({
  onMessage,
  onNotification,
  onTyping,
  onUserStatus,
}: RealtimeConfig) {
  // Keep callback refs so the EventSource handler always sees the latest version
  // without needing to reconnect every time a callback changes.
  const onMessageRef = useRef(onMessage);
  const onNotificationRef = useRef(onNotification);
  const onTypingRef = useRef(onTyping);
  const onUserStatusRef = useRef(onUserStatus);

  // Keep refs in sync on every render
  onMessageRef.current = onMessage;
  onNotificationRef.current = onNotification;
  onTypingRef.current = onTyping;
  onUserStatusRef.current = onUserStatus;

  useEffect(() => {
    let es: EventSource;
    let retryTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      es = new EventSource("/api/notifications/stream");

      es.addEventListener("new-message", (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessageRef.current?.(data);
        } catch (err) {
          console.error("Failed to parse real-time message:", err);
        }
      });

      es.addEventListener("typing", (event) => {
        try {
          const data = JSON.parse(event.data);
          onTypingRef.current?.(data);
        } catch (err) {
          console.error("Failed to parse typing event:", err);
        }
      });

      es.addEventListener("notification", (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onNotificationRef.current) {
            onNotificationRef.current(data);
          } else {
            toast.info(data.title, { description: data.message });
          }
        } catch (err) {
          console.error("Failed to parse notification:", err);
        }
      });

      es.addEventListener("user-status", (event) => {
        try {
          const data = JSON.parse(event.data);
          onUserStatusRef.current?.(data);
        } catch (err) {
          console.error("Failed to parse user-status event:", err);
        }
      });

      es.onerror = () => {
        es.close();
        retryTimeout = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      clearTimeout(retryTimeout);
      es?.close();
    };
  }, []); // stable effect — refs handle callback updates without re-connecting
}
