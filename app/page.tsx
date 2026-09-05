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
    // 数据库不可达时仍渲染着陆页（§5：核心发声流程优先，不整页崩溃）
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <section className="py-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          让每一位青年领袖
          <br />
          <span className="text-purple-600">以言促行，信任铸就支持</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          SpeakForward 是表达权公平基础设施：因健康原因无法自然发声或录音的青年领袖（18-25岁），
          通过 AI 生成语音分享愿景，接受透明、无平台托管的链上支持。
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-xs text-muted-foreground/70">
          {AI_DISCLOSURE_TEXT} · 本平台不验证身份，请您自行判断
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button size="lg" render={<Link href="/create" />}>
            用你的声音分享愿景
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/ethics" />}>
            我们的信任设计
          </Button>
        </div>
      </section>

      <section className="py-6">
        <h2 className="mb-4 text-xl font-semibold">最新愿景</h2>
        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              还没有项目。成为第一个发声的人吧。
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
                        ✦ AI语音
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
                      {new Date(p.created_at).toLocaleDateString("zh-CN")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {p.vision_text}
                    </p>
                    <Button variant="ghost" size="sm" className="mt-3 px-0" render={<Link href={`/projects/${p.id}`} />}>
                      聆听并支持 →
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
