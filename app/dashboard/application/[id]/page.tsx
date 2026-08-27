import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import db from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { ApplicationDetailsClient } from "../components/ApplicationDetailsClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ApplicationDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const { id } = await params;

  const role = session.user.role?.toUpperCase();
  const isAdmin =
    role === "ADMIN" || role === "SUPER_ADMIN" || role === "REVIEWER";

  const application = await db.application.findFirst({
    where: isAdmin
      ? { id }
      : {
          id,
          userId: session.user.id,
        },
    select: { id: true }
  });

  if (!application) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl py-10 px-4 sm:px-6 lg:px-8">
      <ApplicationDetailsClient id={id} />
    </div>
  );
}
