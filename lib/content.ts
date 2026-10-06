import type { L10n } from "./i18n";

export const profile = {
  name: "Huỳnh Nhật Khang",
  shortName: "Khang",
  email: "huynhnhatkhang78@gmail.com",
  github: "https://github.com/khang0708",
  linkedin: "https://www.linkedin.com/in/khang-huỳnh-nhật-561755210/",
  location: { en: "Ho Chi Minh City, Vietnam", vi: "TP. Hồ Chí Minh, Việt Nam" } as L10n,
};

// Career start = first job (BoostCRM, Aug 2019). Years are whole years completed, so "7+" means at least 7.
export const careerStart = { year: 2019, month: 8 };

export function yearsOfExperience(now: Date = new Date()): number {
  const y = now.getFullYear() - careerStart.year;
  return Math.max(0, now.getMonth() + 1 < careerStart.month ? y - 1 : y);
}

export const hero = {
  role: { en: "Senior fullstack developer", vi: "Lập trình viên Fullstack Senior" } as L10n,
  lead: {
    en: "I build web platforms that hold up under load, from real-time systems to payments and AI.",
    vi: "Tôi xây các nền tảng web chịu tải lớn, từ hệ thống thời gian thực, thanh toán đến AI.",
  } as L10n,
  // Recomputed on every read, so the number of years never goes stale.
  get body(): L10n {
    const y = yearsOfExperience();
    return {
      en: `${y}+ years shipping fullstack products end to end with Vue, React, NestJS and Laravel: web and mobile apps, WebRTC video, payment gateways, ERP integrations and LLM-powered features. Today I lead a small team at JobTest.vn and AIHR, where one platform serves 35,000+ concurrent users.`,
      vi: `Hơn ${y} năm làm sản phẩm fullstack từ đầu đến cuối với Vue, React, NestJS và Laravel: ứng dụng web và mobile, video WebRTC, cổng thanh toán, tích hợp ERP và tính năng dùng LLM. Hiện tôi dẫn dắt một nhóm nhỏ tại JobTest.vn và AIHR, nơi một nền tảng phục vụ hơn 35,000 người dùng đồng thời.`,
    };
  },
  caption: {
    en: "35,000 points, one for each concurrent user the platform handles.",
    vi: "35,000 điểm, mỗi điểm là một người dùng đồng thời mà nền tảng xử lý.",
  } as L10n,
  ctaWork: { en: "See selected work", vi: "Xem dự án" } as L10n,
  ctaMail: { en: "Email me", vi: "Gửi email" } as L10n,
};

export type Job = {
  id: string;
  title: L10n;
  company: string;
  period: L10n;
  current?: boolean;
  summary: L10n;
  points: L10n[];
  tags: string[];
  metric: { value: string; label: L10n };
};

