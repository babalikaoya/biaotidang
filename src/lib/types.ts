export type Platform = "小红书" | "抖音" | "B站";

export type ContentType = "视频" | "图文" | "教程" | "观点";

export type HookStyle =
  | "悬念型"
  | "痛点型"
  | "反差型"
  | "权威型"
  | "故事型"
  | "数据型"
  | "情绪型"
  | "指令型";

export interface Hook {
  id: string;
  text: string;
  style: HookStyle;
  score: number;
  reason: string;
  platform: Platform;
  contentType: ContentType;
  topic: string;
  createdAt: string;
  folderId: string | null;
  isFavorite: boolean;
}

export interface GenerationRecord {
  id: string;
  topic: string;
  platform: Platform;
  contentType: ContentType;
  hooks: Hook[];
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
}

export interface ApiResponse {
  hooks: Omit<Hook, "id" | "platform" | "contentType" | "topic" | "createdAt" | "folderId" | "isFavorite">[];
}
