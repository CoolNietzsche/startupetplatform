"use client";

import { useEffect, useState } from "react";
import { getUnreadMessageCount } from "@/lib/actions/communication";
import { Badge } from "@/components/ui/badge";
import { useRealtime } from "@/hooks/use-realtime";

export function UnreadMessageBadge() {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    const res = await getUnreadMessageCount();
    if (res.success) setCount(res.count);
  };

  useEffect(() => {
    fetchCount();
  }, []);

  useRealtime({
    onMessage: (data) => {
      // Small delay to allow DB to update if needed, or just increment
      setTimeout(fetchCount, 500);
    }
  });

  if (count === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-[10px] font-black rounded-full shadow-lg shadow-red-200 animate-in zoom-in duration-300"
    >
      {count > 9 ? "9+" : count}
    </Badge>
  );
}