export const jobs: Job[] = [
  {
    id: "aihr",
    tags: ["Vue 3", "NestJS", "PostgreSQL", "Redis", "OpenAI", "Gemini"],
    metric: { value: "6,000+", label: { en: "enterprise employees", vi: "nhân viên doanh nghiệp" } },
    title: { en: "Senior Fullstack Developer, Team Leader", vi: "Lập trình viên Fullstack Senior, Trưởng nhóm" },
    company: "JobTest.vn · AIHR",
    period: { en: "May 2021 to present", vi: "05/2021 đến nay" },
    current: true,
    summary: {
      en: "HRM platform covering recruitment, attendance, payroll, training and KPI for enterprise customers.",
      vi: "Nền tảng HRM gồm tuyển dụng, chấm công, tính lương, đào tạo và KPI cho khách hàng doanh nghiệp.",
    },
    points: [
      { en: "Lead 4 to 5 developers: task allocation, code review, mentoring junior and mid-level engineers.", vi: "Dẫn dắt 4–5 lập trình viên: phân công, review code, mentoring junior và mid-level." },
      { en: "Migrated the whole platform from Vue 2 to Vue 3.", vi: "Migrate toàn bộ platform từ Vue 2 lên Vue 3." },
      { en: "Integrated MoMo, ZaloPay and OnePay end to end, from checkout UI to IPN webhooks, reconciliation and refunds.", vi: "Tích hợp MoMo, ZaloPay, OnePay từ checkout UI đến IPN webhook, đối soát và hoàn tiền." },
      { en: "Added Gemini and OpenAI APIs to product features for HR automation.", vi: "Tích hợp Gemini và OpenAI API vào tính năng sản phẩm để tự động hóa nghiệp vụ nhân sự." },
      { en: "Supports 6,000+ enterprise employees on a multi-tenant HRM.", vi: "Phục vụ hơn 6,000 nhân viên doanh nghiệp trên HRM đa khách hàng." },
    ],
  },
  {
    id: "assessment",
    tags: ["Vue 3", "Laravel", "MongoDB", "Redis", "WebRTC", "AWS"],
    metric: { value: "35,000+", label: { en: "concurrent users", vi: "người dùng đồng thời" } },
    title: { en: "Middle Fullstack JavaScript Developer", vi: "Lập trình viên Full-Stack JavaScript (Middle)" },
    company: "JobTest.vn · Talent Assessment",
    period: { en: "May 2021 to present", vi: "05/2021 đến nay" },
    current: true,
    summary: {
      en: "Online assessment platform used by 200+ corporate clients, with 500,000+ test sessions.",
      vi: "Nền tảng đánh giá trực tuyến phục vụ hơn 200 doanh nghiệp, hơn 500,000 lượt kiểm tra.",
    },
    points: [
      { en: "Scaled the assessment platform to 35,000+ concurrent users.", vi: "Nâng cấp nền tảng đánh giá lên hơn 35,000 người dùng đồng thời." },
      { en: "Built real-time proctoring over WebRTC: face camera and screen recorded during the test.", vi: "Xây dựng giám sát thi thời gian thực bằng WebRTC: ghi camera khuôn mặt và màn hình thí sinh." },
      { en: "Integrated SAP ERP with two-way sync of personnel data and results.", vi: "Tích hợp SAP ERP, đồng bộ hai chiều dữ liệu nhân sự và kết quả." },
      { en: "Designed the submission pipeline on Laravel Horizon queues and Redis for thousands of simultaneous tests.", vi: "Thiết kế pipeline nộp bài bằng Laravel Horizon và Redis cho hàng nghìn bài thi đồng thời." },
      { en: "Raised Lighthouse performance and SEO scores to 90+.", vi: "Nâng điểm Lighthouse Performance và SEO lên 90+." },
    ],
  },
  {
    id: "boostcrm",
    tags: ["React", "React Native", "NestJS", "PostgreSQL", "WebRTC"],
    metric: { value: "5", label: { en: "person team, built from scratch", vi: "thành viên, xây từ đầu" } },
    title: { en: "Junior Fullstack JavaScript Developer", vi: "Lập trình viên Full-Stack JavaScript (Junior)" },
    company: "BoostCRM",
    period: { en: "Aug 2019 to Apr 2021", vi: "08/2019 – 04/2021" },
    summary: {
      en: "Core member of a five-person team building a CRM from scratch.",
      vi: "Thành viên cốt lõi nhóm 5 người xây dựng CRM từ đầu.",
    },
    points: [
      { en: "Built web UI in React and Next.js, and mobile apps in React Native shipped to both stores.", vi: "Xây giao diện web bằng React/Next.js và app mobile bằng React Native, phát hành lên cả hai store." },
      { en: "Built REST APIs with Node.js and NestJS, with PostgreSQL schemas.", vi: "Xây REST API bằng Node.js/NestJS, thiết kế schema PostgreSQL." },
      { en: "Implemented real-time voice and video calls for the call center module with WebRTC.", vi: "Triển khai gọi thoại/video thời gian thực cho module Call Center bằng WebRTC." },
    ],
  },
];

export type Project = {
  slug: string;
  name: string;
  line: L10n;
  desc: L10n;
  metric: L10n;
  highlights: L10n[];
  stack: string[];
  href?: string;
  hrefLabel?: L10n;
};

