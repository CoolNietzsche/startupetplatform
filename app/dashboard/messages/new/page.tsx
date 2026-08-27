"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Search, Users, Send, X } from "lucide-react";

// Mock data for contact suggestions
const contactSuggestions = [
  {
    id: "s1",
    name: "Ministry of Innovation & Technology",
    type: "government",
    icon: "/avatars/minit.png",
    description: "Official government agency for tech startups"
  },
  {
    id: "s2",
    name: "Ethiopian Investment Commission",
    type: "government",
    icon: "/avatars/eic.png",
    description: "For investment permits and business registration"
  },
  {
    id: "s3",
    name: "Digital Ethiopia Growth Fund",
    type: "investor",
    icon: "/avatars/degf.png",
    description: "Government-backed startup investment fund"
  },
  {
    id: "s4",
    name: "Addis Ababa Tech Mentors",
    type: "mentor",
    icon: "/avatars/ment.png",
    description: "Expert guidance for tech startups"
  },
  {
    id: "s5",
    name: "Startup Ethiopia Association",
    type: "partner",
    icon: "/avatars/startupeth.png",
    description: "National startup advocacy and networking group"
  },
  {
    id: "s6",
    name: "ICT-ET Incubation Hub",
    type: "program",
    icon: "/avatars/ict.png",
    description: "Addis Ababa's premier startup incubator"
  },
  {
    id: "s7",
    name: "AgriTech Challenge Team",
    type: "program",
    icon: "/avatars/agri.png",
    description: "Program administrators for the agricultural innovation challenge"
  },
  {
    id: "s8",
    name: "Ethio Telecom Ventures",
    type: "investor",
    icon: "/avatars/ethio.png",
    description: "Investment arm of Ethiopia's largest telecom provider"
  },
];

// Predefined message templates
const messageTemplates = [
  {
    id: "t1",
    title: "Funding Inquiry",
    body: "Hello,\n\nI am writing to inquire about potential funding opportunities for my startup. We are [briefly describe your startup] and are looking for investment to help us [describe growth plans].\n\nCould you please provide information about your current funding programs, eligibility criteria, and application process?\n\nThank you,\n[Your Name]"
  },
  {
    id: "t2",
    title: "Mentor Request",
    body: "Hello,\n\nI am seeking mentorship for my startup in the [industry] sector. We are currently facing challenges with [describe challenge] and would greatly benefit from your expertise.\n\nWould you be available for a brief discussion about potential mentorship opportunities?\n\nThank you,\n[Your Name]"
  },
  {
    id: "t3",
    title: "Program Application Status",
    body: "Hello,\n\nI recently applied to the [program name] on [date] and wanted to inquire about the status of my application. My application reference number is [reference number if available].\n\nCould you please provide an update on my application status and the expected timeline for the next steps?\n\nThank you,\n[Your Name]"
  },
  {
    id: "t4",
    title: "Regulatory Guidance",
    body: "Hello,\n\nI am seeking guidance regarding the regulatory requirements for [specific business activity] in Ethiopia. Specifically, I would like to understand the licensing requirements, compliance regulations, and any recent policy changes that might affect my startup.\n\nAny information or direction to the appropriate resources would be greatly appreciated.\n\nThank you,\n[Your Name]"
  },
  {
    id: "t5",
    title: "Partnership Proposal",
    body: "Hello,\n\nI am reaching out to explore potential partnership opportunities between our organizations. My startup [startup name] specializes in [describe focus area], and I believe there could be valuable synergies with your work in [their focus area].\n\nI would appreciate the opportunity to discuss how we might collaborate to [potential benefit of partnership].\n\nThank you,\n[Your Name]"
  },
];

