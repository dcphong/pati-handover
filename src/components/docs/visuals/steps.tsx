import { ReactNode } from "react";
import { Check } from "lucide-react";
import { AiPromptButton } from "@/components/docs/ai-prompt-button";
import { detectIntegrations, IntegrationLogo } from "@/components/docs/integration-logo";
import { cn } from "@/lib/utils";

export type StepStatus = "todo" | "current" | "done";

export function Steps({ children }: { children: ReactNode }) {
  return (
    <div data-user-detail className="not-prose my-8 relative">
      <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" aria-hidden />
      <ol className="space-y-6">{children}</ol>
    </div>
  );
}

export function StepsHeader({
  id,
  title,
  prompt,
}: {
  id?: string;
  title: string;
  prompt?: string;
}) {
  return (
    <div className="mt-12 mb-4 flex items-center gap-3 border-b pb-2">
      <h2 id={id} className="m-0 flex-1 border-0 p-0 text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      {prompt && <AiPromptButton prompt={prompt} />}
    </div>
  );
}

export function Step({
  n,
  title,
  status = "todo",
  hint,
  aiPrompt,
  children,
}: {
  n: number;
  title: string;
  status?: StepStatus;
  hint?: string;
  aiPrompt?: string | null;
  children: ReactNode;
}) {
  const integrations = detectIntegrations(title, hint);
  const prompt = aiPrompt === undefined ? getStepAiPrompt(title, hint) : aiPrompt;

  return (
    <li className="relative pl-12">
      <div
        className={cn(
          "absolute left-0 top-0 grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-semibold tabular-nums",
          status === "done" &&
            "bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-400",
          status === "current" &&
            "bg-background border-foreground text-foreground shadow-sm ring-4 ring-foreground/5",
          status === "todo" && "bg-background border-border text-muted-foreground"
        )}
      >
        {status === "done" ? <Check className="h-4 w-4" /> : n}
      </div>
      <div className="min-h-[2.25rem]">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="flex items-center gap-1.5 text-base font-semibold tracking-tight">
            {integrations.map((integration) => (
              <IntegrationLogo key={integration} integration={integration} className="h-5 w-5" />
            ))}
            <span>{title}</span>
          </h3>
          {hint && (
            <span className="text-xs text-muted-foreground">{hint}</span>
          )}
          {prompt && <AiPromptButton prompt={prompt} className="ml-auto" />}
        </div>
        <div className="mt-2 space-y-3 text-[14px] leading-6 text-foreground/85">
          {children}
        </div>
      </div>
    </li>
  );
}