export const projects: Project[] = [
  {
    slug: "jobtest-assessment",
    name: "JobTest.vn",
    line: { en: "Online assessment at 35,000+ concurrent users", vi: "Đánh giá trực tuyến, 35,000+ người dùng đồng thời" },
    desc: {
      en: "Online candidate assessment: skill, psychological and career tests with flexible test configuration, serving 200+ corporate clients.",
      vi: "Nền tảng đánh giá ứng viên trực tuyến: bài thi kỹ năng, tâm lý, nghề nghiệp với cấu hình linh hoạt, phục vụ hơn 200 doanh nghiệp.",
    },
    metric: { en: "35,000+ concurrent users, 500,000+ test sessions", vi: "35,000+ người dùng đồng thời, 500,000+ lượt thi" },
    highlights: [
      { en: "Real-time proctoring over WebRTC with face camera and screen capture.", vi: "Giám sát thi thời gian thực qua WebRTC với camera khuôn mặt và màn hình." },
      { en: "Queue-based submission pipeline on Laravel Horizon and Redis.", vi: "Pipeline nộp bài dựa trên hàng đợi Laravel Horizon và Redis." },
      { en: "Two-way SAP ERP integration.", vi: "Tích hợp hai chiều với SAP ERP." },
      { en: "Lighthouse performance and SEO at 90+ across pages.", vi: "Điểm Lighthouse Performance và SEO 90+ trên toàn bộ trang." },
    ],
    stack: ["Vue.js 3", "Laravel", "MongoDB", "Redis", "WebSocket", "WebRTC", "AWS"],
    href: "https://jobtest.vn",
    hrefLabel: { en: "Visit jobtest.vn", vi: "Mở jobtest.vn" },
  },
  {
    slug: "aihr",
    name: "AIHR Platform",
    line: { en: "HRM for 6,000+ enterprise employees", vi: "HRM cho hơn 6,000 nhân viên doanh nghiệp" },
    desc: {
      en: "Full HRM platform for enterprises: recruitment, attendance, payroll, training and KPI tracking, with AI-assisted HR workflows.",
      vi: "Nền tảng HRM toàn diện cho doanh nghiệp: tuyển dụng, chấm công, tính lương, đào tạo, KPI, kèm quy trình nhân sự có AI hỗ trợ.",
    },
    metric: { en: "6,000+ enterprise employees, multi-tenant", vi: "6,000+ nhân viên doanh nghiệp, đa khách hàng" },
    highlights: [
      { en: "Vue 2 to Vue 3 migration of the whole platform.", vi: "Migrate toàn bộ platform từ Vue 2 lên Vue 3." },
      { en: "Deep per-customer customization on a shared multi-tenant core.", vi: "Tùy chỉnh sâu theo từng khách hàng trên lõi đa khách hàng dùng chung." },
      { en: "Gemini and OpenAI features for HR automation.", vi: "Tính năng dùng Gemini và OpenAI để tự động hóa nghiệp vụ nhân sự." },
      { en: "REST API design and query tuning across PostgreSQL and MongoDB.", vi: "Thiết kế REST API và tối ưu truy vấn trên PostgreSQL và MongoDB." },
    ],
    stack: ["Vue.js 3", "Node.js", "NestJS", "PostgreSQL", "Redis", "OpenAI"],
    href: "https://aihr.vn",
    hrefLabel: { en: "Visit aihr.vn", vi: "Mở aihr.vn" },
  },
  {
    slug: "payment-gateways",
    name: "Payment gateway integration",
    line: { en: "MoMo, ZaloPay and OnePay, end to end", vi: "MoMo, ZaloPay, OnePay, trọn vẹn đầu cuối" },
    desc: {
      en: "End-to-end integration of Vietnamese payment gateways into a SaaS platform: checkout UI, asynchronous IPN webhooks, reconciliation and refunds.",
      vi: "Tích hợp trọn vẹn các cổng thanh toán Việt Nam vào nền tảng SaaS: giao diện checkout, IPN webhook bất đồng bộ, đối soát và hoàn tiền.",
    },
    metric: { en: "3 gateways in production", vi: "3 cổng thanh toán đang chạy production" },
    highlights: [
      { en: "Checkout UI through to payment confirmation.", vi: "Từ giao diện checkout đến xác nhận thanh toán." },
      { en: "Asynchronous IPN webhook handling.", vi: "Xử lý IPN webhook bất đồng bộ." },
      { en: "Transaction reconciliation and refund flows.", vi: "Luồng đối soát giao dịch và hoàn tiền." },
    ],
    stack: ["MoMo API", "ZaloPay API", "OnePay API", "Node.js", "Queue"],
  },
  {
    slug: "boostcrm",
    name: "BoostCRM",
    line: { en: "CRM with a WebRTC call center", vi: "CRM tích hợp Call Center WebRTC" },
    desc: {
      en: "Full CRM across web and mobile, with an integrated call center (WebRTC voice and video), chatbot and enterprise customer management.",
      vi: "Hệ thống CRM trên web và mobile, tích hợp Call Center (thoại/video WebRTC), chatbot và quản lý khách hàng doanh nghiệp.",
    },
    metric: { en: "Web, iOS and Android", vi: "Web, iOS và Android" },
    highlights: [
      { en: "Built from scratch by a five-person team.", vi: "Xây từ đầu bởi nhóm 5 người." },
      { en: "React Native apps shipped to Google Play and the App Store.", vi: "App React Native phát hành lên Google Play và App Store." },
      { en: "Real-time calls for the call center module.", vi: "Gọi thời gian thực cho module Call Center." },
    ],
    stack: ["React", "React Native", "NestJS", "PostgreSQL", "WebRTC"],
  },
  {
    slug: "interview-prep",
    name: "AI Interview Prep",
    line: { en: "Mock interviews with real-time AI scoring", vi: "Phỏng vấn thử có AI chấm điểm thời gian thực" },
    desc: {
      en: "Technical interview practice SaaS: live mock interviews over Socket.IO, asynchronous AI scoring on BullMQ, and questions generated by Gemini, OpenAI or Ollama, swappable per user.",
      vi: "SaaS luyện phỏng vấn kỹ thuật: mock interview real-time qua Socket.IO, AI chấm điểm bất đồng bộ bằng BullMQ, câu hỏi sinh từ Gemini, OpenAI hoặc Ollama, đổi được theo từng người dùng.",
    },
    metric: { en: "Personal project, full ownership", vi: "Dự án cá nhân, tự làm toàn bộ" },
    highlights: [
      { en: "Provider-agnostic AI layer: Gemini, OpenAI and local Ollama.", vi: "Lớp AI không phụ thuộc nhà cung cấp: Gemini, OpenAI và Ollama chạy local." },
      { en: "Async scoring jobs with BullMQ so interviews stay responsive.", vi: "Job chấm điểm bất đồng bộ bằng BullMQ để buổi phỏng vấn luôn mượt." },
      { en: "Next.js App Router frontend with a liquid-glass UI.", vi: "Frontend Next.js App Router với giao diện liquid-glass." },
    ],
    stack: ["NestJS", "Next.js", "TypeScript", "PostgreSQL", "Redis", "BullMQ", "Socket.IO", "Prisma", "Docker"],
    href: "https://github.com/khang0708/interview-prep-platform",
    hrefLabel: { en: "View on GitHub", vi: "Xem trên GitHub" },
  },
  {
    slug: "job-application-tracker",
    name: "Job Application Tracker",
    line: { en: "Kanban board with AI job-description parsing", vi: "Bảng Kanban với AI phân tích JD" },
    desc: {
      en: "Job application manager: drag-and-drop Kanban with optimistic updates, JD parsing with Gemini 2.0 Flash, cover letters in EN and VI tailored to a CV and JD, and PDF/DOCX resume upload with text extraction.",
      vi: "Quản lý hồ sơ ứng tuyển: Kanban kéo thả với optimistic update, AI parse JD bằng Gemini 2.0 Flash, sinh cover letter EN/VI theo CV và JD, upload CV PDF/DOCX có trích xuất văn bản.",
    },
    metric: { en: "Personal project, full ownership", vi: "Dự án cá nhân, tự làm toàn bộ" },
    highlights: [
      { en: "Optimistic drag-and-drop with @dnd-kit.", vi: "Kéo thả optimistic với @dnd-kit." },
      { en: "CV-aware cover letter generation in English and Vietnamese.", vi: "Sinh cover letter theo CV bằng tiếng Anh và tiếng Việt." },
      { en: "pnpm workspaces monorepo.", vi: "Monorepo pnpm workspaces." },
    ],
    stack: ["NestJS", "Next.js 14", "TypeScript", "TypeORM", "PostgreSQL", "Gemini", "@dnd-kit", "Zustand", "Docker"],
    href: "https://github.com/khang0708/job-application-tracker",
    hrefLabel: { en: "View on GitHub", vi: "Xem trên GitHub" },
  },
];

