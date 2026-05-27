"use client";

import { useEffect } from "react";
import { CircleHelp } from "lucide-react";
import { driver, type DriveStep } from "driver.js";

const TOUR_STORAGE_KEY = "pati-handover-home-tour-seen-v1";
const START_HOME_TOUR_EVENT = "pati-handover:start-home-tour";

function getVisibleElement(selector: string) {
  const candidates = Array.from(document.querySelectorAll(selector));

  return (
    candidates.find((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);

      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden";
    }) ?? document.body
  );
}

function hasSeenTour() {
  try {
    return window.localStorage.getItem(TOUR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function markTourSeen() {
  try {
    window.localStorage.setItem(TOUR_STORAGE_KEY, "true");
  } catch {
    // Storage can be unavailable in private or locked-down browser contexts.
  }
}

function getHomeTourSteps(): DriveStep[] {
  return [
    {
      element: () => getVisibleElement('[data-tour="home-hero"]'),
      popover: {
        title: "Chọn đúng nơi bắt đầu",
        description:
          "Trang home là bản đồ nhanh để vào setup, deploy, troubleshooting và từng feature của pati-master-app.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: () => getVisibleElement('[data-tour="audience-mode-switch"]'),
      popover: {
        title: "Chọn mode đọc docs",
        description:
          "Nếu bạn là dev, click Dev để hiện command, schema, API route và ghi chú kỹ thuật. Nếu bạn là user/ops, giữ User để đọc bản ngắn gọn, ít code và dễ follow hơn.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: () => getVisibleElement('[data-tour="start-reading"]'),
      popover: {
        title: "Đọc từ overview",
        description:
          "Nút này đưa bạn vào luồng đọc từ đầu: hệ thống làm gì, ai dùng, và các phần liên kết với nhau như thế nào.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: () => getVisibleElement('[data-tour="quick-start"]'),
      popover: {
        title: "Cần setup nhanh thì vào đây",
        description:
          "Quick start gom các việc hay gặp nhất: cài local, kết nối Supabase, deploy lên Mac mini và xử lý lỗi.",
        side: "top",
        align: "start",
      },
    },
    {
      element: () => getVisibleElement('[data-tour="feature-catalog"]'),
      popover: {
        title: "Tìm theo feature khi cần debug",
        description:
          "Mỗi card là một màn hình hoặc luồng vận hành riêng. Khi có lỗi theo feature nào, mở đúng card đó trước.",
        side: "top",
        align: "start",
      },
    },
  ];
}

function createHomeTour() {
  return driver({
    animate: true,
    allowClose: true,
    allowKeyboardControl: true,
    disableActiveInteraction: false,
    doneBtnText: "Done",
    nextBtnText: "Next",
    overlayClickBehavior: "close",
    overlayColor: "#020617",
    overlayOpacity: 0.45,
    popoverClass: "pati-home-tour",
    popoverOffset: 12,
    prevBtnText: "Back",
    progressText: "{{current}}/{{total}}",
    showButtons: ["next", "previous", "close"],
    showProgress: true,
    smoothScroll: true,
    stagePadding: 8,
    stageRadius: 10,
    steps: getHomeTourSteps(),
    onDestroyed: markTourSeen,
  });
}

export function HomeGuideTour() {
  useEffect(() => {
    let guide: ReturnType<typeof driver> | null = null;
    let startTimer: number | null = null;

    const startTour = () => {
      if (startTimer !== null) {
        window.clearTimeout(startTimer);
        startTimer = null;
      }

      if (guide?.isActive()) {
        guide.destroy();
      }

      guide = createHomeTour();
      guide.drive();
    };

    window.addEventListener(START_HOME_TOUR_EVENT, startTour);

    if (!hasSeenTour()) {
      startTimer = window.setTimeout(startTour, 600);
    }

    return () => {
      window.removeEventListener(START_HOME_TOUR_EVENT, startTour);
      if (startTimer !== null) {
        window.clearTimeout(startTimer);
      }
      if (guide?.isActive()) {
        guide.destroy();
      }
    };
  }, []);

  return null;
}

export function HomeGuideTourButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(START_HOME_TOUR_EVENT))}
      className="inline-flex items-center gap-2 rounded-md border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
    >
      <CircleHelp className="h-4 w-4" />
      Guide tour
    </button>
  );
}
