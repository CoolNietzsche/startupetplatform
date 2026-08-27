"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  Send,
  MoreVertical,
  Paperclip,
  CheckCheck,
  AlertCircle,
  FileText,
  Building2,
  ExternalLink,
  Info,
  Clock,
  Briefcase,
  RefreshCw,
  Mail,
  Inbox,
  Download,
  ArrowLeft,
  LucideIcon,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useCommunicationCenter } from "./use-communication-center";
import { closeConversation } from "@/lib/actions/communication";
import { toast } from "sonner";

function FormattedDate({ date }: { date: Date | string }) {
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="opacity-0">Loading...</span>;
  return <>{formatDistanceToNow(new Date(date))} ago</>;
}

interface CommunicationCenterProps {
  initialInbox: any[];
  title: string;
  headerIcon: LucideIcon;
  role: 'ADMIN' | 'APPLICANT' | 'COMMITTEE';
  renderHeaderActions?: (selectedThread: any) => React.ReactNode;
}

export function CommunicationCenter({
  initialInbox,
  title,
  headerIcon: HeaderIcon,
  role,
  renderHeaderActions
}: CommunicationCenterProps) {
  const chat = useCommunicationCenter(initialInbox);
  const activeApp = chat.selectedThread?.conversation?.application || chat.selectedThread?.conversation?.ecoApplication;

  const getContextLabel = () => {
    if (role === 'ADMIN') return 'Protocol Context';
    if (role === 'COMMITTEE') return 'Strategic Context';
    return 'Application Context';
  };

  const getDefaultTitle = () => {
    if (role === 'ADMIN') return 'Standard Protocol';
    if (role === 'COMMITTEE') return 'Strategic Review';
    return 'Clarification Request';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] w-full max-w-[1600px] mx-auto px-2 sm:px-4 pt-2 pb-4">
      {/* Page Header */}
      <div className="hidden sm:flex items-center justify-between mb-5 px-2 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-deep-dark flex items-center gap-3">
            <div className="p-2 bg-brand-deep-dark rounded-xl shadow-lg shadow-brand-deep-dark/10 shrink-0">
              <HeaderIcon className="h-6 w-6 text-white" />
            </div>
            {title}
          </h1>
        </div>
        {renderHeaderActions && renderHeaderActions(chat.selectedThread)}
      </div>

      <div className="flex flex-1 rounded-3xl overflow-hidden bg-white shadow-[0_20px_50px_rgba(8,112,184,0.1)] border border-brand-deep-dark/[0.06]">

        {/* LEFT PANE - THREAD LIST */}
        <div className={`w-full md:w-[320px] lg:w-[380px] border-r border-brand-deep-dark/[0.06] flex-col bg-brand-deep-dark/[0.02] z-10 shrink-0 ${chat.selectedThread ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-5 border-b border-brand-deep-dark/[0.06] bg-white">
            <div className="relative group">
              <div className="absolute inset-0 bg-brand-mint-teal/5 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-deep-dark/40" />
              <Input
                placeholder="Search protocol history..."
                className="pl-10 h-11 bg-brand-deep-dark/[0.02] border-brand-deep-dark/10 focus-visible:bg-white focus-visible:ring-brand-mint-teal/20 focus-visible:border-brand-mint-teal rounded-xl transition-all font-medium"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="divide-y divide-brand-deep-dark/[0.06]">
              {chat.inbox.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 bg-brand-deep-dark/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-deep-dark/[0.06]">
                    <Inbox className="w-8 h-8 text-brand-deep-dark/20" />
                  </div>
                  <p className="text-xs font-bold text-brand-deep-dark/40 uppercase tracking-widest">No active traffic</p>
                </div>
              ) : (
                chat.inbox.map((participancy: any) => {
                  const isSelected = chat.selectedThread?.id === participancy.id;
                  const conv = participancy.conversation;
                  const lastMsg = conv.messages?.[0]?.content || "No records yet";
                  const otherUserId = conv.participants?.find((p: any) => p.userId !== chat.userId)?.userId;
                  const isOnline = otherUserId && chat.onlineUsers.has(otherUserId);

                  return (
                    <div
                      key={participancy.id}
                      onClick={() => chat.setSelectedThread(participancy)}
                      className={`p-4 cursor-pointer transition-all relative group ${isSelected
                          ? 'bg-brand-mint-teal shadow-xl shadow-brand-mint-teal/20 scale-[1.01] z-10 mx-2 rounded-2xl my-1 text-white border-none'
                          : 'hover:bg-brand-deep-dark/[0.04] border-b border-brand-deep-dark/[0.03]'
                        }`}
                    >
                      {participancy.hasUnread && !isSelected && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-brand-mint-teal" />
                      )}

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-[11px] shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-brand-mint-teal/10 text-brand-mint-teal border border-brand-mint-teal/10'
                            }`}>
                            {(conv.title || "C").substring(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className={`text-[13.5px] font-black truncate block uppercase tracking-wide leading-tight ${isSelected ? 'text-white' : 'text-brand-deep-dark'
                              }`}>
                              {conv.title || getDefaultTitle()}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold shrink-0 ${isSelected ? 'text-white/80' : 'text-brand-deep-dark/40'}`}>
                          <FormattedDate date={conv.updatedAt} />
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="relative">
                          {isOnline ? (
                            <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                              <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                              <span className="text-[8px] font-black text-green-600 uppercase">Live</span>
                            </div>
                          ) : (
                            <div className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white/40' : 'bg-brand-deep-dark/30'}`} />
                          )}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-white/70' : 'text-brand-deep-dark/40'}`}>
                          {conv.type || (conv.ecoApplicationId ? 'Ecosystem' : 'Standard')}
                        </span>
                        {isSelected && <div className="h-1 w-1 rounded-full bg-white/30" />}
                        {isSelected && (
                          <span className="text-[9px] font-bold text-white/50 truncate">
                            ID: {participancy.conversationId.substring(0, 8)}
                          </span>
                        )}
                      </div>

                      <p className={`text-[12px] line-clamp-1 leading-relaxed font-medium ${isSelected ? 'text-white/90 font-bold' : 'text-brand-deep-dark/50'}`}>
                        {lastMsg}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* MIDDLE PANE - CHAT */}
        <div className={`flex-1 flex flex-col bg-brand-deep-dark/[0.02] relative overflow-hidden ${!chat.selectedThread ? 'hidden md:flex' : 'flex'}`}>
          {!chat.selectedThread ? (
            <div className="flex-1 flex flex-col items-center justify-center text-brand-deep-dark/30 p-8 text-center max-w-sm mx-auto">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 text-brand-deep-dark/[0.06] border border-brand-deep-dark/[0.03]">
                <Mail className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-black text-brand-deep-dark tracking-tight">Select a conversation</h3>
              <p className="text-sm mt-3 text-brand-deep-dark/50 font-medium leading-relaxed italic">Click on a thread to start transmitting communications secure.</p>
            </div>
          ) : (() => {
            const thread = chat.selectedThread;
            return (
              <>
                {/* Chat Header */}
                <div className="h-18 px-4 sm:px-8 border-b border-brand-deep-dark/[0.06] flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm shadow-brand-deep-dark/[0.06] shrink-0 gap-3">
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden shrink-0 h-9 w-9 text-brand-deep-dark/50 hover:text-brand-deep-dark hover:bg-brand-deep-dark/[0.06] rounded-xl"
                      onClick={() => chat.setSelectedThread(null)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="w-10 h-10 bg-brand-mint-teal/10 text-brand-mint-teal rounded-xl hidden sm:flex items-center justify-center border border-brand-mint-teal/10 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-black text-brand-deep-dark text-sm sm:text-[15px] flex items-center gap-2 uppercase tracking-wide truncate">
                        {thread.conversation.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-brand-startup-amber animate-pulse" />
                        <p className="text-[11px] text-brand-deep-dark/50 font-bold uppercase tracking-widest leading-none">
                          Thread ID: <span className="text-brand-deep-dark/80">{thread.conversationId.substring(0, 8)}...</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end mr-2">
                      <span className="text-[9px] font-black text-brand-deep-dark/40 uppercase tracking-tighter mb-0.5">Status</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-black h-6 uppercase px-2.5 ${thread.conversation.status === 'CLOSED'
                            ? 'border-rose-200 bg-rose-50 text-rose-600 shadow-sm'
                            : 'border-brand-mint-teal/20 bg-brand-mint-teal/5 text-brand-mint-teal'
                          }`}
                      >
                        {thread.conversation.status}
                      </Badge>
                    </div>
                    {(role === 'ADMIN' || role === 'COMMITTEE') && thread.conversation.status !== 'CLOSED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-600 hover:text-white hover:bg-rose-600 border-rose-200 h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2"
                        onClick={async () => {
                          if (confirm("Are you sure you want to close this priority frequency?")) {
                            const res = await closeConversation(thread.conversationId);
                            if (res.success) {
                              toast.success("Protocol terminal terminated.");
                              window.location.reload();
                            } else {
                              toast.error(res.error || "De-init failure.");
                            }
                          }
                        }}
                      >
                        <XCircle className="w-4 h-4" /> Close Thread
                      </Button>
                    )}
                    <Separator orientation="vertical" className="h-8 mx-2 hidden sm:block" />
                    <Button variant="ghost" size="icon" className="text-brand-deep-dark/40 h-9 w-9 hover:bg-brand-deep-dark/[0.06] rounded-xl">
                      <MoreVertical className="w-4.5 h-4.5" />
                    </Button>
                  </div>
                </div>

                {/* Message History */}
                <ScrollArea className="flex-1 px-3 lg:px-4 py-2">
                  {chat.loadingThread ? (
                    <div className="flex flex-col items-center justify-center mt-20 text-brand-deep-dark/30">
                      <RefreshCw className="h-10 w-10 animate-spin mb-4 opacity-50" />
                      <div className="text-xs font-black uppercase tracking-[0.2em]">Syncing...</div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-w-4xl mx-auto pb-2">
                      {/* Protocol Context Panel */}
                      {activeApp && (
                        <div className="bg-white border border-brand-deep-dark/10 shadow-sm rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-mint-teal/[0.04] rounded-full blur-2xl -mx-8 -my-8" />
                          <div className="flex items-center gap-5 relative z-10 w-full sm:w-auto">
                            <div className="w-16 h-16 bg-gradient-to-br from-brand-deep-dark to-brand-mint-teal text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg border-2 border-white shrink-0">
                              {(activeApp.startupName || activeApp.name || "A").substring(0, 1).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="w-4 h-4 text-brand-mint-teal" />
                                <span className="text-[10px] font-black tracking-[0.2em] text-brand-mint-teal uppercase">{getContextLabel()}</span>
                              </div>
                              <h2 className="text-lg font-black text-brand-deep-dark tracking-tight truncate">
                                {activeApp.startupName || activeApp.name}
                              </h2>
                              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                <Badge variant="outline" className="text-[9px] bg-brand-deep-dark text-white border-none px-3 font-black rounded-full uppercase">
                                  {activeApp.status}
                                </Badge>
                                <span className="text-[10px] font-bold text-brand-deep-dark/40 uppercase tracking-widest flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" /> {new Date(thread.conversation.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {role === 'ADMIN' && (
                            <div className="relative z-10 w-full sm:w-auto shrink-0 flex gap-2">
                              <Link href={activeApp.applicationId ? `/admins-new/applications/${activeApp.applicationId}` : `/admins-new/ecosystem/review/${activeApp.ecoApplicationId}`}>
                                <Button className="bg-brand-deep-dark hover:bg-brand-mint-teal text-white shadow-xl shadow-brand-deep-dark/10 rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-5 transition-all">
                                  View Node <ExternalLink className="w-3.5 h-3.5 ml-2" />
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}

                      {chat.messages.map((msg: any, idx: number) => {
                        const isSystem = msg.senderId === null || msg.messageType === "SYSTEM_ALERT";
                        const isSelf = msg.senderId === thread.userId || msg.senderId === "me";

                        if (isSystem) {
                          return (
                            <div key={msg.id} className="flex justify-center w-full my-2 px-2">
                              <div className="bg-white/50 border border-brand-deep-dark/10 rounded-[20px] px-8 py-5 w-full shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-brand-deep-dark/10" />
                                <div className="flex items-center gap-3 mb-2">
                                  <Info className="w-4 h-4 text-brand-deep-dark/40" />
                                  <span className="text-[10px] font-black text-brand-deep-dark/40 tracking-widest uppercase">Protocol Audit Log</span>
                                </div>
                                <p className="text-brand-deep-dark/70 text-[14px] leading-relaxed font-medium">{msg.content}</p>
                                <div className="mt-4 pt-3 border-t border-brand-deep-dark/[0.06] flex justify-between items-center text-[10px] text-brand-deep-dark/40 font-bold">
                                  <span>Batch Entry {idx + 1}</span>
                                  <span><FormattedDate date={msg.createdAt} /></span>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'} group w-full mb-1 px-1`}>
                            {!isSelf && (
                              <div className="mr-3 mt-auto mb-1">
                                <Avatar className="h-9 w-9 shadow-lg ring-2 ring-white rounded-xl">
                                  <AvatarFallback className="bg-gradient-to-br from-brand-deep-dark to-brand-mint-teal text-white text-[11px] font-black uppercase rounded-xl">
                                    App
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            )}

                            <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[75%]`}>
                              {msg.content && (
                                <div className={`px-4 py-2.5 shadow-sm text-[13.5px] leading-relaxed relative ${isSelf
                                    ? 'bg-brand-mint-teal text-white font-medium rounded-[20px] rounded-br-[4px]'
                                    : 'bg-white border border-brand-deep-dark/10 text-brand-deep-dark rounded-[20px] rounded-bl-[4px]'
                                  }`}>
                                  {msg.content}
                                </div>
                              )}

                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className={`mt-3 w-full space-y-2.5 flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                                  {msg.attachments.map((att: any, attIdx: number) => {
                                    const openUrl = att.file?.id ? `/api/files/${att.file.id}/download?inline=true` : '#';
                                    return (
                                      <div key={attIdx} className="block w-full max-w-[260px] sm:max-w-sm">
                                        <div className="flex items-center gap-2.5 border border-brand-deep-dark/10 rounded-[16px] p-2 bg-white shadow-sm hover:border-brand-mint-teal/30 transition-all">
                                          <div className="bg-brand-deep-dark/[0.06] p-2 rounded-xl shrink-0">
                                            <FileText className="h-4 w-4 text-brand-deep-dark/40" />
                                          </div>
                                          <div className="flex-1 min-w-0 pr-1">
                                            <div className="text-[13px] font-bold text-brand-deep-dark truncate" title={att.file?.originalName}>{att.file?.originalName || 'Protocol File'}</div>
                                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-brand-deep-dark/40 font-bold uppercase">
                                              <span>{att.file?.mimeType?.split('/')[1] || 'DOC'}</span>
                                              <span className="h-1 w-1 rounded-full bg-brand-deep-dark/10" />
                                              <span>{(att.file?.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1 border-l border-brand-deep-dark/[0.06] pl-2">
                                            <button
                                              onClick={() => att.file?.id && chat.handleSecureDownload(att.file.id, att.file.originalName || "download")}
                                              className="p-2 text-brand-deep-dark/40 hover:text-brand-mint-teal hover:bg-brand-mint-teal/5 rounded-xl"
                                            >
                                              {chat.downloadingFileId === att.file?.id ? (
                                                <RefreshCw className="h-4 w-4 animate-spin text-brand-mint-teal" />
                                              ) : (
                                                <Download className="h-4 w-4" />
                                              )}
                                            </button>
                                            <a href={openUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-brand-deep-dark/40 hover:text-brand-mint-teal hover:bg-brand-mint-teal/5 rounded-xl">
                                              <ExternalLink className="h-4 w-4" />
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              <div className={`flex items-center mt-1 text-[10px] font-bold text-brand-deep-dark/40 uppercase tracking-tighter ${isSelf ? 'mr-2 text-end' : 'ml-2'}`}>
                                <FormattedDate date={msg.createdAt} />
                                {isSelf && (
                                  <div className="flex items-center ml-2 text-brand-mint-teal">
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    <span className="ml-1 tracking-widest text-[8px]">Delivered</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chat.scrollRef} className="h-2" />
                    </div>
                  )}
                </ScrollArea>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-brand-deep-dark/[0.06]">
                  {chat.selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {chat.selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-brand-deep-dark/[0.04] border border-brand-deep-dark/10 pr-1 pl-3 py-1 rounded-xl group hover:border-red-200 hover:bg-red-50 transition-all">
                          <FileText className="h-4 w-4 text-brand-deep-dark/40 group-hover:text-red-500" />
                          <span className="text-[11px] font-bold text-brand-deep-dark/70 truncate max-w-[120px]">{file.name}</span>
                          <Button variant="ghost" size="icon" onClick={() => chat.setSelectedFiles(prev => prev.filter((_, i) => i !== idx))} className="h-7 w-7 rounded-lg group-hover:text-red-500">
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="relative group">
                    <div className="absolute inset-0 bg-brand-mint-teal/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-all" />
                    <div className="relative bg-white rounded-2xl border-2 border-brand-deep-dark/10 shadow-sm group-focus-within:border-brand-mint-teal/50 group-focus-within:shadow-lg transition-all">
                      <Textarea
                        placeholder={
                          thread.conversation.status === 'CLOSED' ? "Communication channel closed." :
                            (role === 'APPLICANT' && chat.messages.length === 0) ? "Awaiting administrative initiation..." :
                              "Type a priority clarification or inquiry..."
                        }
                        value={chat.messageInput}
                        onChange={(e) => chat.setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && (role !== 'APPLICANT' || chat.messages.length > 0) && thread.conversation.status !== 'CLOSED') {
                            e.preventDefault();
                            chat.handleSendMessage();
                          }
                        }}
                        disabled={thread.conversation.status === 'CLOSED' || (role === 'APPLICANT' && chat.messages.length === 0)}
                        className="min-h-[50px] w-full border-none focus-visible:ring-0 p-3 pb-12 bg-transparent text-brand-deep-dark placeholder:text-brand-deep-dark/40 text-[14px] font-medium resize-none shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                      />

                      <div className="absolute right-1 bottom-1 flex items-center justify-end gap-1.5 bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-xl">
                        <div className="flex gap-1 border-r border-brand-deep-dark/[0.06] pr-1.5">
                          <input
                            type="file"
                            ref={chat.fileInputRef}
                            className="hidden"
                            multiple
                            onChange={(e) => e.target.files && chat.setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)])}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => chat.fileInputRef.current?.click()}
                            className="h-8 w-8 text-brand-deep-dark/50 hover:text-brand-mint-teal hover:bg-brand-mint-teal/5 rounded-lg transition-all"
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          onClick={chat.handleSendMessage}
                          disabled={chat.sending || (!chat.messageInput.trim() && chat.selectedFiles.length === 0) || thread.conversation.status === 'CLOSED' || (role === 'APPLICANT' && chat.messages.length === 0)}
                          className={`font-black uppercase tracking-[0.2em] text-[10px] h-8 px-4 rounded-lg transition-all ${chat.sending ? 'bg-brand-deep-dark/[0.06] text-brand-deep-dark/40' : 'bg-brand-mint-teal text-white hover:bg-brand-deep-dark'
                            }`}
                        >
                          <div className={`flex items-center gap-3 ${chat.sending ? 'opacity-0' : 'opacity-100'}`}>
                            <span>Transmit</span>
                            <Send className="h-3.5 w-3.5" />
                          </div>
                          {chat.sending && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <RefreshCw className="h-4 w-4 animate-spin text-brand-deep-dark/40" />
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-1.5 flex items-center justify-center gap-4 text-[9px] font-bold text-brand-deep-dark/40 uppercase tracking-[0.1em]">
                      <div className="flex items-center gap-1 group-focus-within:text-brand-deep-dark/50 transition-colors">
                        <kbd className="px-1.5 py-0.5 rounded-md bg-brand-deep-dark/[0.04] border border-brand-deep-dark/[0.06]">Enter</kbd>
                        <span>to Send</span>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-deep-dark/[0.06]" />
                      <div className="flex items-center gap-1.5 group-focus-within:text-brand-deep-dark/50 transition-colors">
                        <kbd className="px-1.5 py-0.5 rounded-md bg-brand-deep-dark/[0.04] border border-brand-deep-dark/[0.06]">Shift + Enter</kbd>
                        <span>New Line</span>
                      </div>
                      {chat.uploading && (
                        <div className="flex items-center gap-2 text-brand-mint-teal">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>Uploading...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
