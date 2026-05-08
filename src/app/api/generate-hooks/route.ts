import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions";

const STYLES = ["悬念型", "痛点型", "反差型", "权威型", "故事型", "数据型", "情绪型", "指令型"] as const;

const PLATFORM_GUIDES: Record<string, string> = {
  "小红书": "- 小红书风格：情绪共鸣 + 利他性 + 场景感，口语化，多用感叹号和 emoji\n- 面向人群：追求生活品质、自我提升的年轻女性",
  "抖音": "- 抖音风格：强悬念 + 冲突感 + 快节奏，开头必须 1 秒抓人，口语化，短促有力\n- 面向人群：泛大众，娱乐化表达",
  "B站": "- B站风格：信息密度高 + 好奇心缺口 + 专业感，允许稍长，重视干货价值\n- 面向人群：Z世代，知识探索型用户",
};

const TYPE_GUIDES: Record<string, string> = {
  "视频": "- 视频：开场要极短（3-5 秒抓人），悬念前置，肢体语言配合",
  "图文": "- 图文：场景感强，细节丰富，文字本身就有画面感",
  "教程": "- 教程：利他性明显，结构清晰，多用\"教你\"\"手把手\"等词",
  "观点": "- 观点：立场鲜明，有争议性，引发讨论欲",
};

function buildPrompt(topic: string, platform: string, contentType: string): string {
  return `你是一位爆款 Hook（标题/开场白）写作大师。你的任务是根据以下信息生成 8 条不同风格的爆款 Hook。

【主题】${topic}
【平台】${platform}
【内容类型】${contentType}

${PLATFORM_GUIDES[platform] || ""}
${TYPE_GUIDES[contentType] || ""}

【8 种固定风格，每种生成一条】
1. 悬念型：制造信息差，让人好奇\"为什么会这样？\"
2. 痛点型：戳中用户焦虑或恐惧，让人感觉\"说的就是我\"
3. 反差型：颠覆常识认知，制造意外感
4. 权威型：数据/专家/行业背书，增加可信度
5. 故事型：场景代入，让人产生画面感和共鸣
6. 数据型：用具体数字制造冲击感
7. 情绪型：强烈情感共鸣，煽动情绪
8. 指令型：直接命令或号召，制造紧迫感

【重要规则】
- 每条 Hook 控制在 30 字以内，必须精炼有力
- 不要用\"揭秘\"\"震惊\"\"竟然\"等过度使用的词
- 每条 Hook 必须是完整的一句话，不能是省略句
- 评分标准：点击欲 = 好奇心缺口大小 × 情绪冲击力 × 利他价值
- 推荐理由要具体说明\"为什么这条 Hook 有效\"，不超过 30 字

请以严格的 JSON 格式输出，不要包含其他文字：
{"hooks":[{"text":"...","style":"悬念型","score":8,"reason":"..."},{"text":"...","style":"痛点型","score":7,"reason":"..."}]}`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  let body: { topic: string; platform: string; contentType: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { topic, platform, contentType } = body;
  if (!topic?.trim()) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }
  if (!["小红书", "抖音", "B站"].includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }
  if (!["视频", "图文", "教程", "观点"].includes(contentType)) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }

  const userPrompt = buildPrompt(topic.trim(), platform, contentType);

  try {
    const res = await fetch(DEEPSEEK_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一个严格输出 JSON 的写作专家，只输出 JSON，不要包含任何解释或额外文字。" },
          { role: "user", content: userPrompt },
        ],
        temperature: 1.2,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("DeepSeek API error:", res.status, errText);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content || "";

    // extract JSON from response (handle markdown code fences)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", content);
      return NextResponse.json({ error: "AI response parse failed" }, { status: 502 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    let hooks = parsed.hooks || parsed;

    // validate & normalize
    if (!Array.isArray(hooks)) {
      throw new Error("Response is not an array");
    }

    hooks = hooks.slice(0, 8).map((h: any, i: number) => ({
      text: h.text || "",
      style: STYLES[i] || h.style || "悬念型",
      score: Math.min(10, Math.max(1, Math.round(Number(h.score) || 7))),
      reason: h.reason || h.recommendation || "",
    }));

    return NextResponse.json({ hooks });
  } catch (err) {
    console.error("Generate hooks error:", err);
    return NextResponse.json({ error: "Failed to generate hooks" }, { status: 500 });
  }
}
