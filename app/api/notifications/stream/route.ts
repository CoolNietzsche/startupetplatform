export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import globalEmitter from "@/lib/event-emitter";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    start(controller) {
      // 1. Send the initial connection response to establish the stream
      controller.enqueue(encoder.encode(`event: connected\ndata: {"status": "connected"}\n\n`));

      // 2. Define the listeners
      const onNotification = (data: any) => {
        if (data.userId === userId) {
          // Unblock the main event emitter
          setTimeout(() => {
            try { controller.enqueue(encoder.encode(`event: notification\ndata: ${JSON.stringify(data)}\n\n`)); } catch(e) {}
          }, 0);
        }
      };
 
      const onNewMessage = (data: any) => {
        if (data.recipientIds?.includes(userId)) {
          setTimeout(() => {
            try { controller.enqueue(encoder.encode(`event: new-message\ndata: ${JSON.stringify(data)}\n\n`)); } catch(e) {}
          }, 0);
        }
      };

      const onTyping = (data: any) => {
        if (data.recipientIds?.includes(userId)) {
          setTimeout(() => {
            try { controller.enqueue(encoder.encode(`event: typing\ndata: ${JSON.stringify(data)}\n\n`)); } catch(e) {}
          }, 0);
        }
      };

      const onUserStatus = (data: any) => {
        // Broadcast presence to all (or specific) interested users
        setTimeout(() => {
          try { controller.enqueue(encoder.encode(`event: user-status\ndata: ${JSON.stringify(data)}\n\n`)); } catch(e) {}
        }, 0);
      };

      // 3. Attach listeners
      globalEmitter.on("new-notification", onNotification);
      globalEmitter.on("new-message", onNewMessage);
      globalEmitter.on("typing", onTyping);
      globalEmitter.on("user-status", onUserStatus);

      // 4. Send heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: heartbeat\n\n`));
      }, 10000); // 10s heartbeat for more stability

      // 6. Broadcast online status
      globalEmitter.emit('user-status', { userId, status: 'online' });

      // 7. Cleanup
      req.signal.addEventListener("abort", () => {
        globalEmitter.off("new-notification", onNotification);
        globalEmitter.off("new-message", onNewMessage);
        globalEmitter.off("typing", onTyping);
        globalEmitter.off("user-status", onUserStatus);
        
        clearInterval(heartbeat);
        
        // Broadcast offline status
        globalEmitter.emit('user-status', { userId, status: 'offline' });
        
        controller.close();
      });
    }
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform, no-store, must-revalidate",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Critical for Nginx/Proxy environments to disable buffering
    },
  });
}
