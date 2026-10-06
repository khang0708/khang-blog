// Sample posts written from the real projects in lib/content.ts. Imported as DRAFTS from the admin Blog tab ("Nạp bài mẫu").
// SEO shape: title <= 60 chars, excerpt (meta description) <= 160 chars, keyword in the first paragraph, "##" sub-headings, FAQ block at the end.
// Facts come from the project data; the engineering advice is general practice. Review each post and add your own numbers, code and screenshots before publishing.
export type Sample = { slug: string; title: string; excerpt: string; body: string; cover?: string; coverAlt?: string };

const raw: Sample[] = [
  {
    slug: "he-thong-thi-truc-tuyen-chiu-tai-lon",
    title: "Xây dựng hệ thống thi trực tuyến chịu tải 35.000 người dùng",
    excerpt:
      "Kinh nghiệm xây hệ thống thi trực tuyến chịu tải lớn: hàng đợi Laravel Horizon + Redis, giám sát WebRTC, tích hợp SAP ERP và tối ưu Lighthouse trên 90.",
    body: `Hệ thống thi trực tuyến chịu tải lớn là bài toán khó hơn nhiều so với một website thông thường: hàng chục nghìn thí sinh cùng bắt đầu và cùng nộp bài trong một khung giờ. Bài viết này chia sẻ cách mình xây dựng JobTest.vn, nền tảng đánh giá ứng viên phục vụ hơn 200 doanh nghiệp, với hơn 500.000 lượt thi và hơn 35.000 người dùng đồng thời.

## Bài toán của một nền tảng đánh giá ứng viên trực tuyến

JobTest.vn cung cấp bài thi kỹ năng, tâm lý và nghề nghiệp với cấu hình linh hoạt cho từng doanh nghiệp. Đặc thù của loại hệ thống này là lưu lượng không đều: phần lớn thời gian khá yên tĩnh, nhưng khi một doanh nghiệp mở đợt thi, rất nhiều thí sinh vào cùng lúc và nộp bài gần như cùng thời điểm. Hệ thống phải đảm bảo hai điều: không mất bài làm của bất kỳ ai, và giao diện luôn phản hồi nhanh.

## Pipeline nộp bài bằng hàng đợi Laravel Horizon và Redis

Thay vì xử lý toàn bộ bài nộp ngay trong request, mình đưa bài nộp vào hàng đợi (queue) trên Laravel Horizon với Redis làm backend. Cách làm này có ba lợi ích:

- Request của thí sinh trả về nhanh vì việc nặng được xử lý nền.
- Đỉnh tải được "san phẳng": hàng đợi hấp thụ lượng bài nộp dồn dập, các worker xử lý dần theo năng lực.
- Có thể theo dõi, thử lại và mở rộng số worker mà không đụng tới phần giao diện.

Nguyên tắc quan trọng là bài làm phải được ghi nhận an toàn trước, rồi mới chấm và tổng hợp sau. Nhờ đó dù hệ thống đang quá tải, thí sinh vẫn không mất dữ liệu.

## Giám sát thi thời gian thực bằng WebRTC

Với các kỳ thi cần giám sát, hệ thống ghi lại camera khuôn mặt và màn hình của thí sinh trong suốt bài thi, truyền qua WebRTC. WebRTC phù hợp vì độ trễ thấp và truyền được trực tiếp giữa trình duyệt, cùng WebSocket để cập nhật trạng thái thời gian thực. Phần này đòi hỏi chú ý đặc biệt tới quyền truy cập camera, chất lượng mạng của thí sinh và cách xử lý khi kết nối bị gián đoạn.

## Tích hợp SAP ERP hai chiều

Nhiều doanh nghiệp lớn muốn dữ liệu nhân sự và kết quả thi đồng bộ với SAP ERP. Mình xây tích hợp hai chiều: dữ liệu nhân sự đi vào hệ thống thi, kết quả đi ngược lại ERP. Điều quan trọng khi tích hợp hệ thống doanh nghiệp là định nghĩa rõ nguồn dữ liệu chuẩn (source of truth), xử lý lỗi đồng bộ và có cách đối chiếu khi hai bên lệch nhau.

## Tối ưu hiệu năng và SEO: Lighthouse trên 90

Giao diện Vue.js 3 được tối ưu để điểm Lighthouse Performance và SEO đạt trên 90 ở các trang chính. Với nền tảng có trang công khai cho doanh nghiệp và ứng viên, điểm này giúp trang tải nhanh hơn trên mạng di động và dễ được công cụ tìm kiếm hiểu hơn.

## Kết quả

- Hơn 35.000 người dùng đồng thời.
- Hơn 500.000 lượt thi.
- Phục vụ hơn 200 doanh nghiệp.
- Điểm Lighthouse Performance và SEO trên 90.

Công nghệ sử dụng: Vue.js 3, Laravel, MongoDB, Redis, WebSocket, WebRTC và AWS.

## Câu hỏi thường gặp

### Hệ thống thi trực tuyến cần chú ý gì khi nhiều người nộp bài cùng lúc?

Hãy tách việc ghi nhận bài nộp khỏi việc xử lý nặng: ghi nhận an toàn trước, đưa vào hàng đợi, rồi chấm điểm và tổng hợp nền. Cách này giữ giao diện nhanh và không làm mất dữ liệu khi tải tăng đột biến.

### Có thể giám sát thí sinh qua trình duyệt mà không cài phần mềm không?

Có. WebRTC cho phép truyền camera và màn hình trực tiếp từ trình duyệt, không cần cài thêm ứng dụng.

Bạn đang cần xây dựng hệ thống tương tự? Hãy xem dự án tại jobtest.vn hoặc liên hệ với mình để trao đổi.`,
  },
  {
    slug: "tich-hop-cong-thanh-toan-momo-zalopay-onepay",
    title: "Tích hợp MoMo, ZaloPay, OnePay: IPN, đối soát, hoàn tiền",
    excerpt:
      "Hướng dẫn tích hợp cổng thanh toán MoMo, ZaloPay, OnePay vào SaaS: giao diện checkout, xử lý IPN webhook bất đồng bộ, đối soát giao dịch và hoàn tiền.",
    body: `Tích hợp cổng thanh toán MoMo, ZaloPay và OnePay vào một nền tảng SaaS không chỉ là gắn nút "Thanh toán". Phần khó nằm ở những gì xảy ra sau khi khách bấm thanh toán: xác nhận giao dịch, xử lý IPN webhook, đối soát và hoàn tiền. Bài viết này tổng hợp kinh nghiệm mình đã triển khai ba cổng thanh toán chạy production, từ giao diện checkout đến xác nhận thanh toán.

## Luồng thanh toán tổng quát

Dù mỗi cổng có API riêng, luồng thanh toán trực tuyến đều giống nhau về nguyên tắc:

- Hệ thống tạo đơn hàng và yêu cầu thanh toán với cổng.
- Khách được chuyển sang ví hoặc trang thanh toán của cổng để xác nhận.
- Cổng gọi lại hệ thống (IPN, Instant Payment Notification) để báo kết quả, đồng thời trình duyệt khách được đưa về trang kết quả.

Điểm mấu chốt: kết quả cuối cùng phải dựa vào IPN từ máy chủ cổng thanh toán, không dựa vào việc khách quay lại trang kết quả.

## Giao diện checkout rõ ràng, ít ma sát

Checkout tốt cho phép khách chọn phương thức, thấy rõ số tiền và biết điều gì xảy ra tiếp theo. Cần chú ý trạng thái chờ xác nhận, lỗi thanh toán và trường hợp khách đóng trang giữa chừng. Mỗi trạng thái cần thông báo dễ hiểu và cách thử lại.

## Xử lý IPN webhook bất đồng bộ

IPN là phần quan trọng nhất về độ tin cậy. Các nguyên tắc nên áp dụng:

- Xác thực chữ ký của cổng thanh toán trước khi tin bất kỳ dữ liệu nào.
- Phản hồi nhanh cho cổng, còn xử lý nghiệp vụ nặng đưa vào hàng đợi (queue) để chạy bất đồng bộ.
- Xử lý idempotent: cùng một thông báo có thể đến nhiều lần, kết quả xử lý phải giống nhau và không cộng tiền hai lần.
- Ghi log đầy đủ mọi thông báo nhận được để truy vết khi có tranh chấp.

## Đối soát giao dịch

Đối soát là bước so khớp giao dịch trong hệ thống với báo cáo của cổng thanh toán để phát hiện chênh lệch: giao dịch thành công ở cổng nhưng chưa ghi nhận ở hệ thống, hoặc ngược lại. Làm đối soát đều đặn giúp bắt lỗi sớm và giữ số liệu doanh thu chính xác.

## Luồng hoàn tiền

Hoàn tiền cần được thiết kế như một luồng riêng với trạng thái rõ ràng: yêu cầu, đang xử lý, thành công hoặc thất bại. Mỗi lần hoàn tiền cần gắn với giao dịch gốc, giới hạn số tiền không vượt giao dịch gốc và ghi lại người thực hiện.

## Kết quả

Ba cổng thanh toán MoMo, ZaloPay và OnePay hiện chạy production trên nền tảng, với luồng checkout, IPN bất đồng bộ, đối soát và hoàn tiền đầy đủ. Công nghệ chính: Node.js, hàng đợi (queue) và API của từng cổng.

## Câu hỏi thường gặp

### IPN webhook là gì?

IPN (Instant Payment Notification) là thông báo mà cổng thanh toán gửi trực tiếp tới máy chủ của bạn khi giao dịch có kết quả. Đây là nguồn xác nhận đáng tin cậy nhất, hơn việc dựa vào trang khách được chuyển về.

### Vì sao cần xử lý IPN idempotent?

Cổng thanh toán có thể gửi lại cùng một thông báo khi chưa nhận được phản hồi. Nếu không xử lý idempotent, một giao dịch có thể bị ghi nhận hai lần.

Bạn cần tích hợp cổng thanh toán Việt Nam cho sản phẩm của mình? Hãy liên hệ để trao đổi chi tiết.`,
  },
  {
    slug: "migrate-vue-2-len-vue-3-nen-tang-hrm",
    title: "Migrate Vue 2 lên Vue 3 cho nền tảng HRM đa khách hàng",
    excerpt:
      "Checklist migrate Vue 2 lên Vue 3 cho ứng dụng lớn, rút ra từ việc nâng cấp toàn bộ nền tảng HRM đa khách hàng AIHR phục vụ hơn 6.000 nhân viên.",
    body: `Migrate Vue 2 lên Vue 3 cho một ứng dụng lớn là việc cần kế hoạch kỹ, nhất là khi sản phẩm đang phục vụ khách hàng thật mỗi ngày. Mình đã nâng cấp toàn bộ nền tảng AIHR, hệ thống HRM đa khách hàng phục vụ hơn 6.000 nhân viên doanh nghiệp, từ Vue 2 lên Vue 3. Dưới đây là checklist và những bài học rút ra.

## Vì sao cần migrate sang Vue 3

Vue 2 đã hết vòng đời hỗ trợ, nên các bản vá bảo mật và thư viện mới dần không còn dành cho nó. Vue 3 mang lại Composition API, hiệu năng tốt hơn, TypeScript tốt hơn và hệ sinh thái đang được phát triển tiếp. Với sản phẩm dài hạn, ở lại Vue 2 càng lâu thì chi phí migrate càng lớn.

## Đặc thù của nền tảng đa khách hàng

AIHR dùng một lõi dùng chung cho nhiều khách hàng, đồng thời tùy chỉnh sâu theo từng khách hàng. Điều này làm migrate khó hơn: ngoài code lõi còn phải kiểm tra từng biến thể theo khách hàng. Vì vậy cần danh mục các điểm tùy chỉnh và các luồng quan trọng của từng khách để kiểm thử sau mỗi bước.

## Checklist migrate Vue 2 lên Vue 3

- Kiểm kê thư viện: liệt kê toàn bộ thư viện UI và plugin, kiểm tra bản tương thích Vue 3 hoặc phương án thay thế.
- Quản lý state: chuyển từ Vuex sang Pinia để có API gọn hơn và hỗ trợ TypeScript tốt hơn.
- Thay đổi cú pháp và API: v-model, vòng đời component, event bus, filter đã bị loại bỏ và cần viết lại.
- Router: cập nhật lên phiên bản Vue Router dành cho Vue 3.
- Build tool: cân nhắc chuyển sang công cụ build hiện đại để thời gian build và hot reload nhanh hơn.
- Kiểm thử: chuẩn bị bộ kiểm thử cho các luồng quan trọng trước khi bắt đầu, vì đây là lưới an toàn của cả quá trình.

## Chiến lược chia nhỏ để giảm rủi ro

Thay vì đổi mọi thứ cùng lúc, hãy chia migrate thành các bước nhỏ có thể kiểm thử và triển khai độc lập: nâng cấp công cụ và thư viện nền trước, rồi đến từng module theo mức độ ưu tiên. Mỗi bước cần có tiêu chí hoàn thành rõ ràng và cách quay lui nếu có sự cố.

## Kết quả

Toàn bộ nền tảng chạy trên Vue 3, tiếp tục phục vụ hơn 6.000 nhân viên doanh nghiệp. Stack hiện tại gồm Vue.js 3, Node.js, NestJS, PostgreSQL, Redis và tích hợp AI (OpenAI, Gemini) cho các tác vụ nhân sự.

## Câu hỏi thường gặp

### Migrate Vue 2 lên Vue 3 mất bao lâu?

Thời gian phụ thuộc vào quy mô codebase, số thư viện phụ thuộc và độ phủ kiểm thử. Ứng dụng càng lớn thì càng nên chia nhỏ và làm dần thay vì làm một lần.

### Có nên dùng Pinia thay cho Vuex không?

Pinia là lựa chọn được khuyến nghị cho Vue 3: API đơn giản hơn, hỗ trợ TypeScript tốt hơn và ít khuôn mẫu hơn Vuex.

Cần tư vấn nâng cấp ứng dụng Vue của bạn? Hãy liên hệ để trao đổi.`,
  },
  {
    slug: "ung-dung-phong-van-thu-ai-nestjs-bullmq",
    title: "Xây ứng dụng phỏng vấn thử bằng AI với NestJS và BullMQ",
    excerpt:
      "Cách mình xây SaaS luyện phỏng vấn kỹ thuật: mock interview real-time bằng Socket.IO, AI chấm điểm bất đồng bộ với BullMQ, đổi được Gemini, OpenAI hoặc Ollama.",
    body: `Ứng dụng phỏng vấn thử bằng AI giúp lập trình viên luyện tập trả lời câu hỏi kỹ thuật và nhận phản hồi ngay. Mình tự xây AI Interview Prep, một SaaS luyện phỏng vấn kỹ thuật, bằng NestJS, Next.js, Socket.IO và BullMQ. Bài viết này chia sẻ các quyết định thiết kế chính.

## Ứng dụng làm gì

Người dùng tham gia buổi mock interview trực tiếp: hệ thống đưa ra câu hỏi, người dùng trả lời, AI chấm điểm và nhận xét. Câu hỏi được sinh từ mô hình AI, còn việc chấm điểm chạy nền để buổi phỏng vấn không bị gián đoạn.

## Phỏng vấn thời gian thực với Socket.IO

Buổi phỏng vấn cần cảm giác như một cuộc trò chuyện thật, nên mình dùng Socket.IO để truyền câu hỏi và câu trả lời theo thời gian thực. Socket.IO xử lý tự kết nối lại và các tình huống mạng không ổn định, giúp trải nghiệm liền mạch trên trình duyệt.

## Chấm điểm bất đồng bộ với BullMQ

Chấm điểm bằng AI mất vài giây tới hàng chục giây. Nếu chạy ngay trong luồng phỏng vấn, người dùng sẽ phải chờ. Giải pháp là đưa việc chấm điểm vào hàng đợi BullMQ chạy trên Redis:

- Buổi phỏng vấn tiếp tục mượt vì việc nặng chạy nền.
- Có thể thử lại tự động khi nhà cung cấp AI lỗi hoặc quá tải.
- Dễ mở rộng số worker khi lượng người dùng tăng.

## Lớp AI không phụ thuộc nhà cung cấp

Thay vì gắn chặt vào một dịch vụ, mình xây một lớp trừu tượng cho phép dùng Gemini, OpenAI hoặc Ollama chạy local, và đổi được theo từng người dùng. Lợi ích: không bị khóa vào một nhà cung cấp, có thể cân bằng giữa chi phí, chất lượng và quyền riêng tư (Ollama chạy nội bộ), và dễ thử nghiệm mô hình mới.

## Công nghệ sử dụng

NestJS, Next.js App Router với giao diện liquid-glass, TypeScript, PostgreSQL với Prisma, Redis, BullMQ, Socket.IO và Docker. Mã nguồn có trên GitHub: github.com/khang0708/interview-prep-platform.

## Câu hỏi thường gặp

### Vì sao nên dùng BullMQ cho tác vụ AI?

Các lời gọi AI chậm và có thể lỗi tạm thời. Hàng đợi giúp chạy chúng ở nền, thử lại khi lỗi và không làm chậm trải nghiệm chính của người dùng.

### Chạy mô hình AI local với Ollama có ích gì?

Dữ liệu không rời khỏi máy của bạn, không phát sinh chi phí theo lượt gọi và phù hợp khi cần kiểm soát quyền riêng tư, đổi lại cần phần cứng đủ mạnh.

Muốn xem mã nguồn hoặc trao đổi về việc tích hợp AI vào sản phẩm của bạn? Hãy liên hệ với mình.`,
  },
  {
    slug: "tich-hop-call-center-webrtc-vao-crm",
    title: "Tích hợp Call Center WebRTC vào CRM trên web và mobile",
    excerpt:
      "Kinh nghiệm xây Call Center thoại, video WebRTC trong CRM đa nền tảng: web React, app React Native lên App Store và Google Play, backend NestJS.",
    body: `Tích hợp Call Center WebRTC vào CRM giúp nhân viên gọi thoại và video cho khách hàng ngay trong trình duyệt hoặc ứng dụng di động, không cần phần mềm tổng đài riêng. Mình là thành viên cốt lõi của nhóm 5 người xây BoostCRM từ đầu, hệ thống CRM trên web và mobile với module Call Center, chatbot và quản lý khách hàng doanh nghiệp.

## BoostCRM gồm những gì

BoostCRM là CRM chạy trên web, iOS và Android, tích hợp Call Center thoại và video, chatbot và quản lý khách hàng doanh nghiệp. Toàn bộ hệ thống được xây từ đầu bởi nhóm 5 người, nên các quyết định kiến trúc ban đầu ảnh hưởng lớn tới tốc độ phát triển về sau.

## Vì sao chọn WebRTC cho Call Center

WebRTC cho phép gọi thoại và video thời gian thực trực tiếp trong trình duyệt và ứng dụng di động, với độ trễ thấp và không cần cài thêm phần mềm. Với CRM, lợi thế lớn là cuộc gọi nằm cùng giao diện với hồ sơ khách hàng: nhân viên vừa gọi vừa xem lịch sử và ghi chú.

## Một mã nguồn React cho web, React Native cho mobile

Giao diện web dùng React, ứng dụng di động dùng React Native và được phát hành lên cả Google Play và App Store. Dùng chung ngôn ngữ và nhiều mô hình tư duy giữa web và mobile giúp nhóm nhỏ làm được nhiều nền tảng hơn. Phần gọi thời gian thực trên mobile cần chú ý riêng tới quyền truy cập micro, camera và hành vi khi ứng dụng chạy nền.

## Backend NestJS và PostgreSQL

Phía máy chủ dùng NestJS để xây REST API và PostgreSQL để lưu dữ liệu khách hàng, lịch sử cuộc gọi và cấu hình. NestJS có cấu trúc module rõ ràng, phù hợp với nhóm nhiều người cùng làm một codebase.

## Kết quả

- CRM hoàn chỉnh trên web, iOS và Android.
- Call Center thoại và video thời gian thực bằng WebRTC.
- Ứng dụng React Native đã được phát hành lên Google Play và App Store.

## Câu hỏi thường gặp

### WebRTC có phù hợp làm Call Center không?

Có, nhất là khi muốn gọi ngay trong trình duyệt hoặc ứng dụng. Cần thêm máy chủ báo hiệu (signaling) và cân nhắc máy chủ trung chuyển cho các mạng khó kết nối trực tiếp.

### Nên dùng React Native hay viết app native riêng?

Nếu nhóm nhỏ và đã quen React, React Native giúp ra mắt cả iOS và Android nhanh với một codebase. Các tính năng phụ thuộc sâu vào phần cứng có thể cần module native bổ sung.

Cần xây CRM hoặc tích hợp gọi thoại, video vào sản phẩm? Hãy liên hệ để trao đổi.`,
  },
];

