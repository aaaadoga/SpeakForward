import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPersona, AI_DISCLOSURE_TEXT } from "@/lib/personas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

interface ProjectRow {
  id: string;
  title: string;
  vision_text: string;
  persona: string;
  created_at: string;
}

export default async function Home() {
  let projects: ProjectRow[] = [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("projects")
      .select("id, title, vision_text, persona, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    projects = data ?? [];
  } catch {
    // §5: if the database is unreachable, still render the landing page
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <section className="py-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Where young leaders turn words into action,
          <br />
          <span className="text-purple-600">funded by trust</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          SpeakForward is fair-speech infrastructure: young leaders (18–25)
          whose health conditions prevent them from speaking or recording
          naturally share their vision through AI-generated voices — and
          receive transparent, non-custodial support on Solana.
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-xs text-muted-foreground/70">
          {AI_DISCLOSURE_TEXT} · This platform does not verify identities.
          Please judge for yourself.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button size="lg" render={<Link href="/create" />}>
            Share your vision
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/ethics" />}>
            Our trust design
          </Button>
        </div>
      </section>

      <section className="py-6">
        <h2 className="mb-4 text-xl font-semibold">Latest voices</h2>
        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No projects yet. Be the first to speak up.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((p) => {
              const persona = getPersona(p.persona);
              return (
                <Card key={p.id} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary">{persona?.name ?? p.persona}</Badge>
                      <Badge
                        variant="outline"
                        className="border-purple-400/60 bg-purple-50 text-purple-700"
                      >
                        ✦ AI voice
                      </Badge>
                    </div>
                    <CardTitle className="mt-2">
                      <Link
                        href={`/projects/${p.id}`}
                        className="hover:underline"
                      >
                        {p.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      {new Date(p.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {p.vision_text}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 px-0"
                      render={<Link href={`/projects/${p.id}`} />}
                    >
                      Listen & support →
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
