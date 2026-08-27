"use client";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import Settings from "../components/settings";
import Messages from "../components/messages";
import News from "../components/news";

type DashboardProps = {
	user: any;
};

const componentMap: { [key: string]: (props: DashboardProps) => JSX.Element } =
  {
    settings: Settings,
    messages: Messages,
    news: News,
  };

export default function Dashboard() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user ?? null;

  const view = useMemo(() => {
    const pathKey = pathname.split("/")[2];
    const Component = componentMap[pathKey] || Settings;
    return <Component user={user} />;
  }, [pathname, user]);

  return view;
}