export const stack: { group: L10n; items: string[] }[] = [
  { group: { en: "Frontend", vi: "Frontend" }, items: ["Vue 3", "React", "Next.js", "React Native", "TypeScript", "Pinia"] },
  { group: { en: "Backend", vi: "Backend" }, items: ["Node.js", "NestJS", "Laravel / PHP", "REST", "WebSocket", "BullMQ", "Laravel Horizon"] },
  { group: { en: "Data", vi: "Dữ liệu" }, items: ["PostgreSQL", "MongoDB", "Redis", "MySQL", "Cassandra"] },
  { group: { en: "Payments", vi: "Thanh toán" }, items: ["MoMo", "ZaloPay", "OnePay", "IPN webhooks", "Reconciliation"] },
  { group: { en: "Infrastructure", vi: "Hạ tầng" }, items: ["AWS", "Docker", "GitLab CI/CD", "Linux"] },
  { group: { en: "AI", vi: "AI" }, items: ["OpenAI API", "Gemini API", "Ollama", "Claude", "Cursor", "GitHub Copilot"] },
];

export const education = {
  school: { en: "HCMC University of Technology and Education", vi: "ĐH Sư phạm Kỹ thuật TP.HCM" } as L10n,
  degree: { en: "B.Sc. Information Technology", vi: "Cử nhân Công nghệ Thông tin" } as L10n,
  period: "2016 - 2020",
};
