import { useState, useEffect } from "react";
// import { Newspaper } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function News() {
  const [news, setNews] = useState<{ id: number; title: string; content: string; date: string }[]>([]);

  useEffect(() => {
    // Simulate fetching news from an API
    const initialNews = [
      { id: 1, title: "Breaking News", content: "This is the content of the breaking news.", date: "2023-10-01" },
      { id: 2, title: "Tech Update", content: "Latest updates in the tech world.", date: "2023-10-02" },
      { id: 3, title: "Health Tips", content: "Tips for a healthy lifestyle.", date: "2023-10-03" },
    ];
    setNews(initialNews);
  }, []);

  useEffect(() => {
  }, [news])

  return (
    <div className="flex flex-col items-center justify-center p-8">
    </div>
  );
}