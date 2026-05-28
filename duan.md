# Tài Liệu Hướng Dẫn Thiết Lập Hệ Thống henxui.online

Tài liệu này ghi chú chi tiết cách thiết lập, cài đặt và vận hành hệ thống Web App vòng quay may mắn **henxui.online** trên nền tảng Serverless của **Cloudflare** (Cloudflare Pages + Workers + KV) với chi phí hoàn toàn miễn phí (0đ) và tốc độ tải trang cực kỳ nhanh.

---

## 1. Kiến Trúc Hệ Thống (Architecture Design)

Hệ thống được thiết kế theo mô hình **Jamstack tách biệt Frontend và Backend**:

```
[ Trình Duyệt / Client ]
      │
      ├─► (Yêu cầu trang tĩnh / URL rút gọn /abcd) ──► [ Cloudflare Pages ] (Phục vụ file HTML, JS, CSS)
      │
      └─► (Yêu cầu API chia sẻ) ──► [ Cloudflare Workers ] (Xử lý lưu trữ & tăng lượt dùng)
                                           │
                                           └─► [ Cloudflare KV (HENXUI_DB) ] (Lưu dữ liệu dạng Key-Value)
```

---

## 1.5 Tính Năng Nổi Bật Mới Được Cập Nhật (New Features)

1. **Chế Độ Nhiều Người Chơi (Multiplayer Mode):**
   * Cho phép **Bật/Tắt** nhanh chế độ nhiều người chơi thông qua nút ở góc dưới bên phải sơ đồ người chơi hoặc trong menu Cài Đặt.
   * Khi tắt: Hoàn toàn ẩn sơ đồ người chơi, ẩn lượt quay luân phiên, giúp giao diện trở nên tối giản hóa chỉ có vòng quay và hộp kết quả.
   * Khi bật: Hiển thị đầy đủ sơ đồ avatar động, vòng xoay luân phiên chỉ định người chơi tiếp theo và thống kê lượt quay kịch tính.

2. **Mã Rút Gọn Siêu Ngắn 4 Ký Tự (4-Character Short URL Code):**
   * Mỗi template Custom có một mã liên kết rút gọn ngẫu nhiên mặc định gồm **4 ký tự** (như `b3x8`) thay thế cho các ID dài dòng.
   * Bạn hoàn toàn có thể tự tay thay đổi mã rút gọn 4 ký tự này thành chuỗi mong muốn trong phần thiết lập Cài Đặt Chỉnh Sửa Vòng Quay.
   * Đường dẫn URL được tinh giản hoàn toàn từ định dạng cũ `/?t=abcd` sang định dạng đường dẫn trực tiếp cực kỳ chuyên nghiệp và dễ nhớ: **`henxui.online/abcd`** hoặc **`localhost:3000/abcd`**.
   * Hệ thống tự động đồng bộ hóa trực tiếp URL trên thanh địa chỉ của trình duyệt ngay khi bạn chuyển qua tab lượt quay mà không làm tải lại trang (Zero-reload URL sync).

3. **Mật Khẩu Bảo Vệ Khi Chỉnh Sửa (Edit Protection Password):**
   * Người tạo có thể đặt một mật khẩu tùy chọn để bảo mật cho vòng quay của mình khi chia sẻ.
   * **Mật khẩu ngẫu nhiên 5 số mặc định:** Nếu bạn bỏ trống mật khẩu khi lưu, hệ thống sẽ tự sinh ra một số ngẫu nhiên có 5 chữ số làm mật khẩu và lưu bảo mật thông tin này.
   * **Đồng bộ Cookie cùng Session:** Mật khẩu ngẫu nhiên này được lưu giữ tự động trong cookies của bạn. Khi bạn hoặc trình duyệt cùng một Session truy cập sửa đổi lại vòng quay đó, hệ thống sẽ tự động điền (autofill) mật khẩu này.
   * **Cảnh báo bảo vệ:** Đi kèm thông báo đề xuất chỉnh sửa: *"Hãy đặt lại mật khẩu để bảo vệ vòng quay của bạn"* giúp tối ưu độ an toàn cho dữ liệu.
   * Khi người khác tải vòng quay này lên thông qua URL rút gọn, họ có thể sử dụng bình thường, nhưng nếu muốn thay đổi nội dung ô vòng quay và nhấn nút **Chia sẻ**, hệ thống sẽ yêu cầu nhập đúng mật khẩu để ghi đè và cập nhật.
   * Vòng xoay có bảo mật sẽ được đánh dấu bằng trạng thái 🔒 rõ ràng trên giao diện nhập liệu.
   * **Hiển thị mật khẩu trực quan:** Ô nhập mật khẩu chỉnh sửa vòng quay đã được chuyển từ định dạng ẩn giấu (`type="password"`) sang dạng văn bản thuần (`type="text"`), hiển thị rõ ràng ký tự mật khẩu thực tế để người dùng dễ dàng theo dõi, chỉnh sửa chính xác và tiện lợi mà không lo bị ẩn/che giấu (`...`).

