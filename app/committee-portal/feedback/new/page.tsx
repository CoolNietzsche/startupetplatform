import { redirect } from "next/navigation";

export default function NewFeedbackRedirect() {
  redirect("/committee-portal/messages");
}
