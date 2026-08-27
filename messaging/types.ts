export interface FileMetadata {
  id: string;
  originalName: string;
  size: number;
  mimeType: string;
  storagePath: string | null;
}

export interface Attachment {
  file: FileMetadata;
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string | null;
  messageType: "TEXT" | "SYSTEM_ALERT" | "DOCUMENT_REQUEST";
  createdAt: string | Date;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  title: string;
  status: "PENDING" | "RESOLVED" | "OPEN";
  type: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  applicationId?: string;
  ecoApplicationId?: string;
  application?: any;
  ecoApplication?: any;
  messages: ChatMessage[];
  participants: Array<{ userId: string }>;
}

export interface Participancy {
  id: string;
  userId: string;
  conversationId: string;
  conversation: Conversation;
  hasUnread: boolean;
  lastReadAt: string | Date;
  updatedAt: string | Date;
}