4. **Tích Hợp Logo Thương Hiệu Độc Quyền (Brand Logo Integration):**
   * Ứng dụng đã chính thức chuyển đổi và sử dụng **`henxui.svg`** làm biểu trưng thương hiệu chính thức thay thế các biểu tượng cảm xúc thô mộc cũ.
   * **Trải nghiệm xoay hoạt họa mượt mờ:** Logo trên thanh tiêu đề (Header/Navigation) được tích hợp hoạt ảnh xoay vô cực chuyển động chậm (`animate-[spin_24s_linear_infinite]`) đầy tinh tế, gợi liên tưởng trực diện đến vòng xoay may mắn.
   * **Bố cục Header tối giản:** Loại bỏ hoàn toàn mã phiên bản (version badge) rườm rà và nút bật tắt âm lượng (loa) phụ tại góc trên thanh tiêu đề, trả lại không gian thoáng đãng, sang trọng, tập trung hoàn toàn vào thương hiệu HenXui.
   * **Đồng bộ dấu ấn tín nhiệm:** Tích hợp logo thương hiệu cùng quốc huy Việt Nam 🇻🇳 tại phần thông tin bản quyền cuối trang, hoàn thiện phong cách thiết kế sang trọng, tối giản và đồng bộ chuẩn chuyên nghiệp.

5. **Nút Chia Sẻ Nhanh Đường Dẫn (Quick Web-URL Share Button):**
   * **Vị trí tinh tế:** Tích hợp một nút bấm **🔗 Chia sẻ** nhỏ gọn bên cạnh nút chuyển bật/tắt chế độ nhiều người chơi ở góc dưới cùng bên phải sân khấu chính.
   * **Sao chép URL tức thì:** Khi nhấn vào, hệ thống tự động copy đường dẫn đầy đủ của vòng quay hiện tại trên thanh địa chỉ vào Clipboard.
   * **Phản hồi hoạt họa:** Ngay tại vị trí nút bấm, hệ thống chuyển sang thông báo trạng thái thành công màu xanh lục nhẹ: **`✔️ Đã copy link!`** có hoạt ảnh nảy (`animate-bounce`). Sau thời gian chờ 3 giây, thông báo tự động ẩn đi và khôi phục lại nút bấm Chia sẻ ban đầu.
   * **Tối giản cài đặt:** Loại bỏ mục "Chia sẻ luật chơi bằng một cú chạm (Viral URL)" rườm rà, lặp lại trên thẻ Cài đặt (Settings), tích hợp tính năng lưu này trực tiếp vào bảng "Chỉnh sửa nội dung vòng quay" giúp giao diện cực kỳ gọn gàng và khoa học.

6. **Bảng Thông Tin SEO & Phản Hồi Cộng Đồng (SEO Info & User Feedback):**
   * **Nút liên kết thông tin tinh tế:** Tích hợp nút **`ℹ️ Thông tin`** nổi bật nằm khớp đẹp đẽ ngay bên cạnh hiển thị Lượt quay (Multiplayer) hoặc dòng khởi động xoay dưới bánh xe, tiếp cận dễ dàng ngay trên màn hình chính.
   * **Tối ưu hóa SEO đỉnh cao (Crawler-focused SEO):** Mở ra Bottom Sheet trượt mượt mà chứa thẻ tiêu đề chuẩn (`<h1>`) động tương thích theo chế độ quay hiện hành, mô tả hữu ích chi tiết, cũng như hàng loạt thẻ Tags phổ biến tự động (`#vongquaymayman`, `#henxui`, v.v.).
   * **Pre-rendering DOM ẩn:** Nội dung văn bản SEO, thẻ bài viết, và lượt nhận xét được cài đặt pre-render ẩn dưới khung DOM (`sr-only`), giúp các con bọ tìm kiếm (Googlebot, Bingbot...) thu thập và lập chỉ mục nội dung đầy đủ mà không làm ô nhiễm hay thay đổi cấu trúc URL gốc tuyệt đối.
   * **Bảng đánh giá thực tế tương tác cao:** Tích hợp khay nạp phản hồi thực tế từ cộng đồng người chơi khắp cả nước với số sao 5★, tên tuổi và nhận xét trực quan. Người dùng hoàn toàn có thể tự tay gửi đánh giá trải nghiệm thực tế của mình tức thì thông qua Form gửi nhận xét tiện lợi, cập nhật danh sách tại chỗ cực kỳ chuyên nghiệp.

---

## 2. Hướng Dẫn Thiết Lập Cloudflare Pages (Hosting Frontend)

Cloudflare Pages là nền tảng tối ưu nhất để hosting giao diện React/Vite tĩnh với khả năng CDN toàn cầu.

### Bước 1: Chuẩn bị mã nguồn
1. Đưa toàn bộ mã nguồn của bạn lên một repository **GitHub** hoặc **GitLab** (ở chế độ Private hoặc Public đều được).