export default function NewMessagePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [subject, setSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Filter contacts based on search term
  const filteredContacts = contactSuggestions.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedContacts.some(selected => selected.id === contact.id)
  );
  
  const handleSelectContact = (contact) => {
    setSelectedContacts([...selectedContacts, contact]);
    setSearchTerm("");
  };
  
  const handleRemoveContact = (contactId) => {
    setSelectedContacts(selectedContacts.filter(c => c.id !== contactId));
  };
  
  const handleSelectTemplate = (template) => {
    setMessageBody(template.body);
    setSubject(template.title);
    setShowTemplates(false);
  };
  
  const handleSendMessage = () => {
    // In a real application, this would send the message to the backend
    // For now, we'll just redirect back to the messages page with a success parameter
    router.push("/dashboard/messages?success=true");
  };
  
  const isFormValid = selectedContacts.length > 0 && subject.trim() !== "" && messageBody.trim() !== "";
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => router.push("/dashboard/messages")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Messages
        </Button>
        <h1 className="text-2xl font-bold">New Message</h1>
      </div>
      
      <div className="border rounded-md overflow-hidden bg-white mb-6">
        <div className="p-4 border-b">
          <h2 className="font-medium mb-4">Recipients</h2>
          
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {selectedContacts.map(contact => (
              <div key={contact.id} className="bg-blue-50 border border-blue-100 rounded-full py-1 px-3 flex items-center text-sm">
                <span className="mr-1">{contact.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 rounded-full"
                  onClick={() => handleRemoveContact(contact.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                className="pl-9 border-0 focus-visible:ring-0 focus-visible:ring-transparent"
                placeholder={selectedContacts.length > 0 ? "Add more recipients..." : "Search for contacts, departments, or programs..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {searchTerm && filteredContacts.length > 0 && (
            <div className="mt-2 border rounded-md max-h-60 overflow-y-auto">
              {filteredContacts.map(contact => (
                <div 
                  key={contact.id}
                  className="p-3 border-b hover:bg-gray-50 cursor-pointer flex items-center"
                  onClick={() => handleSelectContact(contact)}
                >
                  <div className="h-10 w-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    <div className="w-full h-full flex items-center justify-center text-gray-600 font-semibold">
                      {contact.name.charAt(0)}
                    </div>
                  </div>
                  
                  <div className="ml-3">
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-gray-500">{contact.description}</div>
                  </div>
                  
                  <Badge variant="outline" className="ml-auto text-xs capitalize">
                    {contact.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
          
          {searchTerm && filteredContacts.length === 0 && (
            <div className="mt-2 text-sm text-gray-500">
              No matching contacts found. Try a different search term.
            </div>
          )}
        </div>
        
        <div className="p-4 border-b">
          <Input
            className="border-0 text-lg font-medium focus-visible:ring-0 focus-visible:ring-transparent px-0"
            placeholder="Add a subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        
        <div className="p-4">
          <Textarea
            className="min-h-[200px] border-0 focus-visible:ring-0 focus-visible:ring-transparent resize-none px-0"
            placeholder="Type your message here..."
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
          />
        </div>
        
        <div className="bg-gray-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-sm"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              Use Template
            </Button>
            <Button variant="outline" size="sm" className="text-sm">Attach Files</Button>
          </div>
          
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!isFormValid}
            onClick={handleSendMessage}
          >
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </Button>
        </div>
      </div>
      
      {/* Template selector */}
      {showTemplates && (
        <div className="border rounded-md overflow-hidden bg-white mb-6">
          <div className="p-3 border-b bg-gray-50">
            <h3 className="font-medium">Select a Message Template</h3>
          </div>
          
          <div className="p-0">
            {messageTemplates.map(template => (
              <div 
                key={template.id} 
                className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="font-medium mb-1">{template.title}</div>
                <div className="text-sm text-gray-500 truncate">{template.body.split('\n')[0]}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-amber-50 border border-amber-100 rounded-md p-4 text-sm text-amber-800">
        <p className="font-medium mb-1">Important Information About Official Communications</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Messages to government agencies may take 2-3 business days for response</li>
          <li>Include your business registration number when contacting regulatory bodies</li>
          <li>For urgent matters, consider using the listed phone contacts in addition to messaging</li>
          <li>All official communications are securely archived for your records</li>
        </ul>
      </div>
    </div>
  );
}
