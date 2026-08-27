import { redirect } from "next/navigation";

export default function FeedbackIdRedirect() {
  redirect("/committee-portal/messages");
}
