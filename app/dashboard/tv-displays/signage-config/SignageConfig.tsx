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
import { Masjid } from "@prisma/client";
import { getMasjidById } from "@/lib/actions/masjids";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import CustomComponentLoader from "./CustomComponentLoader";
import dynamic from "next/dynamic";
import OpenAI from "openai";
import { getAllTVDisplays } from "@/lib/actions/tvdisplays";

const MonacoEditor = dynamic(() => import("react-monaco-editor"), { ssr: false });

export type SlideConfig = {
  id?: string;
  type: "prayerTimes" | "announcements" | "custom" | "content" | "split";
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
  masjid: Masjid | null;
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
    const containerClasses = cn(
      "rounded-2xl border flex flex-col items-center justify-center",
      isSplitScreen ? "h-full" : "min-h-[180px]"
    );

    const slideTheme =
      slideData.type === "prayerTimes" ? flatCurrentTheme : (slideData.theme || theme);

    return (
      <div
        className={containerClasses}
        style={{
          background: slideTheme.background || defaultTheme.background,
          color: slideTheme.primary || defaultTheme.primary,
          fontFamily: (slideTheme as any).fontBody || slideTheme.font || defaultTheme.font,
        }}
      >
        {slideData.type === "prayerTimes" && (
          <div className="text-center p-4 ">
            <div className="text-lg font-bold mb-2" style={{fontFamily: (slideTheme as any).fontHeading || slideTheme.font }}>Prayer Times</div>
            <div className="text-sm opacity-70">(Preview)</div>
          </div>
        )}
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
              <CustomComponentLoader
                url={slideData.customComponentUrl}
                componentProps={{ masjid, slides: allSlides, theme: currentTheme, slide: slideData }}
                cacheKey={cacheKey}
              />
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
        <div className="row-span-2 bg-[#1a1f2e] rounded-l-lg h-full">
          {renderSlideContent(
            {
              type: "prayerTimes",
              template: "modern",
              theme: {
                ...theme,
                background: "#1a1f2e",
                text: "#ffffff",
              },
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
                template: "modern",
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
                template: "modern",
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
                template: "modern",
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
                template: "modern",
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
      console.error(error);
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
      console.error(error);
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
      console.error("Failed to create theme:", error);
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
}: {
  slide: SlideConfig;
  onUpdate: (updatedSlide: SlideConfig) => void;
  onDelete: () => void;
  masjidId: string;
  items: any[];
}) {
  const [open, setOpen] = useState(false);
  const [editedSlide, setEditedSlide] = useState<SlideConfig>(slide);
  const [showContentModal, setShowContentModal] = useState(false);

  const handleLayoutChange = (layout: SlideConfig["layout"]) => {
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
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#550C18]">
            Edit Slide
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
              <div
                className={cn(
                  "border-2 rounded-lg p-4 cursor-pointer hover:border-[#550C18] transition-colors",
                  editedSlide.layout === "l-shape"
                    ? "border-[#550C18]"
                    : "border-gray-200"
                )}
                onClick={() => handleLayoutChange("l-shape")}
              >
                <div
                  className="aspect-video bg-gray-100 rounded mb-2 grid"
                  style={{
                    gridTemplateColumns: "1fr 2fr",
                    gridTemplateRows: "2fr 1fr",
                    gap: "2px",
                  }}
                >
                  <div className="row-span-2 bg-[#550C18]/20 rounded" />
                  <div className="bg-gray-200 rounded" />
                  <div className="bg-[#550C18]/20 rounded" />
                </div>
                <span className="text-sm font-medium">
                  L-Shape Prayer Times
                </span>
              </div>
              <div
                className={cn(
                  "border-2 rounded-lg p-4 cursor-pointer hover:border-[#550C18] transition-colors",
                  editedSlide.layout === "reverse-l-shape"
                    ? "border-[#550C18]"
                    : "border-gray-200"
                )}
                onClick={() => handleLayoutChange("reverse-l-shape")}
              >
                <div
                  className="aspect-video bg-gray-100 rounded mb-2 grid"
                  style={{
                    gridTemplateColumns: "2fr 1fr",
                    gridTemplateRows: "2fr 1fr",
                    gap: "2px",
                  }}
                >
                  <div className="bg-gray-200 rounded" />
                  <div className="row-span-2 bg-[#550C18]/20 rounded" />
                  <div className="bg-[#550C18]/20 rounded" />
                </div>
                <span className="text-sm font-medium">Reverse L-Shape</span>
              </div>
            </div>
          </div>

          {/* Content Selection */}
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

        <DialogFooter className="mt-6">
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
  const [editingSlide, setEditingSlide] = useState<SlideConfig | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [addType, setAddType] = useState<SlideConfig["type"]>("prayerTimes");
  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const [displays, setDisplays] = useState<any[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(
    defaultThemes[0]
  );
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [cacheBuster, setCacheBuster] = useState<Record<string, number>>({});
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  const initialSlidesLoaded = useRef(false);

  const fetchMasjid = async () => {
    const masjid = await getMasjidById(masjidId);
    setMasjid(masjid);
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
        console.log(contentItems, announcementItems, data);
        setContentItems([...contentItems, ...announcementItems]);
      })
  };

  const fetchDisplays = async () => {
    const displays = await getAllTVDisplays(masjidId);
    setDisplays(displays);
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
    }
  }, [initialSlides]);

  // Debounced save to DB on slides change (skip first render and empty slides)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Don't save if slides are empty and we haven't loaded initial data yet
    if (slides.length === 0 && !initialSlidesLoaded.current) {
      return;
    }

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    console.log("Saving slides", slides, displayId);
    saveTimeout.current = setTimeout(() => {
      fetch(
        `/api/masjids/${masjidId}/signage-config${displayId ? `?displayId=${displayId}` : ""}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slides }),
        }
      );
    }, 700); // 700ms debounce
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [slides, masjidId, displayId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = slides.findIndex((_, i) => i.toString() === active.id);
      const newIndex = slides.findIndex((_, i) => i.toString() === over.id);
      setSlides((slides) => arrayMove(slides, oldIndex, newIndex));
      setSelectedIndex(newIndex);
    }
  }

  function addSlide() {
    setAddMenuOpen(true);
  }

  function handleAddContentSlide(item: any) {
    setSlides((prev) => {
      const newSlide = {
        type:
          item.source === "announcement"
            ? ("announcements" as const)
            : ("content" as const),
        template: "modern",
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
  }
  function handleAddCustomSlide(url: string) {
    setSlides((prev) => {
      const newSlides = [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "custom" as const,
          template: "modern",
          customComponentUrl: url,
          theme: { ...defaultTheme },
        },
      ];
      setSelectedIndex(newSlides.length - 1);
      return newSlides;
    });
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
          template: "modern",
          splitConfig: split,
          theme: { ...defaultTheme },
        },
      ];
      setSelectedIndex(newSlides.length - 1);
      return newSlides;
    });
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
  }

  const handleUpdateSlide = (updatedSlide: SlideConfig) => {
    setSlides((prev) =>
      prev.map((slide, i) => (i === selectedIndex ? updatedSlide : slide))
    );
  };

  const handleDeleteSlide = (slideId: string) => {
    setSlides((prev) =>
      prev.filter((slide: SlideConfig) => slide.id !== slideId)
    );
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
              Add, edit, and manage your signage slides for your TV screens. (Device will automatically refresh every 30 seconds)
            </p>
          </div>
          <div className="flex flex-row gap-3 items-center justify-end">
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
                  variant="default"
                  className="bg-[#550C18] text-white hover:bg-[#78001A]"
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
                                selectedIndex === i && "ring-2 ring-[#550C18]"
                                )}
                            >
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
            <div className="w-full pl-2">
                {slides[selectedIndex] && (
                <div>
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
