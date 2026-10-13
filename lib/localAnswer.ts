import { education, hero, jobs, profile, projects, stack, yearsOfExperience } from "./content.ts";
import type { Post } from "./posts.ts";

// Offline assistant: answers from the same content the site renders plus published blog posts, with no API key.
// It speaks the same directive format as the model ([[project:ID]], [[reply:...]]), so the chat UI needs no special case.
type Lang = "vi" | "en";

const fold = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();
const words = (s: string) => fold(s).split(/[^a-z0-9+#.]+/).filter((w) => w.length > 1);
const has = (q: string, ...keys: string[]) => keys.some((k) => q.includes(k));
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n).replace(/\s+\S*$/, "")}…` : s);
const cardTitle = (s: string) => s.replace(/[\[\]|]/g, " ").trim();

const STOP = new Set(
  ("the and for you your with what who how are this that have has about does can his him her she tell show give me please " +
    "la va cua cho toi ban mot nhung cac co khong gi nao nhu the sao khang ve hay duoc de trong voi khi ma thi minh anh").split(" "),
);

function detectLang(q: string, raw: string): Lang {
  if (/[ăâđêôơưàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹ]/i.test(raw)) return "vi";
  return /\b(ban|toi|minh|khong|duoc|cua|nhung|lam|gi|nao|cho|xin|chao|muon|dang|dau)\b/.test(q) ? "vi" : "en";
}

const L = (lang: Lang, en: string, vi: string) => (lang === "vi" ? vi : en);

/** Scores published posts against the question; returns the best matches, strongest first. */
export function searchPosts(question: string, posts: Post[], limit = 2) {
  const terms = [...new Set(words(question).filter((w) => !STOP.has(w)))];
  if (!terms.length) return [];
  return posts
    .map((p) => {
      const title = fold(p.title);
      const meta = fold(`${p.excerpt} ${p.slug}`);
      const body = fold(p.body);
      let score = 0;
      for (const t of terms) {
        if (title.includes(t)) score += 5;
        if (meta.includes(t)) score += 3;
        if (body.includes(t)) score += 1;
      }
      return { p, score };
    })
    .filter((x) => x.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

const postCard = (p: Post) => `[[post:${p.slug}|${cardTitle(p.title)}]]`;

function replies(lang: Lang, ...items: [string, string][]) {
  return items.map(([en, vi]) => `[[reply:${L(lang, en, vi)}]]`).join("\n");
}

export function localAnswer(raw: string, posts: Post[]): string {
  const q = fold(raw);
  const lang = detectLang(q, raw);
  const short = profile.shortName;

  const askBlog = has(q, "blog", "bai viet", "article", "post", "note", "viet ve", "wrote");
  const found = searchPosts(raw, posts);

  // an explicit blog question, or a question that clearly matches a post, is answered from the blog
  if (askBlog || found.length >= 1) {
    if (found.length) {
      const top = found[0];
      return [
        L(lang, `${short} wrote about this: "${top.title}". ${clip(top.excerpt || top.body, 180)}`, `${short} có bài viết về chủ đề này: "${top.title}". ${clip(top.excerpt || top.body, 180)}`),
        ...found.map(postCard),
        replies(lang, ["What else has he written?", "Khang còn viết gì nữa?"], ["Show me his projects", "Cho mình xem các dự án"]),
      ].join("\n");
    }
    if (askBlog) {
      const latest = posts.slice(0, 2);
      if (latest.length) {
        return [
          L(lang, `Here are the latest posts on ${short}'s blog.`, `Đây là những bài mới nhất trên blog của ${short}.`),
          ...latest.map(postCard),
          replies(lang, ["What are his biggest achievements?", "Thành tích nổi bật nhất của Khang là gì?"], ["Show me his projects", "Cho mình xem các dự án"]),
        ].join("\n");
      }
      return [
        L(lang, "There are no published posts yet. Check back soon.", "Chưa có bài viết nào được đăng. Bạn quay lại sau nhé."),
        replies(lang, ["Show me his projects", "Cho mình xem các dự án"], ["How do I contact him?", "Liên hệ Khang thế nào?"]),
      ].join("\n");
    }
  }

  if (has(q, "hire", "tuyen", "hop tac", "collaborat", "work with", "lam viec cung", "freelance", "cong tac", "contact", "lien he", "email", "phone", "so dien thoai", "linkedin", "github")) {
    return [
      L(lang, `Happy to connect. You can reach ${short} directly, or leave your details and he will get back to you.`, `Rất vui được kết nối. Bạn có thể liên hệ trực tiếp ${short}, hoặc để lại thông tin để Khang phản hồi.`),
      "[[contact]]",
      "[[lead]]",
      replies(lang, ["Chat with Khang live", "Nhắn trực tiếp cho Khang"], ["Show me his projects", "Cho mình xem các dự án"]),
    ].join("\n");
  }

  if (has(q, "salary", "luong", "notice", "availab", "san sang", "ranh", "lich", "schedule", "remote", "offer", "rate", "bao nhieu tien")) {
    return [
      L(lang, `I can't answer that one. ${short} can reply himself, either live or by email (${profile.email}).`, `Mình chưa trả lời được câu này. ${short} sẽ tự trả lời, qua chat trực tiếp hoặc email (${profile.email}).`),
      "[[live]]",
      "[[contact]]",
    ].join("\n");
  }

  const proj = projects.find((p) => {
    const keys = [p.slug, p.name, ...p.stack].map(fold);
    return keys.some((k) => k.length > 3 && q.includes(k)) || (p.slug === "jobtest-assessment" && has(q, "jobtest")) || (p.slug === "payment-gateways" && has(q, "payment", "thanh toan", "momo", "zalopay", "onepay"));
  });
  if (proj && !has(q, "all project", "cac du an", "best project", "du an noi bat")) {
    return [
      `${L(lang, proj.desc.en, proj.desc.vi)}`,
      `[[project:${proj.slug}]]`,
      replies(lang, ["What stack does it use?", "Dự án này dùng công nghệ gì?"], ["How do I contact him?", "Liên hệ Khang thế nào?"]),
    ].join("\n");
  }

  if (has(q, "project", "du an", "portfolio", "work", "san pham", "built", "xay")) {
    return [
      L(lang, `Here are some of ${short}'s standout projects.`, `Đây là vài dự án nổi bật của ${short}.`),
      "[[project:jobtest-assessment]]",
      "[[project:aihr]]",
      replies(lang, ["What are his biggest achievements?", "Thành tích nổi bật nhất của Khang là gì?"], ["What's his tech stack?", "Khang dùng những công nghệ gì?"], ["I'd like to hire or work with Khang", "Mình muốn tuyển dụng hoặc hợp tác với Khang"]),
    ].join("\n");
  }

  const group = stack.find((g) => has(q, fold(g.group.en)) || g.items.some((i) => q.includes(fold(i).split(" ")[0]) && fold(i).length > 3));
  if (has(q, "stack", "skill", "tech", "cong nghe", "ky nang", "language", "ngon ngu", "framework", "vue", "react", "nest", "laravel", "node", "postgres", "mongo", "redis", "docker", "aws") || group) {
    return [
      group
        ? L(lang, `${short} works with ${group.items.join(", ")} in ${group.group.en}.`, `${short} làm việc với ${group.items.join(", ")} ở mảng ${group.group.vi}.`)
        : L(lang, `${short} mainly works with Vue, React, NestJS and Laravel, backed by PostgreSQL, MongoDB and Redis.`, `${short} chủ yếu dùng Vue, React, NestJS và Laravel, cùng PostgreSQL, MongoDB và Redis.`),
      `[[skills:${(group ?? stack[0]).group.en}]]`,
      replies(lang, ["Show me his projects", "Cho mình xem các dự án"], ["Where has he worked?", "Khang đã làm ở đâu?"]),
    ].join("\n");
  }

  if (has(q, "experience", "kinh nghiem", "career", "job", "cong ty", "company", "worked", "lam o", "lam viec", "years", "nam kinh nghiem", "jobtest", "aihr", "boostcrm")) {
    const job = jobs.find((j) => has(q, fold(j.company.split("·").pop()!.trim()), j.id));
    const list = job ? [job] : jobs.slice(0, 2);
    return [
      L(lang, `${short} has ${yearsOfExperience()}+ years of fullstack experience.`, `${short} có hơn ${yearsOfExperience()} năm kinh nghiệm fullstack.`),
      ...list.map((j) => `[[job:${j.id}]]`),
      replies(lang, ["Show me his projects", "Cho mình xem các dự án"], ["What are his biggest achievements?", "Thành tích nổi bật nhất của Khang là gì?"]),
    ].join("\n");
  }

  if (has(q, "achievement", "thanh tich", "nang luc", "number", "so lieu", "scale", "impact", "noi bat", "biggest", "proud")) {
    return [
      L(lang, `${short} scaled an assessment platform to 35,000+ concurrent users and supports 6,000+ enterprise employees on a multi-tenant HRM.`, `${short} đã nâng nền tảng đánh giá lên hơn 35,000 người dùng đồng thời và phục vụ hơn 6,000 nhân viên doanh nghiệp trên HRM đa khách hàng.`),
      "[[stats]]",
      replies(lang, ["Show me his projects", "Cho mình xem các dự án"], ["I'd like to hire or work with Khang", "Mình muốn tuyển dụng hoặc hợp tác với Khang"]),
    ].join("\n");
  }

  if (has(q, "education", "hoc van", "university", "dai hoc", "school", "truong", "degree", "bang cap")) {
    return [
      L(lang, `${short} holds a ${education.degree.en} from ${education.school.en} (${education.period}).`, `${short} tốt nghiệp ${education.degree.vi} tại ${education.school.vi} (${education.period}).`),
      replies(lang, ["Where has he worked?", "Khang đã làm ở đâu?"], ["What's his tech stack?", "Khang dùng những công nghệ gì?"]),
    ].join("\n");
  }

  if (has(q, "where", "o dau", "location", "city", "thanh pho", "song")) {
    return [
      L(lang, `${short} is based in ${profile.location.en}.`, `${short} đang ở ${profile.location.vi}.`),
      replies(lang, ["How do I contact him?", "Liên hệ Khang thế nào?"], ["Show me his projects", "Cho mình xem các dự án"]),
    ].join("\n");
  }

  if (has(q, "who", "la ai", "about", "gioi thieu", "introduce", "yourself", "ban than")) {
    return [
      L(lang, `${profile.name}: ${hero.role.en}. ${hero.lead.en}`, `${profile.name}: ${hero.role.vi}. ${hero.lead.vi}`),
      "[[stats]]",
      replies(lang, ["Show me his projects", "Cho mình xem các dự án"], ["What's his tech stack?", "Khang dùng những công nghệ gì?"], ["How do I contact him?", "Liên hệ Khang thế nào?"]),
    ].join("\n");
  }

  if (/^(hi|hello|hey|xin chao|chao|alo|yo)\b/.test(q)) {
    return [
      L(lang, `Hi! I can tell you about ${short}'s projects, experience, stack and blog posts.`, `Xin chào! Mình có thể giới thiệu về dự án, kinh nghiệm, công nghệ và các bài blog của ${short}.`),
      replies(lang, ["Show me his projects", "Cho mình xem các dự án"], ["What's his tech stack?", "Khang dùng những công nghệ gì?"], ["Show me his blog posts", "Cho mình xem các bài blog"]),
    ].join("\n");
  }

  return [
    L(lang, `I'm not sure about that one. I can talk about ${short}'s projects, experience, stack and blog, or you can ask him directly.`, `Mình chưa chắc về câu này. Mình có thể nói về dự án, kinh nghiệm, công nghệ và blog của ${short}, hoặc bạn nhắn trực tiếp cho Khang.`),
    "[[live]]",
    replies(lang, ["Show me his projects", "Cho mình xem các dự án"], ["Show me his blog posts", "Cho mình xem các bài blog"], ["How do I contact him?", "Liên hệ Khang thế nào?"]),
  ].join("\n");
}
