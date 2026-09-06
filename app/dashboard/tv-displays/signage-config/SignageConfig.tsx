"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Palette, Settings, CheckCircle, XCircle, Loader, Trash2, Download, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import Link from "next/link";
import { Masjid } from "@prisma/client";
import { getMasjidById, getMasjidPlanForEditor } from "@/lib/actions/masjids";
import { canUseLayout, canUseTemplate, slideLimit } from "@/lib/plan";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomComponentLoader from "./CustomComponentLoader";
import dynamic from "next/dynamic";
import OpenAI from "openai";
import { getAllTVDisplays } from "@/lib/actions/tvdisplays";

const MonacoEditor = dynamic(() => import("react-monaco-editor"), { ssr: false });

export type SlideConfig = {
  id?: string;
  // "prayer" is the legacy alias for "prayerTimes"; the device renders both.
  type: "prayerTimes" | "prayer" | "announcements" | "custom" | "content" | "split";
  template: string;
  layout?: "full" | "l-shape" | "reverse-l-shape";
  theme?: {
    primary?: string;
    background?: string;
    text?: string;
    accent?: string;
    font?: string;
    [key: string]: string | undefined;
  };
  content?: Record<string, any>;
  contentId?: string;
  customComponentUrl?: string;
  splitConfig?: {
    left: Omit<SlideConfig, "splitConfig">;
    right: Omit<SlideConfig, "splitConfig">;
  };
};

export type ThemeConfig = {
  id?: string;
  name: string;
  description?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
    arabic: string;
  };
  spacing: {
    padding: string;
    margin: string;
    borderRadius: string;
  };
  effects: {
    shadow: string;
    opacity: number;
  };
};

const defaultThemes: ThemeConfig[] = [
  {
    name: "Classic Islamic",
    description: "Traditional Islamic design with gold and deep colors",
    colors: {
      primary: "#550C18",
      secondary: "#78001A",
      accent: "#a32624",
      background: "#FFFFFF",
      surface: "#2A2A2A",
      text: "#000000",
      textSecondary: "#666666",
      border: "#550C18",
    },
    fonts: {
      heading: "Philosopher",
      body: "Inter",
      arabic: "Noto Naskh Arabic",
    },
    spacing: {
      padding: "1.5rem",
      margin: "1rem",
      borderRadius: "0.5rem",
    },
    effects: {
      shadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      opacity: 0.9,
    },
  },
  {
    name: "Modern Clean",
    description: "Clean and modern design with subtle colors",
    colors: {
      primary: "#2563EB",
      secondary: "#1E40AF",
      accent: "#3B82F6",
      background: "#FFFFFF",
      surface: "#F8FAFC",
      text: "#1E293B",
      textSecondary: "#64748B",
      border: "#E2E8F0",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      arabic: "Noto Naskh Arabic",
    },
    spacing: {
      padding: "2rem",
      margin: "1.5rem",
      borderRadius: "1rem",
    },
    effects: {
      shadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
      opacity: 1,
    },
  },
  {
    name: "Warm Traditional",
    description: "Warm and inviting traditional design",
    colors: {
      primary: "#8B4513",
      secondary: "#A0522D",
      accent: "#CD853F",
      background: "#FDF6E3",
      surface: "#F5E6D3",
      text: "#2D1810",
      textSecondary: "#5D4037",
      border: "#8B4513",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Lora",
      arabic: "Noto Naskh Arabic",
    },
    spacing: {
      padding: "2rem",
      margin: "1rem",
      borderRadius: "0.75rem",
    },
    effects: {
      shadow: "0 6px 12px rgba(139, 69, 19, 0.15)",
      opacity: 0.95,
    },
  },
];

const slideTypes = [
  { value: "prayerTimes", label: "Prayer Times" },
  { value: "announcements", label: "Announcements" },
  { value: "custom", label: "Custom" },
];

const templates = [
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
];

const defaultTheme = {
  primary: "#550C18",
  background: "#fff",
  text: "#222",
  accent: "#78001A",
  font: "Philosopher",
};

