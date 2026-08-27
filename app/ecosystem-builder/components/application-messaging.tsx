"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Send, 
  RefreshCw, 
  Clock, 
  User, 
  ChevronRight,
  Mail,
  ArrowLeft,
  FileText
} from "lucide-react";
import { 
  getEcoApplicationConversations, 
  getConversationDetails, 
  sendThreadMessage,
  markThreadNotificationsAsRead
} from "@/lib/actions/communication";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useRealtime } from "@/hooks/use-realtime";

function FormattedDate({ date }: { date: Date | string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="opacity-0">Loading...</span>;
  return <>{formatDistanceToNow(new Date(date))} ago</>;
}

export function ApplicationMessaging({ appId }: { appId: string }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [appId]);

  const loadConversations = async () => {
    setLoading(true);
    const res = await getEcoApplicationConversations(appId);
    if (res.success) {
      setConversations(res.data);
      // Auto-select the first one if only one exists
      if (res.data.length === 1) {
        loadThread(res.data[0].id);
      }
    }
    setLoading(false);
  };

  const loadThread = async (id: string) => {
    setSelectedConvId(id);
    setLoadingThread(true);
    const res = await getConversationDetails(id);
    if (res.success && res.data) {
      setMessages(res.data.messages);
      // Mark notifications as read for this thread
      markThreadNotificationsAsRead(id);
      
      // Update local unread state
    } else {
      toast.error("Failed to load message history.");
    }
    setLoadingThread(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConvId) return;
    
    setSending(true);
    try {
        const content = messageInput;
        setMessageInput("");

        // Optimistic Update
        const optimistic = {
          id: "opt-" + Date.now(),
          senderId: "me",
          content,
          createdAt: new Date(),
          messageType: "TEXT",
          attachments: []
        };
        setMessages(prev => [...prev, optimistic]);

        const res = await sendThreadMessage(selectedConvId, content);
        if (!res.success) {
          toast.error("Failed to send message.");
          setMessages(prev => prev.filter(m => m.id !== optimistic.id));
          setMessageInput(content);
        } else {
          setMessages(prev => {
            // Safe replacement
            if (prev.some(m => m.id === res.data.id)) return prev.filter(m => m.id !== optimistic.id);
            return prev.map(m => m.id === optimistic.id ? res.data : m);
          });
        }
    } catch (err) {
        toast.error("An unexpected error occurred.");
    } finally {
        setSending(false);
    }
  };

  // Real-time integration
  useRealtime({
    onMessage: (data) => {
      // If it's for the currently open thread and not from ME (optimistic handled it)
      if (data.conversationId === selectedConvId && data.senderId !== "me") {
        // Double check it's not already there (though serial IDs help)
        setMessages(prev => {
          if (prev.find(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
      } else if (data.senderId !== "me") {
        // Update unread badge or just toast
        toast.info("New message received", {
           description: data.content.substring(0, 50) + "...",
           action: {
             label: "View",
             onClick: () => loadThread(data.conversationId)
           }
        });
        // Reload conversations to show snippet/badge
        loadConversations();
      }
    }
  });

  if (loading) {
    return (
      <Card className="border-none shadow-lg animate-pulse">
        <div className="h-48 bg-slate-100 rounded-xl" />
      </Card>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-slate-50/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <Mail className="h-8 w-8 text-slate-400" />
          </div>
          <CardTitle className="text-slate-900 mb-2 font-bold uppercase tracking-tight text-sm">No Active Communications</CardTitle>
          <CardDescription className="max-w-xs text-xs font-medium">
            Once an admin starts a conversation or requests clarification, it will appear here.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  // Multi-thread view
  if (!selectedConvId && conversations.length > 1) {
    return (
      <Card className="border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-slate-900 border-b pb-4">
          <CardTitle className="text-white text-md flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            Active Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {conversations.map(conv => (
              <div 
                key={conv.id} 
                onClick={() => loadThread(conv.id)}
                className="p-5 hover:bg-slate-50 cursor-pointer flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${conv.type === 'CLARIFICATION' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                    {conv.type === 'CLARIFICATION' ? <RefreshCw className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{conv.title || "Message Thread"}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {conv.messages?.[0]?.content || "No messages yet"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  return (
    <Card className="border-none shadow-2xl overflow-hidden flex flex-col h-[600px]">
      <CardHeader className="bg-slate-900 border-b py-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          {conversations.length > 1 && (
            <Button 
               variant="ghost" 
               size="icon" 
               className="h-8 w-8 text-white hover:bg-white/10"
               onClick={() => setSelectedConvId(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <CardTitle className="text-white text-sm font-bold flex items-center gap-2">
              {selectedConv?.type === 'CLARIFICATION' ? <RefreshCw className="h-4 w-4 text-orange-400" /> : <MessageSquare className="h-4 w-4 text-blue-400" />}
              {selectedConv?.title || "Conversation"}
            </CardTitle>
            <CardDescription className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-0.5">
              Direct Support • {selectedConv?.type}
            </CardDescription>
          </div>
        </div>
        <Badge variant="outline" className="border-blue-900 text-blue-400 uppercase text-[9px] font-bold">Secure Connection</Badge>
      </CardHeader>
      
      <ScrollArea className="flex-1 bg-slate-50/30 p-4">
        {loadingThread ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-3">
             <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => {
              const isSelf = msg.senderId === "me" || msg.senderId === selectedConv?.participants?.[0]?.userId; // This check is approximate but senderId='me' for optimistic
              // Actually better check: if senderId exists in participants it's the admin, but we need to know who the CURRENT user is.
              // For simplicity, let's just use the 'me' flag and the lack of a sender object as 'self' for now or handle it via a better session.
              
              const isSystem = msg.messageType === "SYSTEM_ALERT" || msg.senderId === null;
              
              if (isSystem) {
                return (
                  <div key={msg.id} className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-center text-[11px] text-blue-700 font-medium">
                    {msg.content}
                  </div>
                );
              }

              // Since we don't have the current userId here easily without a hook, we usually rely on 'isSystem' and known admin roles
              // In this portal, the user is the APPLICANT.
              const isApplicant = msg.sender?.role !== "SUPER_ADMIN" && msg.sender?.role !== "ADMIN";

              return (
                <div key={msg.id} className={`flex ${isApplicant ? 'justify-end' : 'justify-start'} group w-full`}>
                   {!isApplicant && (
                      <Avatar className="h-7 w-7 mr-2 mt-auto mb-1 border border-slate-200 shadow-sm">
                        <AvatarFallback className="bg-slate-900 text-white text-[9px] font-black uppercase">ADM</AvatarFallback>
                      </Avatar>
                   )}
                   <div className={`flex flex-col ${isApplicant ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${
                        isApplicant 
                          ? 'bg-blue-600 text-white rounded-br-sm' 
                          : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                      
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className={`mt-2 w-full space-y-2 flex flex-col ${isApplicant ? 'items-end' : 'items-start'}`}>
                          {msg.attachments.map((att: any, index: number) => (
                            <a key={index} href={att.file?.storagePath || '#'} target="_blank" rel="noopener noreferrer">
                              <div className="flex items-center gap-3 border border-slate-200 rounded-xl p-2 bg-white max-w-[240px] hover:border-blue-300 transition-all shadow-sm cursor-pointer group/file">
                                <div className="bg-red-50 p-1.5 rounded-lg">
                                  <FileText className="h-4 w-4 text-red-500" />
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                  <div className="text-[11px] font-bold text-slate-900 truncate">{att.file?.originalName || 'Attachment'}</div>
                                  <div className="text-[8px] text-slate-400 font-black uppercase mt-0.5 tracking-widest">
                                    {(att.file?.size / 1024 / 1024).toFixed(2)} MB
                                  </div>
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                      <span className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter px-1">
                        <FormattedDate date={msg.createdAt} />
                      </span>
                   </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      <div className="p-4 bg-slate-50/50 border-t border-slate-100 backdrop-blur-sm sticky bottom-0 z-10">
        <div className="relative group transition-all duration-300">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-0 group-focus-within:opacity-10 transition duration-500"></div>
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm group-focus-within:border-blue-400 group-focus-within:shadow-md transition-all">
            <Textarea 
              placeholder="Type your message here..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                  }
              }}
              className="min-h-[100px] w-full border-none focus-visible:ring-0 p-4 pb-12 bg-transparent text-slate-700 placeholder:text-slate-400 resize-none rounded-2xl"
            />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between p-1 bg-white/80 backdrop-blur-sm rounded-xl">
               <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg">
                     <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg">
                     <Mail className="h-4 w-4" />
                  </Button>
               </div>
               <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sending}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all h-9 px-4 rounded-xl flex gap-2 font-semibold"
               >
                  {sending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="h-4 w-4" />
                    </>
                  )}
               </Button>
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
           <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200">Enter</kbd> to send</span>
           <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200">Shift + Enter</kbd> for new line</span>
        </div>
      </div>
    </Card>
  );
}