### Bước 2: Tạo dự án Cloudflare Pages
1. Đăng nhập vào bảng điều khiển **Cloudflare**.
2. Di chuyển đến mục **Workers & Pages** -> chọn **Create application** -> Tab **Pages** -> Click **Connect to git**.
3. Chọn tài khoản GitHub của bạn và chọn repository đã chuẩn bị ở Bước 1.

### Bước 3: Cấu hình Build Settings
Cấu hình trình biên dịch của Cloudflare Pages giống như sau:
* **Framework preset**: `Vite` (hoặc chọn `None` và tự cấu hình)
* **Build command**: `npm run build`
* **Build output directory**: `dist`
* **Environment variables** (nếu có): Thêm `NODE_VERSION | 20` để đảm bảo tương thích Node.js mới nhất.

Sau đó bấm **Save and Deploy**. Cloudflare sẽ tự động đồng bộ hóa toàn bộ code mới mỗi khi bạn `git push`.

---

## 3. Hướng Dẫn Thiết Lập Cloudflare Workers & KV (API Chia Sẻ Luật Chơi)

Dùng để xử lý lưu giữ luật chơi được tùy biến từ các nhóm bạn và tính năng đếm lượt lưu sao chép (Copy Count).

### Bước 1: Tạo KV Namespace (Cơ sở dữ liệu)
1. Trên Cloudflare Dashboard, di chuyển đến mục **Workers & Pages** -> **KV**.
2. Click **Create namespace**. Đặt tên cho namespace này là: `HENXUI_DB`.
3. Ghi nhớ ID của bảng KV vừa được tạo để điền vào file cấu hình.

### Bước 2: Viết mã nguồn cho Cloudflare Worker
Tạo một thư mục mới cho Worker hoặc triển khai trực tiếp thông qua Cloudflare Dashboard. Đây là mã nguồn hoàn chỉnh của Worker sử dụng để lưu/tải template:

```javascript
// index.js (Mã nguồn Cloudflare Worker)
export default {
  async fetch(request, env, ctx) {
    // Xử lý Cấu hình CORS để cho phép Client từ nhiều tên miền truy cập an toàn
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 1. API: Lưu luật chơi (POST /api/templates)
      if (path === "/api/templates" && request.method === "POST") {
        const body = await request.json();
        if (!body.segments || !Array.isArray(body.segments)) {
          return new Response(JSON.stringify({ error: "Invalid layout parameters" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }

        // Xử lý mã rút gọn tùy chọn (customId) hoặc tự động tạo 4 ký tự ngẫu nhiên
        let id = (body.customId || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!id) {
          const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
          for (let i = 0; i < 4; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
          }
        }

        const dataToStore = {
          id: id,
          segments: body.segments,
          title: body.title || "Vòng quay tùy chỉnh",
          copies: 0,
          createdAt: new Date().toISOString()
        };

        // Lưu vào KV Store
        await env.HENXUI_DB.put(`template:${id}`, JSON.stringify(dataToStore));

        return new Response(JSON.stringify({ id: id }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      // 2. API: Lấy luật chơi và Đếm copy (GET /api/templates/:id)
      const getMatch = path.match(/^\/api\/templates\/([a-z0-9]+)$/);
      if (getMatch && request.method === "GET") {
        const id = getMatch[1];
        const rawData = await env.HENXUI_DB.get(`template:${id}`);

        if (!rawData) {
          return new Response(JSON.stringify({ error: "Không tìm thấy vòng quay này!" }), {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }

        const template = JSON.parse(rawData);
        
        // Tăng copy count tại KV
        template.copies = (template.copies || 0) + 1;
        await env.HENXUI_DB.put(`template:${id}`, JSON.stringify(template));

        return new Response(JSON.stringify(template), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }
};
```

### Bước 3: Cấu hình `wrangler.toml` để Deploy từ Máy tính
Nếu bạn dùng dòng lệnh CLI (`wrangler`), hãy tạo file `wrangler.toml` tại thư mục worker:

```toml
name = "henxui-api"
main = "index.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "HENXUI_DB"
id = "<ID_CỦA_KV_NAMESPACE_Ở_BƯỚC_1>"
```

Sau đó bấm chạy lệnh deploy:
```bash
npx wrangler deploy
```

---

## 4. Đồng Bộ Kết Nối Giữa Client Và Cloudflare API

Trong mã nguồn React ở phía Client (`/src/`), hệ thống được thiết lập lấy API Host linh động:

* Trong môi trường phát triển (Local development / Dev sever): Gọi trực tiếp tới cổng Express Server hiện tại `/api/templates`.
* Trong môi trường Production: Tự động đổi Endpoint gọi trực tiếp tới Cloudflare Worker đã deploy ở địa chỉ: `https://<ten-worker-cua-ban>.<subdomain>.workers.dev/api/templates`.

Dữ liệu của vòng quay, số người chơi hiện tại, chế độ âm thanh được lưu trữ tự động trong `localStorage` để chống mất dữ liệu khi người dùng vô tình F5/reload trình duyệt trên điện thoại.

---

Chúc bạn triển khai sản phẩm henxui.online thành công rực rỡ và thu hút hàng triệu game thủ tại các tụ điểm vui chơi giải trí!
