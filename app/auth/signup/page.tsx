import { redirect } from "next/navigation"

export default function SignupAliasRedirect() {
  redirect("/auth/sign-up")
}
