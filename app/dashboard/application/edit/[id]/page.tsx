import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { ApplicationForm } from "../../components/ApplicationForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditApplicationPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const { id } = await params;

  const application = await db.application.findFirst({
    where: {
      id,
      userId: session.user.id,
      status: {
        in: ["DRAFT", "ROLLED_BACK"],
      },
    },
    include: {
      founders: true,
      businessLicenseFile: true,
      articlesOfIncorpFile: true,
      pitchDeckFile: true,
      financialsFile: true,
    },
  });

  if (!application) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <ApplicationForm initialData={application} isEdit={true} />
    </div>
  );
}
