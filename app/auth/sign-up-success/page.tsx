import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail, Sparkles } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Success icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 border border-primary/30 yokk-glow">
            <Mail className="h-8 w-8 text-primary" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
            <p className="text-muted-foreground mt-2">
              We&apos;ve sent you a confirmation link. Click it to activate your YOKK account and start building.
            </p>
          </div>

          <div className="glass-card rounded-xl p-4 w-full">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">
                Once confirmed, Bo AI will help you set up your profile and connect with the community.
              </p>
            </div>
          </div>

          <Link href="/auth/login" className="w-full">
            <Button variant="outline" className="w-full h-11 border-border/50 bg-transparent">
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
