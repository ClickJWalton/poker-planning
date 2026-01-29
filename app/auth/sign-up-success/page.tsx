import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Layers } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-xl bg-accent/10">
              <Mail className="h-8 w-8 text-accent" />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold">Check your email</CardTitle>
          <CardDescription className="text-base">
            {"We've sent you a confirmation link. Please check your inbox and click the link to activate your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/auth/login">
              <Layers className="h-4 w-4 mr-2" />
              Back to login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