function SlidePreview({
  slide,
  masjid,
  currentTheme,
  allSlides,
  cacheKey,
}: {
  slide: SlideConfig;
  // Narrowed selection from getMasjidById, not the full Masjid row.
  masjid: Awaited<ReturnType<typeof getMasjidById>>;
  currentTheme?: ThemeConfig;
  allSlides: SlideConfig[];
  cacheKey?: string | number;
}) {
  // Get theme from slide or use default
  const theme = slide.theme || defaultTheme;
  
  const flatCurrentTheme = currentTheme ? {
    primary: currentTheme.colors.primary,
    background: currentTheme.colors.background,
    text: currentTheme.colors.text,
    accent: currentTheme.colors.accent,
    font: currentTheme.fonts.heading,
    fontHeading: currentTheme.fonts.heading,
    fontBody: currentTheme.fonts.body,
    fontArabic: currentTheme.fonts.arabic,
  } : theme;

  const renderSlideContent = (
    slideData: SlideConfig,
    isSplitScreen = false
  ) => {
    const isPrayerType = slideData.type === "prayerTimes" || slideData.type === "prayer";
    const containerClasses = cn(
      "rounded-2xl overflow-hidden flex flex-col",
      isPrayerType ? "" : "items-center justify-center border",
      isSplitScreen ? "h-full" : "min-h-[200px]"
    );

    const slideTheme =
      slideData.type === "prayerTimes" ? flatCurrentTheme : (slideData.theme || theme);

    return (
      <div
        className={containerClasses}
        style={isPrayerType ? {} : {
          background: slideTheme.background || defaultTheme.background,
          color: slideTheme.primary || defaultTheme.primary,
          fontFamily: (slideTheme as any).fontBody || slideTheme.font || defaultTheme.font,
        }}
      >
        {(slideData.type === "prayerTimes" || slideData.type === "prayer") && (() => {
          const tpl = slideData.template || 'classic';
          const prayers = [
            { name: 'FAJR',    adhan: '5:12 AM',  iqamah: '5:25 AM' },
            { name: 'DHUHR',   adhan: '1:18 PM',  iqamah: '1:30 PM' },
            { name: 'ASR',     adhan: '4:45 PM',  iqamah: '5:00 PM' },
            { name: 'MAGHRIB', adhan: '7:52 PM',  iqamah: '7:55 PM' },
            { name: 'ISHA',    adhan: '9:20 PM',  iqamah: '9:35 PM' },
          ];

          if (tpl === 'geometric') {
            // Navy + gold star tile
            const starSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><polygon points='14,1.5 15.8,10.2 24,8 18,15.5 24,23 15.8,20.8 14,29.5 12.2,20.8 4,23 10,15.5 4,8 12.2,10.2' fill='none' stroke='rgba(201,168,64,0.18)' stroke-width='0.7'/></svg>`;
            const starUrl = `url("data:image/svg+xml,${encodeURIComponent(starSvg)}")`;
            return (
              <div style={{ width: '100%', height: '100%', minHeight: 200, backgroundColor: '#0b1825', backgroundImage: starUrl, backgroundRepeat: 'repeat', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <div style={{ borderTop: '1px solid rgba(201,168,64,0.3)', position: 'absolute', top: 0, left: 0, right: 0 }} />
                {/* Header */}
                <div style={{ textAlign: 'center', padding: '8px 0 4px', borderBottom: '1px solid rgba(201,168,64,0.15)' }}>
                  <div style={{ fontSize: 10, color: 'rgba(201,168,64,0.5)', letterSpacing: 3, fontWeight: 800 }}>PRAYER TIMES</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#e8dcc8', letterSpacing: 1 }}>12:34 PM</div>
                  <div style={{ fontSize: 9, color: 'rgba(201,168,64,0.45)', letterSpacing: 1 }}>1 Rabi al-Awwal 1447</div>
                </div>
                {/* Prayers */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, padding: '4px 6px' }}>
                  {prayers.map((p, i) => (
                    <div key={p.name} style={{ display: 'flex', alignItems: 'center', backgroundColor: i === 1 ? 'rgba(201,168,64,0.12)' : 'transparent', borderRadius: 3, padding: '2px 6px', borderLeft: i === 1 ? '2px solid #c9a840' : '2px solid transparent' }}>
                      <span style={{ flex: 1, fontSize: 8, color: i === 1 ? '#c9a840' : 'rgba(201,168,64,0.5)', letterSpacing: 1.5, fontWeight: 800 }}>{p.name}</span>
                      <span style={{ fontSize: 10, color: '#e8dcc8', fontWeight: 700, marginRight: 8 }}>{p.adhan}</span>
                      <span style={{ fontSize: 11, color: i === 1 ? '#c9a840' : '#e8dcc8', fontWeight: 900 }}>{p.iqamah}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (tpl === 'mihrab') {
            // Burgundy + cream, arch header
            const archSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 50'><path d='M0,50 L0,35 Q150,0 300,35 L300,50 Z' fill='none' stroke='rgba(212,168,67,0.3)' stroke-width='1'/><path d='M120,50 L120,32 Q150,18 180,32 L180,50' fill='none' stroke='rgba(212,168,67,0.4)' stroke-width='0.8'/><line x1='0' y1='1' x2='300' y2='1' stroke='rgba(212,168,67,0.25)' stroke-width='1'/></svg>`;
            const archUrl = `url("data:image/svg+xml,${encodeURIComponent(archSvg)}")`;
            return (
              <div style={{ width: '100%', height: '100%', minHeight: 200, backgroundColor: '#1c0508', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* Arch header */}
                <div style={{ height: 50, backgroundImage: archUrl, backgroundRepeat: 'no-repeat', backgroundSize: '100% 50px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(212,168,67,0.2)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: 'rgba(212,168,67,0.5)', letterSpacing: 3, fontWeight: 800 }}>PRAYER TIMES</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#f2e8d5' }}>12:34 PM</div>
                  </div>
                </div>
                {/* Prayers */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 8px' }}>
                  {prayers.map((p, i) => (
                    <div key={p.name} style={{ display: 'flex', alignItems: 'center', backgroundColor: i === 1 ? 'rgba(212,168,67,0.1)' : 'transparent', borderRadius: 3, padding: '2px 6px', borderLeft: i === 1 ? '2px solid #d4a843' : '2px solid transparent' }}>
                      <span style={{ flex: 1, fontSize: 8, color: i === 1 ? '#d4a843' : 'rgba(212,168,67,0.4)', letterSpacing: 1.5, fontWeight: 800 }}>{p.name}</span>
                      <span style={{ fontSize: 10, color: '#f2e8d5', fontWeight: 700, marginRight: 8 }}>{p.adhan}</span>
                      <span style={{ fontSize: 11, color: i === 1 ? '#d4a843' : '#f2e8d5', fontWeight: 900 }}>{p.iqamah}</span>
                    </div>
                  ))}
                </div>
                {/* Side dot accents */}
                <div style={{ position: 'absolute', top: 0, left: 2, bottom: 0, width: 3, backgroundImage: 'radial-gradient(circle, rgba(212,168,67,0.4) 1px, transparent 1px)', backgroundSize: '3px 6px' }} />
                <div style={{ position: 'absolute', top: 0, right: 2, bottom: 0, width: 3, backgroundImage: 'radial-gradient(circle, rgba(212,168,67,0.4) 1px, transparent 1px)', backgroundSize: '3px 6px' }} />
              </div>
            );
          }

          // Classic
          const primary = slideTheme.primary || '#550C18';
          const bg = slideTheme.background || '#ffffff';
          return (
            <div style={{ width: '100%', height: '100%', minHeight: 200, backgroundColor: bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Header bar */}
              <div style={{ backgroundColor: primary, padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, fontWeight: 700 }}>PRAYER TIMES</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#ffffff' }}>12:34 PM</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.55)' }}>1 Rabi al-Awwal 1447</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)' }}>Next: Asr at 5:00 PM</div>
                </div>
              </div>
              {/* Prayer rows */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {prayers.map((p, i) => (
                  <div key={p.name} style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 10px', backgroundColor: i === 2 ? `${primary}12` : 'transparent', borderBottom: '1px solid rgba(0,0,0,0.05)', borderLeft: i === 2 ? `3px solid ${primary}` : '3px solid transparent' }}>
                    <span style={{ flex: 1, fontSize: 9, color: i === 2 ? primary : '#6b7280', letterSpacing: 1.5, fontWeight: 800 }}>{p.name}</span>
                    <span style={{ fontSize: 10, color: '#374151', fontWeight: 600, marginRight: 10 }}>{p.adhan}</span>
                    <span style={{ fontSize: 11, color: i === 2 ? primary : '#374151', fontWeight: 900 }}>{p.iqamah}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
        {slideData.type === "announcements" && (
          <div className="text-center p-4 min-h-[350px] flex flex-col justify-center">
            <div className="text-lg font-bold mb-2" style={{fontFamily: (slideTheme as any).fontHeading || slideTheme.font }}>
              {slideData.content?.title}
            </div>
            <div className="text-sm opacity-70">
              <div
                dangerouslySetInnerHTML={{ __html: slideData.content?.content }}
              />
            </div>
          </div>
        )}
        {slideData.type === "custom" && (
          <>
            {slideData.customComponentUrl ? (
              <div className="min-h-[400px] min-w-[400px] h-full flex flex-col flex-1">
                <CustomComponentLoader
                  url={slideData.customComponentUrl}
                  componentProps={{ masjid, slides: allSlides, theme: currentTheme, slide: slideData }}
                  cacheKey={cacheKey}
                />
              </div>
            ) : (
              <div className="text-center p-4">
                <div className="text-lg font-bold mb-2" style={{fontFamily: (slideTheme as any).fontHeading || slideTheme.font }}>
                  {slideData.content?.title || "Custom Slide"}
                </div>
                <div className="text-base opacity-70">
                  {slideData.content?.subtitle || "(Preview)"}
                </div>
              </div>
            )}
          </>
        )}
        {slideData.type === "content" && slideData.content && (
          <div
            className={cn(
              "relative flex flex-col items-center justify-center flex-1 rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden w-full h-full",
              !isSplitScreen ? "min-h-[350px]" : "max-h-[350px]"
            )}
            style={{
              backgroundColor: slideTheme.background || "#FFFFFF",
              color: slideTheme.primary || "#550C18",
              fontFamily: (slideTheme as any).fontBody || slideTheme.font || "Philosopher",
            }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-35">
              <div className="absolute inset-0 bg-[url('https://img.freepik.com/premium-vector/seamless-pattern-authentic-arabian-illustration-style_151170-679.jpg?semt=ais_hybrid&w=740')] bg-repeat opacity-20" />
            </div>

            {/* Top center logo */}
            <div className="mt-4">
              <Image
                src={masjid?.logo || "/mizan.svg"}
                width={35}
                height={35}
                alt="Masjid Logo"
                className="opacity-80"
              />
            </div>

            {/* Main content */}
            <div className="flex flex-col items-center justify-center text-center z-10 p-4">
              {slideData.content.type === "eid_countdown" ? (
                <>
                  <span
                    className="text-[65px] font-bold leading-none"
                    style={{ color: slideTheme.primary || "#550C18", fontFamily: (slideTheme as any).fontHeading || slideTheme.font }}
                  >
                    {Math.floor(
                      (new Date(slideData.content.endDate as any).getTime() -
                        new Date(
                          slideData.content.startDate as any
                        ).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}
                  </span>
                  <span
                    className="text-lg tracking-wider mt-2"
                    style={{ color: slideTheme.text || "#666666" }}
                  >
                    LEFT UNTIL
                  </span>
                  <div className="relative mb-4">
                    <span
                      className="text-3xl font-bold mt-1 tracking-wide"
                      style={{ color: slideTheme.primary || "#550C18", fontFamily: (slideTheme as any).fontHeading || slideTheme.font }}
                    >
                      {slideData.content?.title?.toUpperCase()}
                    </span>
                    <div
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 rounded-full"
                      style={{
                        backgroundColor: `${slideTheme.primary || "#550C18"}20`,
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  {slideData.content.title && (
                    <h3 className="text-xl font-bold mb-2" style={{fontFamily: (slideTheme as any).fontHeading || slideTheme.font}}>{slideData.content.title}</h3>
                  )}
                  {slideData.content.content && (
                    <div
                      className="text-base opacity-80"
                      dangerouslySetInnerHTML={{
                        __html: slideData.content.content,
                      }}
                    />
                  )}
                </>
              )}
            </div>

            {/* Bottom right logo */}
            <div className="absolute bottom-4 right-4">
              <Image
                src="/mizan.svg"
                width={20}
                height={20}
                alt="Mizan Logo"
                className="opacity-60"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  if (slide.type === "split") {
    return (
      <div
        className="grid h-[250px]"
        style={{
          gridTemplateColumns: "250px 1fr",
          gridTemplateRows: "1fr 120px",
          gap: "4px",
        }}
      >
        {/* Left prayer times panel */}
        <div className="row-span-2 rounded-l-lg h-full overflow-hidden">
          {renderSlideContent(
            {
              type: "prayerTimes",
              template: slide.template || 'classic',
              theme: flatCurrentTheme,
            },
            true
          )}
        </div>

        {/* Top right content */}
        <div className="bg-white rounded-tr-lg h-full">
          {slide.splitConfig &&
            renderSlideContent(slide.splitConfig.left, true)}
        </div>

        {/* Bottom right prayer times */}
        <div className="bg-[#1a1f2e] rounded-br-lg h-full">
          {slide.splitConfig &&
            renderSlideContent(slide.splitConfig.right, true)}
        </div>
      </div>
    );
  }

  // Handle layout from content settings
  if (slide.layout && slide.layout !== "full") {
    if (slide.layout === "l-shape") {
      return (
        <div
          className="grid h-full"
          style={{
            gridTemplateColumns: "250px 1fr",
            gridTemplateRows: "1fr 120px",
            gap: "4px",
          }}
        >
          {/* Left prayer times panel */}
          <div className="row-span-2">
            {renderSlideContent(
              {
                type: "prayerTimes",
                template: slide.template || 'classic',
                theme: flatCurrentTheme,
              },
              true
            )}
          </div>

          {/* Top right content */}
          <div className="bg-white rounded-tr-lg">
            {renderSlideContent(slide, true)}
          </div>

          {/* Bottom right prayer times */}
          <div>
            {renderSlideContent(
              {
                type: "prayerTimes",
                template: slide.template || 'classic',
                theme: flatCurrentTheme,
              },
              true
            )}
          </div>
        </div>
      );
    } else if (slide.layout === "reverse-l-shape") {
      return (
        <div
          className="grid h-full"
          style={{
            gridTemplateColumns: "1fr 250px",
            gridTemplateRows: "1fr 120px",
            gap: "4px",
          }}
        >
          {/* Top left content */}
          <div className="bg-white rounded-tl-lg">
            {renderSlideContent(slide, true)}
          </div>

          {/* Right prayer times panel */}
          <div className="row-span-2">
            {renderSlideContent(
              {
                type: "prayerTimes",
                template: slide.template || 'classic',
                theme: flatCurrentTheme,
              },
              true
            )}
          </div>

          {/* Bottom left prayer times */}
          <div>
            {renderSlideContent(
              {
                type: "prayerTimes",
                template: slide.template || 'classic',
                theme: flatCurrentTheme,
              },
              true
            )}
          </div>
        </div>
      );
    }
  }

  return renderSlideContent(slide);
}

function SortableSlide({
  id,
  children,
  selected,
  onClick,
}: {
  id: string;
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    cursor: "grab",
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function ContentLibraryModal({
  open,
  onClose,
  onSelect,
  masjidId,
  items,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (item: any) => void;
  masjidId: string;
  items: any[];
}) {
  const [loading, setLoading] = useState(false);
  if(!items) return;

//   useEffect(() => {
//     if (!open) return;
//     setLoading(true);
//     fetch(`/api/masjids/${masjidId}/content`)
//       .then((res) => res.json())
//       .then((data) => {
//         const contentItems = (data.content || []).map((item: any) => ({
//           ...item,
//           source: "content",
//         }));
//         const announcementItems = (data.announcements || []).map(
//           (item: any) => ({ ...item, source: "announcement" })
//         );
//         setItems([...contentItems, ...announcementItems]);
//       })
//       .finally(() => setLoading(false));
//   }, [open, masjidId]);
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Content or Announcement</DialogTitle>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div>Loading...</div>
          ) : items.length === 0 ? (
            <div>No content or announcements found.</div>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="py-2 cursor-pointer hover:bg-[#550C18]/10 px-2 rounded border border-[#550C18]/20"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-xs text-[#3A3A3A]/70">
                    {item.source === "announcement"
                      ? "Announcement"
                      : item.type}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="px-4 py-2 rounded bg-gray-200">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CustomSlideModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isSafe: boolean; feedback: string } | null>(null);
  const [openai, setOpenai] = useState<OpenAI | null>(null);
  const [editor, setEditor] = useState<any | null>(null);
  const decorations = useRef<string[]>([]);
  const monacoRef = useRef<any>(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        setOpenai(new OpenAI({
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
            dangerouslyAllowBrowser: true 
        }));
    }
  }, []);

  const handleEditorDidMount = (editorInstance: any, monaco: any) => {
    setEditor(editorInstance);
    monacoRef.current = monaco;
  };

  const getRawContentUrl = (githubUrl: string) => {
    try {
        const urlObj = new URL(githubUrl);
        if (urlObj.hostname === 'github.com') {
            const path = urlObj.pathname.replace('/blob/', '/');
            return `https://raw.githubusercontent.com${path}`;
        }
        return githubUrl;
    } catch (e) {
        return '';
    }
  };

  const handleFetchCode = async () => {
    if (!url) return;
    setIsLoadingCode(true);
    setValidationResult(null);
    setCode(null);
    try {
      const rawUrl = getRawContentUrl(url);
      const response = await fetch(rawUrl, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error('Failed to fetch code from URL.');
      }
      const text = await response.text();
      setCode(text);
    } catch (error) {
      setCode('// Failed to fetch code.');
    } finally {
      setIsLoadingCode(false);
    }
  };

  const handleValidateCode = async () => {
    if (!code) return;
    if (!openai) {
        setValidationResult({ isSafe: false, feedback: 'OpenAI API key is not configured on the client. Please set NEXT_PUBLIC_OPENAI_API_KEY in your .env.local file.' });
        return;
    }

    setIsValidating(true);
    setValidationResult(null);
    if (editor) {
        decorations.current = editor.deltaDecorations(decorations.current, []);
    }

    const lines = code.split('\n').length;
    let currentLine = 1;

    const interval = setInterval(() => {
        if (editor && monacoRef.current && currentLine <= lines) {
            // Scroll the editor to keep the current line in view
            editor.revealLineInCenter(currentLine);
            
            decorations.current = editor.deltaDecorations(
                decorations.current,
                [{
                    range: new monacoRef.current.Range(currentLine, 1, currentLine, 1),
                    options: { 
                        isWholeLine: true, 
                        className: 'line-validation-highlight',
                        backgroundColor: '#550C18',
                        borderColor: '#550C18',
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        color: '#fff'
                    }
                }]
            );
            currentLine++;
        } else {
            clearInterval(interval);
        }
    }, 10);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a code analysis expert specializing in React and TypeScript. Your task is to analyze the provided React component code for security vulnerabilities, malicious intent, major bugs, or any code that could compromise a digital signage application. The component will be dynamically loaded and rendered. The code must have a default export. You must respond with a JSON object with two keys: "isSafe" (boolean) and "feedback" (string). - "isSafe" should be true if the code is safe to execute, and false otherwise. - "feedback" should provide a concise summary of your findings. If the code is safe, say so. If there are issues, explain them clearly. Do not include any other text in your response, only the JSON object.`
          },
          { role: 'user', content: code },
        ],
        response_format: { type: 'json_object' },
      });
      
      const result = completion.choices[0].message?.content;
      if (!result) throw new Error('Failed to get a valid response from AI');
      
      const parsedResult = JSON.parse(result);
      setValidationResult(parsedResult);

    } catch (error: any) {
      setValidationResult({ isSafe: false, feedback: error.message });
    } finally {
      setIsValidating(false);
      clearInterval(interval);
      if (editor) {
          setTimeout(() => {
            decorations.current = editor.deltaDecorations(decorations.current, []);
          }, 1000);
      }
    }
  };

  const handleAdd = () => {
    if (validationResult?.isSafe) {
      onSubmit(url);
      onClose();
    }
  };

  useEffect(() => {
    if (!open) {
        setUrl('');
        setCode(null);
        setIsLoadingCode(false);
        setIsValidating(false);
        setValidationResult(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Custom Slide from GitHub</DialogTitle>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>Paste a link to a public GitHub file that contains a React component.</p>
            <a
              href="/ExampleCustomComponent.tsx"
              download="ExampleCustomComponent.tsx"
              className="flex items-center gap-1 text-[#550C18] hover:underline"
            >
              <Download className="w-4 h-4" />
              Download Template
            </a>
          </div>
        </DialogHeader>
        <div className="flex gap-2 items-center">
            <Input
              placeholder="Paste GitHub Component URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button onClick={handleFetchCode} disabled={isLoadingCode || !url}>
                {isLoadingCode ? <Loader className="animate-spin w-4 h-4 mr-2" /> : null}
                {isLoadingCode ? 'Fetching...' : 'Fetch Code'}
            </Button>
        </div>

        {code && (
            <div className="mt-4 space-y-4">
                <Label>Component Code</Label>
                <div className="border rounded-md overflow-hidden">
                    <MonacoEditor
                        height="300"
                        language="typescript"
                        theme="vs"
                        className="bg-white"
                        value={code}
                        editorDidMount={handleEditorDidMount}
                        options={{
                            readOnly: true,
                            domReadOnly: true,
                            minimap: { enabled: false }
                        }}
                    />
                </div>
                <Button onClick={handleValidateCode} disabled={isValidating || !code}>
                    {isValidating ? <Loader className="animate-spin w-4 h-4 mr-2" /> : null}
                    {isValidating ? 'Validating...' : 'Validate with AI'}
                </Button>
            </div>
        )}

        {validationResult && (
            <div className={`mt-4 p-4 rounded-md flex items-start gap-3 ${validationResult.isSafe ? 'bg-green-100 border-green-400 text-green-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
                {validationResult.isSafe ? <CheckCircle className="w-6 h-6 mt-0.5" /> : <XCircle className="w-6 h-6 mt-0.5" />}
                <div>
                  <h4 className="font-bold text-lg">{validationResult.isSafe ? 'Validation Successful' : 'Validation Failed'}</h4>
                  <p className="text-sm">{validationResult.feedback}</p>
                </div>
            </div>
        )}

        <DialogFooter>
          <Button
            variant="default"
            className="px-4 py-2 rounded bg-[#550C18] text-white"
            onClick={handleAdd}
            disabled={!validationResult?.isSafe}
          >
            Add Slide
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="px-4 py-2 rounded bg-gray-200">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SplitScreenModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (split: { left: SlideConfig; right: SlideConfig }) => void;
}) {
  // For brevity, just stub UI
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Split Screen</DialogTitle>
        </DialogHeader>
        <div>Split screen config UI goes here.</div>
        <DialogFooter>
          <Button
            variant="default"
            className="px-4 py-2 rounded bg-[#550C18] text-white"
            onClick={() => {
              onSubmit({
                left: { type: "prayerTimes", template: "modern" },
                right: { type: "announcements", template: "modern" },
              });
              onClose();
            }}
          >
            Add
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="px-4 py-2 rounded bg-gray-200">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Preview component for theme cards
const ThemePreview = ({ theme }: { theme: ThemeConfig }) => (
  <div
    className="h-32 rounded-lg mb-3 p-4 flex flex-col justify-between"
    style={{
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      fontFamily: theme.fonts.heading,
      boxShadow: theme.effects.shadow,
      border: `1px solid ${theme.colors.border}`,
    }}
  >
    <div className="text-lg" style={{ fontFamily: theme.fonts.heading }}>
      Sample Text
    </div>
    <div style={{ fontFamily: theme.fonts.body }}>
      <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
        Secondary Text
      </div>
      <div className="flex gap-2 mt-2">
        <div
          className="px-2 py-1 text-xs rounded"
          style={{ backgroundColor: theme.colors.primary, color: "#fff" }}
        >
          Primary
        </div>
        <div
          className="px-2 py-1 text-xs rounded"
          style={{
            backgroundColor: theme.colors.accent,
            color: theme.colors.text,
          }}
        >
          Accent
        </div>
      </div>
    </div>
  </div>
);

function ThemeManagementModal({
  open,
  onClose,
  masjidId,
  onThemeSelect,
}: {
  open: boolean;
  onClose: () => void;
  masjidId: string;
  onThemeSelect: (theme: ThemeConfig) => void;
}) {
  const [themes, setThemes] = useState<ThemeConfig[]>(defaultThemes);
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTheme, setNewTheme] = useState<Partial<ThemeConfig>>({
    name: "",
    description: "",
    colors: defaultThemes[0].colors,
    fonts: defaultThemes[0].fonts,
    spacing: defaultThemes[0].spacing,
    effects: defaultThemes[0].effects,
  });

  useEffect(() => {
    if (open) {
      fetch(`/api/masjids/${masjidId}/themes`)
        .then((res) => res.json())
        .then((data) => {
          setThemes([...defaultThemes, ...data]);
        })
        .catch(() => {
          setThemes(defaultThemes);
        });
    }
  }, [open, masjidId]);

  const handleCreateTheme = async () => {
    try {
      const response = await fetch(`/api/masjids/${masjidId}/themes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTheme),
      });
      const createdTheme = await response.json();
      setThemes([...themes, createdTheme]);
      setShowCreateModal(false);
      setNewTheme({
        name: "",
        description: "",
        colors: defaultThemes[0].colors,
        fonts: defaultThemes[0].fonts,
        spacing: defaultThemes[0].spacing,
        effects: defaultThemes[0].effects,
      });
    } catch (error) {
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#550C18]">
            Theme Gallery
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Select a theme to customize the appearance of your slides
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {themes.map((theme, index) => (
            <div
              key={index}
              className={cn(
                "border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg",
                selectedTheme?.name === theme.name
                  ? "ring-2 ring-[#550C18] shadow-lg"
                  : "hover:border-[#550C18]"
              )}
              onClick={() => setSelectedTheme(theme)}
            >
              <ThemePreview theme={theme} />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#550C18] text-lg">
                    {theme.name}
                  </h3>
                  <div className="flex gap-1">
                    {Object.entries(theme.colors)
                      .slice(0, 4)
                      .map(([key, color], i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border shadow-sm"
                          style={{ backgroundColor: color }}
                          title={key}
                        />
                      ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {theme.description}
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Fonts:</span>
                    <span className="truncate">
                      {theme.fonts.heading}, {theme.fonts.body}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="outline"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Custom Theme
          </Button>
          {selectedTheme && (
            <Button
              onClick={() => onThemeSelect(selectedTheme)}
              className="bg-[#550C18] text-white hover:bg-[#78001A] gap-2"
            >
              <Palette className="w-4 h-4" />
              Apply Selected Theme
            </Button>
          )}
        </div>

        {/* Create Theme Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-2xl font-bold text-[#550C18]">
                Create Custom Theme
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                Design your own theme by customizing colors, fonts, and effects
              </p>
            </DialogHeader>

            <Tabs defaultValue="basic" className="flex flex-col h-full">
              <div className="px-6">
                <TabsList className="w-full justify-start">
                  <TabsTrigger
                    value="basic"
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Basic
                  </TabsTrigger>
                  <TabsTrigger
                    value="colors"
                    className="flex items-center gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-gradient-to-r from-[#550C18] to-[#78001A]" />
                    Colors
                  </TabsTrigger>
                  <TabsTrigger
                    value="typography"
                    className="flex items-center gap-2"
                  >
                    <span className="font-serif">Aa</span>
                    Typography
                  </TabsTrigger>
                  <TabsTrigger
                    value="effects"
                    className="flex items-center gap-2"
                  >
                    <span>✨</span>
                    Effects
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 p-6">
                <TabsContent value="basic" className="m-0">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-[#550C18]">Theme Name</Label>
                      <Input
                        value={newTheme.name}
                        onChange={(e) =>
                          setNewTheme({ ...newTheme, name: e.target.value })
                        }
                        placeholder="Enter a descriptive name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-[#550C18]">Description</Label>
                      <Textarea
                        value={newTheme.description}
                        onChange={(e) =>
                          setNewTheme({
                            ...newTheme,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe the theme's style and purpose"
                        className="mt-1"
                      />
                    </div>

                    <div className="border rounded-lg p-4 bg-gray-50">
                      <ThemePreview theme={newTheme as ThemeConfig} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="colors" className="m-0">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(newTheme.colors || {}).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center gap-3 bg-white p-3 rounded-lg border"
                          >
                            <div className="flex-1">
                              <Label className="text-sm capitalize text-gray-600">
                                {key}
                              </Label>
                              <div className="flex gap-2 mt-1">
                                <div className="relative">
                                  <Input
                                    type="color"
                                    value={value}
                                    onChange={(e) =>
                                      setNewTheme({
                                        ...newTheme,
                                        colors: {
                                          ...newTheme.colors!,
                                          [key]: e.target.value,
                                        },
                                      })
                                    }
                                    className="w-10 h-8 p-1 cursor-pointer"
                                  />
                                </div>
                                <Input
                                  type="text"
                                  value={value}
                                  onChange={(e) =>
                                    setNewTheme({
                                      ...newTheme,
                                      colors: {
                                        ...newTheme.colors!,
                                        [key]: e.target.value,
                                      },
                                    })
                                  }
                                  className="flex-1 font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="typography" className="m-0">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(newTheme.fonts || {}).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="bg-white p-3 rounded-lg border"
                          >
                            <Label className="text-sm capitalize text-gray-600">
                              {key}
                            </Label>
                            <Select
                              value={value}
                              onValueChange={(val) =>
                                setNewTheme({
                                  ...newTheme,
                                  fonts: { ...newTheme.fonts!, [key]: val },
                                })
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select font" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Inter">Inter</SelectItem>
                                <SelectItem value="Philosopher">
                                  Philosopher
                                </SelectItem>
                                <SelectItem value="Playfair Display">
                                  Playfair Display
                                </SelectItem>
                                <SelectItem value="Lora">Lora</SelectItem>
                                <SelectItem value="Noto Naskh Arabic">
                                  Noto Naskh Arabic
                                </SelectItem>
                                <SelectItem value="Amiri">Amiri</SelectItem>
                                <SelectItem value="Scheherazade New">
                                  Scheherazade New
                                </SelectItem>
                                <SelectItem value="Aref Ruqaa">
                                  Aref Ruqaa
                                </SelectItem>
                                <SelectItem value="Reem Kufi">
                                  Reem Kufi
                                </SelectItem>
                                <SelectItem value="Tajawal">Tajawal</SelectItem>
                              </SelectContent>
                            </Select>
                            <div
                              className="mt-2 p-2 text-sm rounded bg-gray-50"
                              style={{ fontFamily: value }}
                            >
                              Preview text in {value}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="effects" className="m-0">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <Label className="text-sm capitalize text-gray-600">
                          Spacing
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                          {Object.entries(newTheme.spacing || {}).map(
                            ([key, value]) => (
                              <div key={key}>
                                <Label className="text-xs capitalize text-gray-500">
                                  {key}
                                </Label>
                                <Input
                                  value={value}
                                  onChange={(e) =>
                                    setNewTheme({
                                      ...newTheme,
                                      spacing: {
                                        ...newTheme.spacing!,
                                        [key]: e.target.value,
                                      },
                                    })
                                  }
                                  placeholder={`Enter ${key}`}
                                  className="mt-1"
                                />
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border">
                        <Label className="text-sm capitalize text-gray-600">
                          Shadow
                        </Label>
                        <Input
                          value={newTheme.effects?.shadow}
                          onChange={(e) =>
                            setNewTheme({
                              ...newTheme,
                              effects: {
                                ...newTheme.effects!,
                                shadow: e.target.value,
                              },
                            })
                          }
                          placeholder="Enter shadow value"
                          className="mt-1 font-mono"
                        />
                        <div className="mt-2 p-4 rounded bg-gray-50">
                          <div
                            className="w-full h-16 rounded bg-white"
                            style={{ boxShadow: newTheme.effects?.shadow }}
                          />
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg border">
                        <Label className="text-sm capitalize text-gray-600">
                          Opacity
                        </Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={newTheme.effects?.opacity}
                            onChange={(e) =>
                              setNewTheme({
                                ...newTheme,
                                effects: {
                                  ...newTheme.effects!,
                                  opacity: parseFloat(e.target.value),
                                },
                              })
                            }
                            className="flex-1"
                          />
                          <span className="text-sm font-mono w-16 text-center">
                            {(newTheme.effects?.opacity || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <div className="p-4 border-t mt-4">
              <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTheme}
                  className="bg-[#550C18] text-white hover:bg-[#78001A]"
                  disabled={!newTheme.name}
                >
                  Create Theme
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

function EditSlideModal({
  slide,
  onUpdate,
  onDelete,
  masjidId,
  items,
  plan,
}: {
  slide: SlideConfig;
  onUpdate: (updatedSlide: SlideConfig) => void;
  onDelete: () => void;
  masjidId: string;
  items: any[];
  plan?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [editedSlide, setEditedSlide] = useState<SlideConfig>(slide);
  const [showContentModal, setShowContentModal] = useState(false);

  const handleLayoutChange = (layout: SlideConfig["layout"]) => {
    // Split layouts are Pro; the device ignores them on Free anyway.
    if (!canUseLayout(layout, plan)) return;
    setEditedSlide((prev) => ({
      ...prev,
      layout,
    }));
  };

  const handleContentSelect = (item: any) => {
    setEditedSlide((prev) => ({
      ...prev,
      content: item,
      contentId: item.id,
    }));
    setShowContentModal(false);
  };

  const handleDeleteSlide = () => {
    onDelete();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)} variant="ghost" size="icon">
                <Settings className="h-4 w-4 text-[#550C18]" />
            </Button>
        </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-[#550C18]">
            Edit Slide
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 space-y-6 pr-1">
          {/* Style / Template Selection (for prayerTimes slides and any L-shape layout) */}
          {(editedSlide.type === "prayerTimes" || editedSlide.type === "prayer" || editedSlide.layout === "l-shape" || editedSlide.layout === "reverse-l-shape") && (
            <div>
              <Label className="text-[#550C18] mb-2 block">Style</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    value: "classic",
                    label: "Classic",
                    desc: "White bg, maroon accents",
                    preview: (
                      <div className="h-full rounded flex flex-col overflow-hidden bg-white">
                        <div className="h-1 bg-[#550C18]" />
                        <div className="flex-1 flex flex-col items-center justify-center gap-1 p-1">
                          <div className="w-10 h-1.5 rounded bg-[#550C18]/30" />
                          <div className="text-[10px] font-bold text-[#550C18]">11:39 PM</div>
                          <div className="w-8 h-1 rounded bg-gray-200" />
                          <div className="flex gap-1 w-full px-1">
                            {["F","D","A","M","I"].map(l => (
                              <div key={l} className="flex-1 flex flex-col items-center">
                                <div className="text-[5px] text-gray-400">{l}</div>
                                <div className="w-full h-1 rounded bg-[#550C18]/20 mt-0.5" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    value: "geometric",
                    label: "Geometric",
                    desc: "Navy, Islamic star pattern, gold",
                    preview: (
                      <div className="h-full rounded flex flex-col overflow-hidden relative" style={{ background: "#0b1825" }}>
                        {/* Star tile hint */}
                        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <pattern id="prev-star" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                              <polygon points="6,0.5 7,4 11,4 8,6.5 9,10 6,7.5 3,10 4,6.5 1,4 5,4" fill="none" stroke="#c9a840" strokeWidth="0.4" />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#prev-star)" />
                        </svg>
                        <div className="relative flex-1 flex flex-col items-center justify-center gap-1 p-1">
                          <div className="w-8 h-8 rounded border border-yellow-500/40 flex items-center justify-center" style={{ background: "rgba(201,168,64,0.1)" }}>
                            <span className="text-[9px] font-bold" style={{ color: "#e8dcc8" }}>11:39</span>
                          </div>
                          <div className="text-[5px] tracking-widest" style={{ color: "#c9a840" }}>PM</div>
                          <div className="w-full h-px" style={{ background: "rgba(201,168,64,0.3)" }} />
                          <div className="text-[5px] font-bold" style={{ color: "#c9a840" }}>8:45 · FAJR</div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    value: "mihrab",
                    label: "Mihrab",
                    desc: "Burgundy, arch ornament, cream",
                    preview: (
                      <div className="h-full rounded flex flex-col overflow-hidden relative" style={{ background: "#1c0508" }}>
                        {/* Arch SVG header */}
                        <svg viewBox="0 0 60 18" className="w-full flex-shrink-0" style={{ height: 18 }}>
                          <path d="M4,18 L4,12 Q4,1 30,0.5 Q56,1 56,12 L56,18" fill="none" stroke="rgba(212,168,67,0.6)" strokeWidth="0.6" />
                          <circle cx="30" cy="1.5" r="1.5" fill="none" stroke="rgba(212,168,67,0.6)" strokeWidth="0.5" />
                          <circle cx="30" cy="1.5" r="0.6" fill="rgba(212,168,67,0.8)" />
                        </svg>
                        <div className="flex-1 flex flex-col items-center justify-center gap-1 p-1">
                          <div className="text-[10px] font-bold" style={{ color: "#f2e8d5" }}>11:39</div>
                          <div className="text-[5px] tracking-widest" style={{ color: "#d4a843" }}>PM</div>
                          <div className="w-full h-px" style={{ background: "rgba(212,168,67,0.2)" }} />
                          <div className="text-[5px] font-bold" style={{ color: "#d4a843" }}>8:45 · FAJR</div>
                        </div>
                        {/* Side dots */}
                        <div className="absolute left-1 inset-y-0 flex flex-col justify-around">
                          {[0,1,2,3,4].map(i => <div key={i} className="w-0.5 h-0.5 rounded-full" style={{ background: `rgba(212,168,67,${i%2===0?0.5:0.15})` }} />)}
                        </div>
                        <div className="absolute right-1 inset-y-0 flex flex-col justify-around">
                          {[0,1,2,3,4].map(i => <div key={i} className="w-0.5 h-0.5 rounded-full" style={{ background: `rgba(212,168,67,${i%2===0?0.5:0.15})` }} />)}
                        </div>
                      </div>
                    ),
                  },
                ].map((opt) => {
                  const locked = !canUseTemplate(opt.value, plan);
                  return (
                  <div
                    key={opt.value}
                    className={cn(
                      "relative border-2 rounded-lg p-3 transition-colors",
                      locked
                        ? "cursor-not-allowed border-gray-200 opacity-60"
                        : "cursor-pointer hover:border-[#550C18]",
                      !locked && (editedSlide.template || "classic") === opt.value
                        ? "border-[#550C18] bg-[#550C18]/5"
                        : "border-gray-200"
                    )}
                    title={locked ? `${opt.label} is available on the Pro plan` : undefined}
                    onClick={() => {
                      if (locked) return;
                      setEditedSlide((prev) => ({ ...prev, template: opt.value }));
                    }}
                  >
                    {locked && (
                      <span className="absolute right-2 top-2 z-10 rounded-full bg-gradient-to-r from-[#550C18] to-[#78001A] px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wider text-white">
                        Pro
                      </span>
                    )}
                    <div className="aspect-video rounded mb-2 overflow-hidden">
                      {opt.preview}
                    </div>
                    <span className="text-sm font-medium block">{opt.label}</span>
                    <span className="text-xs text-gray-500">{opt.desc}</span>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Layout Selection */}
          <div>
            <Label className="text-[#550C18] mb-2 block">Layout</Label>
            <div className="grid grid-cols-3 gap-4">
              <div
                className={cn(
                  "border-2 rounded-lg p-4 cursor-pointer hover:border-[#550C18] transition-colors",
                  editedSlide.layout === "full" || !editedSlide.layout
                    ? "border-[#550C18]"
                    : "border-gray-200"
                )}
                onClick={() => handleLayoutChange("full")}
              >
                <div className="aspect-video bg-gray-100 rounded mb-2" />
                <span className="text-sm font-medium">Full Screen</span>
              </div>
              {([
                {
                  value: "l-shape" as const,
                  label: "L-Shape Prayer Times",
                  cols: "1fr 2fr",
                  reverse: false,
                },
                {
                  value: "reverse-l-shape" as const,
                  label: "Reverse L-Shape",
                  cols: "2fr 1fr",
                  reverse: true,
                },
              ]).map((opt) => {
                const locked = !canUseLayout(opt.value, plan);
                return (
                  <div
                    key={opt.value}
                    className={cn(
                      "relative border-2 rounded-lg p-4 transition-colors",
                      locked
                        ? "cursor-not-allowed border-gray-200 opacity-60"
                        : "cursor-pointer hover:border-[#550C18]",
                      !locked && editedSlide.layout === opt.value
                        ? "border-[#550C18]"
                        : "border-gray-200"
                    )}
                    title={locked ? `${opt.label} is available on the Pro plan` : undefined}
                    onClick={() => handleLayoutChange(opt.value)}
                  >
                    {locked && (
                      <span className="absolute right-2 top-2 z-10 rounded-full bg-gradient-to-r from-[#550C18] to-[#78001A] px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wider text-white">
                        Pro
                      </span>
                    )}
                    <div
                      className="aspect-video bg-gray-100 rounded mb-2 grid"
                      style={{
                        gridTemplateColumns: opt.cols,
                        gridTemplateRows: "2fr 1fr",
                        gap: "2px",
                      }}
                    >
                      {opt.reverse ? (
                        <>
                          <div className="bg-gray-200 rounded" />
                          <div className="row-span-2 bg-[#550C18]/20 rounded" />
                        </>
                      ) : (
                        <>
                          <div className="row-span-2 bg-[#550C18]/20 rounded" />
                          <div className="bg-gray-200 rounded" />
                        </>
                      )}
                      <div className="bg-[#550C18]/20 rounded" />
                    </div>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content Selection — hidden for prayer times slides */}
          {editedSlide.type !== "prayerTimes" && editedSlide.type !== "prayer" && (
          <div>
            <Label className="text-[#550C18] mb-2 block">Content</Label>
            <div className="border rounded-lg p-4">
              {editedSlide.type === "custom" ? (
                <div className="space-y-4">
                  <div>
                    <Label>Custom Component URL</Label>
                    <Input 
                      value={editedSlide.customComponentUrl || ''}
                      onChange={(e) => {
                        setEditedSlide({
                          ...editedSlide,
                          customComponentUrl: e.target.value
                        });
                      }}
                      placeholder="https://github.com/user/repo/blob/main/component.tsx"
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : editedSlide.content ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-lg">
                      {editedSlide.content.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {editedSlide.content.type === "eid_countdown"
                        ? "Eid Countdown"
                        : "Regular Content"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowContentModal(true)}
                  >
                    Change Content
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowContentModal(true)}
                  className="w-full"
                >
                  Select Content
                </Button>
              )}
            </div>
          </div>
          )}

          {/* Preview */}
          <div>
            <Label className="text-[#550C18] mb-2 block">Preview</Label>
            <div className="border rounded-lg p-4 bg-gray-50 min-h-[350px]">
              <SlidePreview
                slide={editedSlide}
                masjid={null}
                allSlides={[]}
                cacheKey={Math.random().toString()}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t">
          <Button
            variant="destructive"
            onClick={onDelete}
            className="mr-auto"
          >
            Delete Slide
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onUpdate(editedSlide);
              setOpen(false);
            }}
            className="bg-[#550C18] text-white hover:bg-[#78001A]"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>

      <ContentLibraryModal
        open={showContentModal}
        onClose={() => setShowContentModal(false)}
        onSelect={handleContentSelect}
        masjidId={masjidId}
        items={items}
      />
    </Dialog>
  );
}

export default function SignageDisplay({
  initialSlides,
  masjidId,
  displayId,
}: {
  initialSlides: SlideConfig[];
  masjidId: string;
  displayId?: string;
}) {
  const [slides, setSlides] = useState<SlideConfig[]>(initialSlides);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  // Defaults to PRO so nothing is marked locked before the plan loads.
  const [plan, setPlan] = useState<string>("PRO");
  // getMasjidById returns a narrowed selection, not the full Masjid row.
  const [masjid, setMasjid] = useState<
    Awaited<ReturnType<typeof getMasjidById>>
  >(null);
  const [displays, setDisplays] = useState<any[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(
    defaultThemes[0]
  );
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [cacheBuster, setCacheBuster] = useState<Record<string, number>>({});
  const initialSlidesLoaded = useRef(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchMasjid = async () => {
    const masjid = await getMasjidById(masjidId);
    setMasjid(masjid);
    // Plan is read separately so getMasjidById stays off the plan columns.
    getMasjidPlanForEditor(masjidId)
      .then(setPlan)
      .catch(() => setPlan("PRO"));
    fetch(`/api/masjids/${masjidId}/content`)
      .then(async (res) => {
        const data = await res.json();
        // if(!data) return;
        const contentItems = (data.content || []).map((item: any) => ({
          ...item,
          source: "content",
        }));
        const announcementItems = (data.announcements || []).map(
          (item: any) => ({ ...item, source: "announcement" })
        );
        setContentItems([...contentItems, ...announcementItems]);
      })
  };

  const fetchDisplays = async () => {
    const displays = await getAllTVDisplays(masjidId);
    setDisplays(displays || []);
  }

  useEffect(() => {
    fetchMasjid();
    fetchDisplays();
  }, [masjidId]);

  // Update slides when initialSlides change (when data loads from API)
  useEffect(() => {
    if (initialSlides.length > 0 || initialSlidesLoaded.current) {
      setSlides(initialSlides);
      initialSlidesLoaded.current = true;
      setIsDirty(false);
    }
  }, [initialSlides]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleSave = async () => {
    if (!masjidId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(
        `/api/masjids/${masjidId}/signage-config${displayId ? `?displayId=${displayId}` : ""}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slides }),
        }
      );
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to save signage config");
      }
      setIsDirty(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save signage config");
    } finally {
      setIsSaving(false);
    }
  };

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = slides.findIndex((_, i) => i.toString() === active.id);
      const newIndex = slides.findIndex((_, i) => i.toString() === over.id);
      setSlides((slides) => arrayMove(slides, oldIndex, newIndex));
      setSelectedIndex(newIndex);
      setIsDirty(true);
    }
  }

  function handleAddContentSlide(item: any) {
    setSlides((prev) => {
      const newSlide = {
        type:
          item.source === "announcement"
            ? ("announcements" as const)
            : ("content" as const),
        template: "classic" as const,
        contentId: item.id,
        theme: { ...defaultTheme },
        content: item,
        layout: item.layout || "full", // Use layout from content if available
        id: crypto.randomUUID(),
      };

      const newSlides = [...prev, newSlide];
      setSelectedIndex(newSlides.length - 1);
      return newSlides;
    });
    setIsDirty(true);
  }
  function handleAddPrayerSlide() {
    setSlides((prev) => {
      const newSlides = [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "prayerTimes" as const,
          template: "classic" as const,
          theme: { ...defaultTheme },
          layout: "full" as const,
        },
      ];
      setSelectedIndex(newSlides.length - 1);
      return newSlides;
    });
    setIsDirty(true);
  }
  function handleAddCustomSlide(url: string) {
    setSlides((prev) => {
      const newSlides = [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "custom" as const,
          template: "classic" as const,
          customComponentUrl: url,
          theme: { ...defaultTheme },
        },
      ];
      setSelectedIndex(newSlides.length - 1);
      return newSlides;
    });
    setIsDirty(true);
  }
  function handleAddSplitSlide(split: {
    left: SlideConfig;
    right: SlideConfig;
  }) {
    setSlides((prev) => {
      const newSlides = [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "split" as const,
          template: "classic" as const,
          splitConfig: split,
          theme: { ...defaultTheme },
        },
      ];
      setSelectedIndex(newSlides.length - 1);
      return newSlides;
    });
    setIsDirty(true);
  }

  function handleThemeSelect(theme: ThemeConfig) {
    setCurrentTheme(theme);
    setShowThemeModal(false);

    // Apply theme to all slides
    setSlides((prev) =>
      prev.map((slide) => ({
        ...slide,
        theme: {
          primary: theme.colors.primary,
          secondary: theme.colors.secondary,
          accent: theme.colors.accent,
          background: theme.colors.background,
          text: theme.colors.text,
          font: theme.fonts.heading,
          fontHeading: theme.fonts.heading,
          fontBody: theme.fonts.body,
          fontArabic: theme.fonts.arabic,
        },
      }))
    );
    setIsDirty(true);
  }

  const handleUpdateSlide = (updatedSlide: SlideConfig) => {
    setSlides((prev) =>
      prev.map((slide, i) => (i === selectedIndex ? updatedSlide : slide))
    );
    setIsDirty(true);
  };

  const handleDeleteSlide = (slideId: string) => {
    setSlides((prev) => {
      const next = prev.filter((slide: SlideConfig) => slide.id !== slideId);
      if (selectedIndex >= next.length) {
        setSelectedIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
    setIsDirty(true);
  };

  const handleRefreshSlide = (slideId: string) => {
    setCacheBuster(prev => ({
      ...prev,
      [slideId]: Date.now()
    }));
  };

  if(contentItems.length === 0) {
    return <div className="max-w-7xl mx-auto p-8 flex flex-col gap-3 w-full">
        <div className="w-full flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-[#550C18]">Signage Slides</h1>
            <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-500">
                    No content items found. Please add some content items to the masjid.
                </p>
                <Button variant="outline">
                    Add Content
                </Button>
            </div>
        </div>
    </div>
  }

  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col gap-3 w-full">
      <div className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-between flex-row w-full border-b border-[#550C18]/20 pb-4">
          <div className="flex flex-col w-full gap-2">
            <h1 className="text-3xl font-bold text-[#550C18]">Signage Slides</h1>
            <p className="text-sm text-gray-500">
              Add, edit, and manage your signage slides for your TV screens. Changes apply only after you save. (Devices refresh about every 30 seconds)
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {isDirty ? (
                <Badge className="bg-[#550C18]/10 text-[#550C18]">Unsaved changes</Badge>
              ) : (
                <Badge className="bg-emerald-100 text-emerald-700">All changes saved</Badge>
              )}
              {saveError && <span className="text-red-600">{saveError}</span>}
            </div>
          </div>
          <div className="flex flex-row gap-3 items-center justify-end">
            <Button
              variant="default"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className="bg-[#550C18] text-white hover:bg-[#78001A]"
            >
              {isSaving ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Copy Settings
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-0">
                <div className="p-2">
                  <div className="mb-2 px-2">Copy From</div>
                  <div className="flex flex-col gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          Default Settings
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you sure?</DialogTitle>
                        </DialogHeader>
                        <p>This will overwrite your current slides configuration with the default settings. This action cannot be undone.</p>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button
                            variant="default"
                            onClick={() => {
                              setSlides([
                                {
                                  id: "default",
                                  type: "prayerTimes", 
                                  template: "default",
                                  theme: defaultTheme
                                }
                              ]);
                              setIsDirty(true);
                            }}
                          >
                            Apply Default Settings
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    {displays?.filter((display) => display.id !== displayId)?.map((display) => (
                      <Dialog key={display.id}>
                        <DialogTrigger asChild>
                          <Button
                            key={display.id}
                            variant="outline"
                            className="w-full justify-start text-sm"
                          >
                            {display.name || display.id}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Are you sure?</DialogTitle>
                          </DialogHeader>
                          <p>This will overwrite your current slides configuration. This action cannot be undone.</p>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              variant="default"
                              onClick={() => {
                                if (display.config?.slides) {
                                  setSlides(display.config.slides);
                                  setIsDirty(true);
                                }
                              }}
                            >
                              Copy Settings
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              onClick={() => setShowThemeModal(true)}
              className="flex items-center gap-2"
            >
              <Palette className="w-4 h-4" />
              Themes
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="border-[#550C18]/30 text-[#550C18] hover:bg-[#550C18]/10"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Slide
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-0">
                <div className="p-2">
                  <div className="font-semibold mb-2 px-2">Add Slide</div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleAddPrayerSlide}
                  >
                    Prayer Times
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setShowContentModal(true)}
                  >
                    From Content Library
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setShowCustomModal(true)}
                  >
                    Custom Slide (GitHub)
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setShowSplitModal(true)}
                  >
                    Split Screen
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {/* Slide allowance. Only shown when the plan actually caps slides, so
            Pro masjids see no chrome for a limit they don't have. */}
        {Number.isFinite(slideLimit(plan)) && (
          <div
            className={cn(
              "mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-4 py-3 text-sm",
              slides.length > slideLimit(plan)
                ? "border-amber-300 bg-amber-50 text-amber-900"
                : "border-[#550C18]/15 bg-[#550C18]/5 text-[#550C18]"
            )}
          >
            <span className="font-medium">
              {slides.length} of {slideLimit(plan)} slide
              {slideLimit(plan) === 1 ? "" : "s"} used
            </span>
            {slides.length > slideLimit(plan) && (
              <span>
                — only the first {slideLimit(plan) === 1 ? "slide" : `${slideLimit(plan)} slides`} will
                show on your display.
              </span>
            )}
            <Link
              href={`/dashboard/billing?masjidId=${masjidId ?? ""}`}
              className="font-semibold underline"
            >
              Upgrade for unlimited
            </Link>
          </div>
        )}

        <div className="flex flex-row gap-2 justify-between w-full h-full divide-x divide-[#550C18]/10">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={slides.map((_, i) => i.toString())}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-4 w-full max-w-sm mt-9">
                    {slides.map((slide, i) => (
                        <SortableSlide
                        key={i}
                        id={i.toString()}
                        selected={selectedIndex === i}
                        onClick={() => setSelectedIndex(i)}
                        >
                            <Card
                                className={cn(
                                "relative group border-[#550C18]/20 cursor-pointer transition-shadow shadow-md shadow-[#550C18]",
                                selectedIndex === i && "ring-2 ring-[#550C18]",
                                // Past the plan's allowance: dimmed, since the
                                // device won't render it.
                                i >= slideLimit(plan) && "opacity-55"
                                )}
                            >
                                {i >= slideLimit(plan) && (
                                  <span className="absolute right-2 top-2 z-10 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wider text-white">
                                    Not shown
                                  </span>
                                )}
                                <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2 w-full">
                                    <span className="inline-block align-middle">
                                    <svg
                                        width="18"
                                        height="18"
                                        fill="#550C18"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle cx="5" cy="5" r="2" />
                                        <circle cx="12" cy="5" r="2" />
                                        <circle cx="19" cy="5" r="2" />
                                        <circle cx="5" cy="12" r="2" />
                                        <circle cx="12" cy="12" r="2" />
                                        <circle cx="19" cy="12" r="2" />
                                        <circle cx="5" cy="19" r="2" />
                                        <circle cx="12" cy="19" r="2" />
                                        <circle cx="19" cy="19" r="2" />
                                    </svg>
                                    </span>
                                    {slide.type === "content" && slide.content?.title && (
                                        <span className="ml-2 text-lg text-[#550C18]">
                                            {slide.content.title}
                                        </span>
                                    )}
                                    {slide.type === "announcements" && slide.content?.title && (
                                        <span className="ml-2 text-lg text-[#550C18] truncate">
                                            {slide.content.title}
                                        </span>
                                    )}
                                    {/* <span className="text-xs text-[#3A3A3A]/60 ml-2">
                                    {templates.find((t) => t.value === slide.template)
                                        ?.label || slide.template}
                                    </span> */}
                                    {slide.type === "custom" &&
                                    slide.customComponentUrl && (
                                        <span className="ml-2 text-xs text-[#550C18] truncate w-24" title={slide.customComponentUrl}>
                                        Custom: {slide.customComponentUrl}
                                        </span>
                                    )}
                                    {slide.type === "split" && (
                                    <span className="ml-2 text-xs text-[#550C18]">
                                        Split Screen
                                    </span>
                                    )}
                                    <Badge className="bg-[#550C18]/10 text-[#550C18] ml-auto">
                                    {slideTypes.find((t) => t.value === slide.type)
                                        ?.label || slide.type}
                                    </Badge>
                                    {slide.type === 'custom' && slide.id && (
                                      <Button variant="ghost" size="icon" onClick={() => handleRefreshSlide(slide.id!)} title="Refresh custom component">
                                        <RefreshCw className="h-4 w-4 text-[#550C18]" />
                                      </Button>
                                    )}
                                    <EditSlideModal
                                        slide={slide}
                                        items={contentItems}
                                        onUpdate={handleUpdateSlide}
                                        onDelete={() => handleDeleteSlide(slide.id!)}
                                        masjidId={masjidId}
                                        plan={plan}
                                    />
                                </div>
                                </CardHeader>
                            </Card>
                        </SortableSlide>
                    ))}
                    </div>
                </SortableContext>
            </DndContext>
            {/* Slide Preview */}
            <div className="w-full pl-2 h-full flex flex-col flex-1">
                {slides[selectedIndex] && (
                    <div className="w-full h-full flex flex-col flex-1">
                        <span className="font-semibold text-[#550C18] mb-2 block">
                            Live Preview
                        </span>
                        <SlidePreview
                            slide={slides[selectedIndex]}
                            masjid={masjid}
                            currentTheme={currentTheme}
                            allSlides={slides}
                            cacheKey={cacheBuster[slides[selectedIndex]?.id || '']}
                        />
                    </div>
                )}
            </div>
        </div>
        <ContentLibraryModal
          open={showContentModal}
          items={contentItems || []}
          onClose={() => setShowContentModal(false)}
          onSelect={handleAddContentSlide}
          masjidId={masjidId}
        />
        <CustomSlideModal
          open={showCustomModal}
          onClose={() => setShowCustomModal(false)}
          onSubmit={handleAddCustomSlide}
        />
        <SplitScreenModal
          open={showSplitModal}
          onClose={() => setShowSplitModal(false)}
          onSubmit={handleAddSplitSlide}
        />
        <ThemeManagementModal
          open={showThemeModal}
          onClose={() => setShowThemeModal(false)}
          masjidId={masjidId}
          onThemeSelect={handleThemeSelect}
        />
      </div>
    </div>
  );
}
