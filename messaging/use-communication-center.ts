"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { 
  getConversationDetails, 
  sendThreadMessage, 
  markThreadNotificationsAsRead, 
  sendTypingStatus 
} from "@/lib/actions/communication";
import { useRealtime } from "@/hooks/use-realtime";
import { Participancy, ChatMessage } from "./types";

export function useCommunicationCenter(initialInbox: Participancy[]) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const [inbox, setInbox] = useState<Participancy[]>(initialInbox);
  const [selectedThread, setSelectedThread] = useState<Participancy | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [justLoaded, setJustLoaded] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const convIdFromUrl = searchParams.get("conversationId");

  // Real-time integration
  useRealtime({
    onMessage: (data) => {
      if (selectedThread && data.conversationId === selectedThread.conversationId && data.senderId !== userId) {
        setMessages(prev => {
          if (prev.find(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
        markThreadNotificationsAsRead(data.conversationId);
        window.dispatchEvent(new CustomEvent('notifications-read'));
      } else if (data.senderId !== userId) {
        toast.info("New message received", {
          description: data.content,
          action: {
            label: "Select",
            onClick: () => {
              const item = inbox.find(i => i.conversation.id === data.conversationId);
              if (item) handleSelectThread(item);
            }
          }
        });
        setInbox(prev => prev.map(p =>
          p.conversation.id === data.conversationId ? { ...p, hasUnread: true } : p
        ));
      }
    },
    onTyping: (data) => {
      if (selectedThread && data.conversationId === selectedThread.conversationId && data.userId !== userId) {
        setTypingUsers(prev => ({ ...prev, [data.userId]: data.userName }));
      }
    },
    onUserStatus: (data) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        if (data.status === 'online') next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
    }
  });

  // Auto-clear typing indicators
  useEffect(() => {
    const timer = setInterval(() => setTypingUsers({}), 7000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectThread = useCallback(async (participancy: any) => {
    if (!participancy?.conversationId) {
      setSelectedThread(null);
      return;
    }
    setLoadingThread(true);
    setSelectedThread(participancy);

    try {
      const res = await getConversationDetails(participancy.conversationId);
      if (res.success && res.data) {
        setMessages(res.data.messages);
        await markThreadNotificationsAsRead(participancy.conversationId);
        window.dispatchEvent(new CustomEvent('notifications-read'));
        setInbox(prev => prev.map(p => p.id === participancy.id ? { ...p, hasUnread: false } : p));
        setJustLoaded(true);
      } else {
        toast.error(res.error || "Failed to load thread.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoadingThread(false);
    }
  }, []);

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && selectedFiles.length === 0) || !selectedThread) return;
    setSending(true);
    setUploading(selectedFiles.length > 0);

    const content = messageInput;
    const filesToUpload = [...selectedFiles];
    setMessageInput("");
    setSelectedFiles([]);

    try {
      const attachmentIds: string[] = [];
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", "OTHER");
        const uploadRes = await fetch("/api/files/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploaded = await uploadRes.json();
        attachmentIds.push(uploaded.id);
      }
      setUploading(false);

      const res = await sendThreadMessage(selectedThread.conversationId, content, attachmentIds);
      if (res.success) {
        setMessages(prev => [...prev, res.data]);
      } else {
        toast.error(res.error || "Failed to send message.");
      }
    } catch (err) {
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const handleSecureDownload = async (fileId: string, fileName: string) => {
    setDownloadingFileId(fileId);
    try {
      const response = await fetch(`/api/files/${fileId}/download`);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      toast.error("Download failed.");
    } finally {
      setDownloadingFileId(null);
    }
  };

  // Auto-scroll
  useEffect(() => {
    if (justLoaded && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "auto" });
      setJustLoaded(false);
    } else if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, justLoaded]);

  const hasSyncedUrl = useRef(false);

  // Sync URL selection — works even if inbox is empty on first load
  useEffect(() => {
    if (!convIdFromUrl || hasSyncedUrl.current) return;

    // Check if we are already on this thread to avoid redundant fetches
    if (selectedThread?.conversationId === convIdFromUrl) {
      hasSyncedUrl.current = true;
      return;
    }

    // Try to find in inbox first
    const thread = inbox.find(p => p.conversationId === convIdFromUrl);
    if (thread) {
      handleSelectThread(thread);
      hasSyncedUrl.current = true;
      return;
    }

    // If inbox is loaded but conversation not found, try direct fetch
    if (convIdFromUrl) {
      setLoadingThread(true);
      hasSyncedUrl.current = true; // Mark as synced before starting async fetch
      getConversationDetails(convIdFromUrl).then(res => {
        if (res.success && res.data) {
          // res.data IS the conversation object (includes messages)
          const conversation = res.data;
          const syntheticThread: any = {
            id: convIdFromUrl,
            conversationId: convIdFromUrl,
            hasUnread: false,
            conversation: conversation,
          };
          setSelectedThread(syntheticThread);
          setMessages((conversation as any).messages || []);
          markThreadNotificationsAsRead(convIdFromUrl);
          window.dispatchEvent(new CustomEvent('notifications-read'));
          setJustLoaded(true);
        } else {
          toast.error("Conversation not found or you don't have access.");
          hasSyncedUrl.current = false;
        }
      }).catch(() => {
        toast.error("Failed to load conversation.");
        hasSyncedUrl.current = false;
      })
      .finally(() => setLoadingThread(false));
    }
  }, [convIdFromUrl, inbox, selectedThread, handleSelectThread]);

  return {
    userId,
    inbox,
    setInbox,
    selectedThread,
    setSelectedThread: handleSelectThread,
    messages,
    loadingThread,
    messageInput,
    setMessageInput,
    sending,
    typingUsers,
    onlineUsers,
    downloadingFileId,
    scrollRef,
    fileInputRef,
    selectedFiles,
    setSelectedFiles,
    uploading,
    handleSendMessage,
    handleSecureDownload,
  };
}