// Pictures live in public/blog: a cover per post (also the thumbnail) and one diagram placed before the second sub-heading.
const art: Record<string, { cover: string; diagram: string }> = {
  "he-thong-thi-truc-tuyen-chiu-tai-lon": {
    cover: "Hệ thống thi trực tuyến chịu tải 35.000 người dùng đồng thời",
    diagram: "Luồng xử lý bài nộp bằng hàng đợi trong hệ thống thi trực tuyến",
  },
  "tich-hop-cong-thanh-toan-momo-zalopay-onepay": {
    cover: "Tích hợp cổng thanh toán MoMo, ZaloPay, OnePay: IPN, đối soát, hoàn tiền",
    diagram: "Luồng thanh toán từ checkout đến IPN webhook, đối soát và hoàn tiền",
  },
  "migrate-vue-2-len-vue-3-nen-tang-hrm": {
    cover: "Migrate Vue 2 lên Vue 3 cho nền tảng HRM đa khách hàng",
    diagram: "Các bước migrate Vue 2 lên Vue 3 theo từng giai đoạn nhỏ",
  },
  "ung-dung-phong-van-thu-ai-nestjs-bullmq": {
    cover: "Ứng dụng phỏng vấn thử bằng AI với NestJS và BullMQ",
    diagram: "Kiến trúc ứng dụng phỏng vấn thử: Socket.IO, hàng đợi BullMQ và lớp AI",
  },
  "tich-hop-call-center-webrtc-vao-crm": {
    cover: "Tích hợp Call Center WebRTC vào CRM trên web và mobile",
    diagram: "Luồng cuộc gọi WebRTC giữa web, mobile và máy chủ báo hiệu trong CRM",
  },
};

export const blogSamples: Sample[] = raw.map((p) => {
  const a = art[p.slug];
  if (!a) return p;
  const parts = p.body.split("\n\n## ");
  // parts[0] is the intro; put the diagram after the first section, i.e. before the second "## " heading
  const at = Math.min(2, parts.length - 1);
  parts[at - 1] += `\n\n![${a.diagram}](/blog/${p.slug}-diagram.svg)`;
  return { ...p, body: parts.join("\n\n## "), cover: `/blog/${p.slug}-cover.svg`, coverAlt: a.cover };
});