function getStepAiPrompt(title: string, hint?: string): string | null {
  const text = `${title} ${hint ?? ""}`.toLowerCase();
  const base =
    "Bạn là AI technical assistant đang hướng dẫn một user non-tech làm theo tài liệu PATI Handover. " +
    "Hãy hướng dẫn từng bước nhỏ, hỏi lại OS của tôi nếu cần, và chỉ đưa lệnh an toàn. " +
    "Không yêu cầu tôi paste token/password/secret/cookie thật vào chat; nếu cần secret thì ghi placeholder và nhắc tôi xin Phong.";

  if (text.includes("clone repo")) {
    return `${base}

Nhiệm vụ: giúp tôi clone repo PATI về máy local.

Thông tin:
- Repo: https://github.com/dev-pati/pati-master-app
- Folder gợi ý: ~/Coding hoặc C:\\Users\\<tên tôi>\\Coding_workspace\\PATI
- Sau khi clone cần vào folder pati-master-app và kiểm tra có src/, sync/, package.json.

Hãy hỏi tôi đang dùng Windows/macOS/Linux, sau đó đưa đúng command để:
1. Mở terminal ở folder tôi muốn để code.
2. Chạy git clone.
3. cd vào pati-master-app.
4. Verify folder/file cần có.
Nếu git báo permission denied hoặc repository not found, hãy giải thích tôi cần được add vào GitHub org/repo dev-pati.`;
  }

  if (text.includes("install dependencies") || text.includes("install requirements")) {
    return `${base}

Nhiệm vụ: giúp tôi install dependencies cho pati-master-app.

Ràng buộc quan trọng:
- Chỉ dùng Bun cho repo này, không dùng npm install hoặc yarn.
- Nếu lỡ chạy npm install, hướng dẫn tôi xóa node_modules rồi chạy lại bun install.
- Python deps nằm trong sync/requirements.txt.

Hãy đưa checklist theo thứ tự:
1. Kiểm tra bun --version, node --version, python --version.
2. Chạy bun install ở root repo.
3. Nếu là Python worker setup, kích hoạt đúng venv theo OS rồi chạy pip install -r sync/requirements.txt.
4. Verify node_modules và .venv-* tồn tại.
5. Nếu lỗi, bảo tôi paste error log không chứa secret.`;
  }

  if (text.includes(".env")) {
    return `${base}

Nhiệm vụ: giúp tôi tạo file .env cho pati-master-app local.

Luật bảo mật:
- Không bao giờ yêu cầu tôi paste giá trị thật của SHOPIFY_ACCESS_TOKEN, SUPABASE_SERVICE_KEY, JWT_SECRET, CRON_SECRET vào chat.
- Chỉ tạo template với placeholder.
- Nhắc tôi xin file .env thật từ Phong hoặc successor.

Hãy hướng dẫn:
1. Tạo file .env ở root repo.
2. Thêm các group: Shopify, Supabase, Lark, Auth, Sync.
3. Dùng placeholder rõ ràng cho secret.
4. Kiểm tra .env đã nằm trong .gitignore.
5. Chạy lệnh verify đơn giản mà không in secret ra terminal.`;
  }

  if (text.includes("dev server") || text.includes("bun run dev")) {
    return `${base}

Nhiệm vụ: giúp tôi chạy dev server của pati-master-app.

Thông tin:
- Lệnh mặc định: bun run dev
- URL local: http://localhost:3000
- Nếu cần test bulk fulfillment mới dùng bun run dev:full.

Hãy hướng dẫn:
1. Đảm bảo tôi đang ở root repo pati-master-app.
2. Chạy bun run dev.
3. Mở http://localhost:3000.
4. Nếu port 3000 bận, hướng dẫn tìm process hoặc dùng port khác.
5. Nếu page load nhưng số liệu trống/$0, hướng dẫn check Supabase tunnel bằng curl -I https://supabase.patiagency.com/rest/v1/ và chuyển sang troubleshooting nếu 502.`;
  }

  if (text.includes("đăng nhập") || text.includes("login")) {
    return `${base}

Nhiệm vụ: giúp tôi đăng nhập lần đầu vào PATI dashboard local.

Bối cảnh:
- App dùng JWT cookie auth.
- Tôi cần account do admin tạo hoặc password tạm từ Phong.
- Không yêu cầu tôi chia sẻ password thật trong chat.

Hãy hướng dẫn:
1. Mở local dashboard.
2. Đăng nhập bằng account được cấp.
3. Nếu cần tạo user mới, hướng dẫn tôi nhờ admin vào /iam tạo user và gán policy phù hợp.
4. Nếu login fail, đưa checklist kiểm tra .env, JWT_SECRET, cookie, network tab, và API /api/auth/verify.`;
  }

  if (text.includes("lint") || text.includes("typecheck")) {
    return `${base}

Nhiệm vụ: giúp tôi chạy lint/typecheck trước khi push.

Commands:
- bun run lint
- bun run typecheck

Hãy hướng dẫn:
1. Chạy từng command ở root repo.
2. Nếu có lỗi, giúp tôi đọc lỗi theo file/line.
3. Đề xuất fix nhỏ, không refactor lan rộng.
4. Sau khi sửa, chạy lại tới khi cả hai exit 0.`;
  }

  if (text.includes("export csv") || text.includes("lấy cost") || text.includes("payment request") || text.includes("kiểm tra output") || text.includes("nhập payment request")) {
    return `${base}

Nhiệm vụ: hỗ trợ tôi làm workflow CS & OF / Lark CSV / payment request.

Hãy làm như một ops assistant:
1. Hỏi tôi đã có file CSV/export từ Lark Base chưa.
2. Hướng dẫn tôi kiểm tra date range, duplicate, total cost, và các dòng bị flag.
3. Nếu tôi gửi dữ liệu bảng, hãy tạo output rõ ràng để paste vào payment request form.
4. Luôn yêu cầu tôi tự đối chiếu total cuối cùng với nguồn Lark/Base trước khi submit.
5. Không tự bịa số nếu thiếu dữ liệu; hãy chỉ rõ dòng nào cần kiểm tra lại.`;
  }

  if (text.includes("run import script") || text.includes("commit csv")) {
    return `${base}

Nhiệm vụ: giúp tôi import/update Best Fulfillment shipping rate CSV.

Thông tin:
- CSV path: docs/fulfillment/bestfulfill/BEST_SHIPPING_COST.csv
- Script: python scripts/import-best-shipping-rates.py --csv docs/fulfillment/bestfulfill/BEST_SHIPPING_COST.csv --shop-id e49d78-3.myshopify.com

Hãy hướng dẫn:
1. Kiểm tra file CSV tồn tại và đúng tên.
2. Chạy script import.
3. Đọc output parsed/upsert/errors.
4. Nếu 0 errors, hướng dẫn commit CSV để audit nếu cần.
5. Nếu có lỗi, giúp tôi xác định dòng CSV hoặc schema bị sai.`;
  }

  if (text.includes("commit") || text.includes("push") || text.includes("github actions") || text.includes("smoke check")) {
    return `${base}

Nhiệm vụ: giúp tôi deploy pati-master-app an toàn.

Hãy hướng dẫn theo checklist:
1. Kiểm tra git status và không deploy khi còn working tree bẩn ngoài ý muốn.
2. Chạy bun run lint và bun run build nếu cần.
3. Commit thay đổi với message rõ ràng.
4. Push lên main.
5. Theo dõi GitHub Actions deploy Mac mini.
6. Smoke check public URL và API health.
Nếu action fail, giúp tôi đọc log lỗi theo step.`;
  }

  if (text.includes("ssh") || text.includes("mac mini") || text.includes("cloudflared") || text.includes("tunnel") || text.includes("supabase docker") || text.includes("chrome")) {
    return `${base}

Nhiệm vụ: hướng dẫn tôi thao tác Mac mini / Cloudflared / Supabase self-host theo cách an toàn.

Ràng buộc:
- Không đưa lệnh xóa dữ liệu, reset DB, kill process hàng loạt, hoặc sửa secret nếu tôi chưa xác nhận.
- Không yêu cầu paste private key, token, cookie thật.
- Mỗi lệnh cần giải thích mục đích và expected output.

Hãy hỏi tôi đang cần làm việc nào: SSH, kiểm tra Colima/Docker, bật Supabase stack, restart Cloudflared tunnel, check web service, hay Chrome ChargeFlow.
Sau đó đưa từng command một, kèm cách verify và bước rollback an toàn.`;
  }

  if (text.includes("shopify") || text.includes("store") || text.includes("backfill")) {
    return `${base}

Nhiệm vụ: giúp tôi thao tác Shopify / multi-store trong pati-master-app.

Luật bảo mật:
- Không paste Shopify access token thật vào chat.
- Nếu cần token/env, dùng placeholder và nhắc tôi lưu trực tiếp trên máy/server.

Hãy hướng dẫn:
1. Xác định store domain myshopify.com và shop_id.
2. Nếu cần tạo Custom App, hướng dẫn thao tác trong Shopify Admin và scopes cần kiểm tra.
3. Nếu cần add store vào DB, đưa SQL mẫu với placeholder.
4. Nếu cần backfill, giải thích date window và cách tránh double-backfill.
5. Đưa checklist verify sau khi activate store.`;
  }

  return null;
}

export function StepCheck({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-emerald-500/30 bg-emerald-500/[0.05] px-3 py-2 text-[13px] leading-6 flex items-start gap-2">
      <Check className="h-3.5 w-3.5 mt-1 shrink-0 text-emerald-600 dark:text-emerald-400" />
      <div>
        <span className="font-medium text-emerald-700 dark:text-emerald-400">
          Bạn thấy được:
        </span>{" "}
        <span className="text-foreground/85">{children}</span>
      </div>
    </div>
  );
}

export function StepWarn({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-amber-500/40 bg-amber-500/[0.06] px-3 py-2 text-[13px] leading-6">
      {title && (
        <div className="font-medium text-amber-700 dark:text-amber-400 mb-0.5">
          {title}
        </div>
      )}
      <div className="text-foreground/85">{children}</div>
    </div>
  );
}
