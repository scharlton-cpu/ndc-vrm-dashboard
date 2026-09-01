import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DEMO_ACCOUNTS = [
  { role: "Administrator", email: "admin@ndcvrm.gd" },
  { role: "Campaign Manager", email: "campaign.manager@ndcvrm.gd" },
  { role: "Data Lead", email: "data.lead@ndcvrm.gd" },
  { role: "Field Coordinator (St. George)", email: "field.coordinator@ndcvrm.gd" },
  { role: "Organiser (Town of St. George)", email: "organiser.tsg@ndcvrm.gd" },
];

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#0b3d21,_#0f1210_65%)] px-4 py-10">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-xl border border-white/10 shadow-2xl md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-[#0b3d21] to-[#0d6b34] p-10 text-white md:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-md bg-accent text-lg font-bold text-accent-foreground">
                NDC
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
                  NDC Voter Relationship Manager
                </p>
                <p className="text-xs text-white/50">National Democratic Congress · Grenada</p>
              </div>
            </div>
            <h1 className="mt-10 text-2xl font-semibold leading-snug">
              Campaign Intelligence &amp; Operations Platform
            </h1>
            <p className="mt-3 max-w-sm text-sm text-white/70">
              A single command centre for constituency teams, field organizers, data
              staff, finance, communications, and campaign leadership.
            </p>
          </div>
          <p className="text-xs text-white/40">
            Authorized use only. All activity is logged and audited.
          </p>
        </div>

        <div className="bg-card p-8 sm:p-10">
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              NDC
            </div>
            <p className="text-sm font-semibold">NDC Voter Relationship Manager</p>
          </div>
          <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Sign in to Campaign HQ</CardTitle>
              <CardDescription>Use your NDC VRM credentials to continue.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Suspense>
                <LoginForm />
              </Suspense>

              <div className="mt-8 rounded-md border bg-muted/50 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Demo accounts (seeded data) — password: <code>NdcDemo2026!</code>
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {DEMO_ACCOUNTS.map((a) => (
                    <li key={a.email} className="flex items-center justify-between gap-3">
                      <span>{a.role}</span>
                      <code className="rounded bg-background px-1.5 py-0.5">{a.email}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
