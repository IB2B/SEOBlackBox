// User types (using Client Email for identification)
export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

// Blog STEPS (status) values from Baserow
export type BlogStatus =
  | "PARKING"
  | "Auto Pilot"
  | "SERP"
  | "Title"
  | "Permalink"
  | "Meta Description"
  | "Introduction"
  | "TOC"
  | "Full"
  | "PUBLISH"
  | "COMPLETED"
  | "Positive"
  | "Neutral"
  | "Negative"
  | "WAIT"
  | "ATOMA"
  | "HARLOCK"
  | "TL;DR"
  | "Conclusion";

// Project values from Baserow
export type ProjectType =
  | "Intelligent B2B"
  | "Letsportogether"
  | "Fabio Marenghi"
  | "One Travel Lover"
  | "ATOMA"
  | "HARLOCK"
  | "PARKING"
  | "999kmh"
  | "mindenergy"
  | "belotti"
  | "Techstyle";

// Blog types matching your Baserow structure
export interface Blog {
  id: number;
  Keywords: string;
  STEPS: BlogStatus;
  Project: ProjectType;
  Language: string;
  Country_Code: string;
  Language_Code: string;
  Niche: string[];
  NTOC: string;
  "Article Category": string;
  TITLE: string;
  Permalink: string;
  "META DESC": string;
  INTRODUCTION: string;
  "KW CLUSTER": string;
  TOC: string;
  "TL;DR": string;
  CONCLUSION: string;
  "Section 1": string;
  "Section 2": string;
  "Section 3": string;
  "Section 4": string;
  "Section 5": string;
  "Section 6": string;
  "Section 7": string;
  FAQ: string;
  "Schema Markup": string;
  BODY: string;
  "images URL": string;
  "image 1": string | null;
  "image 2": string | null;
  "image 3": string | null;
  "image 4": string | null;
  // Alternative field names with IDs (Baserow format)
  "image 1 (13300)"?: string | null;
  "image 2 (13301)"?: string | null;
  "image 3 (13302)"?: string | null;
  "image 4 (13303)"?: string | null;
  "Client Email": string;
  "Business Hook?": boolean;
  Location: string;
  Blog_ID: string;
  "Needs Approval?": boolean;
  order: string;
  // Date tracking field
  Created_At?: string;
}

export interface CreateBlogInput {
  Keywords: string;
  Project: ProjectType;
  Language: string;
  Language_Code: string;
  Country_Code: string;
  NTOC?: string;
  STEPS: "PARKING" | "Auto Pilot";
  "Client Email"?: string;
}

export interface UpdateBlogInput {
  TITLE?: string;
  INTRODUCTION?: string;
  CONCLUSION?: string;
  "TL;DR"?: string;
  "Section 1"?: string;
  "Section 2"?: string;
  "Section 3"?: string;
  "Section 4"?: string;
  "Section 5"?: string;
  "Section 6"?: string;
  "Section 7"?: string;
  FAQ?: string;
  Permalink?: string;
  "META DESC"?: string;
  "images URL"?: string;
  "image 1"?: string;
  "image 2"?: string;
  "image 3"?: string;
  "image 4"?: string;
  BODY?: string;
  STEPS?: BlogStatus;
  "Needs Approval?"?: boolean;
  "Article Category"?: string;
  Niche?: string[];
}

// Project/Site type (from single_select)
export interface Project {
  id: number;
  value: ProjectType;
  color: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface JWTPayload {
  userId: number;
  email: string;
  exp?: number;
  iat?: number;
}

// Dashboard stats
export interface DashboardStats {
  totalBlogs: number;
  completedBlogs: number;
  autopilotBlogs: number;
  parkingBlogs: number;
  publishBlogs: number;
  inProgressBlogs: number;
  projects: number;
}

// Baserow file field type
export interface BaserowFile {
  url: string;
  visible_name: string;
  name: string;
  size: number;
  mime_type: string;
  is_image: boolean;
  image_width?: number;
  image_height?: number;
  thumbnails?: {
    tiny?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
  };
}

// Baserow field mapping
export interface BaserowBlog {
  id: number;
  order: string;
  Keywords: string;
  STEPS: { id: number; value: string; color: string } | null;
  Project: { id: number; value: string; color: string } | null;
  Language: { id: number; value: string; color: string } | null;
  Country_Code: { id: number; value: string; color: string } | null;
  Language_Code: { id: number; value: string; color: string } | null;
  Niche: Array<{ id: number; value: string; color: string }>;
  NTOC: { id: number; value: string; color: string } | null;
  "Article Category": string;
  TITLE: string;
  Permalink: string;
  "META DESC": string;
  INTRODUCTION: string;
  "KW CLUSTER": string;
  TOC: string;
  "TL;DR": string;
  CONCLUSION: string;
  "Section 1": string;
  "Section 2": string;
  "Section 3": string;
  "Section 4": string;
  "Section 5": string;
  "Section 6": string;
  "Section 7": string;
  FAQ: string;
  "Schema Markup": string;
  BODY: string;
  "images URL": string;
  "image 1"?: BaserowFile[] | string | null;
  "image 2"?: BaserowFile[] | string | null;
  "image 3"?: BaserowFile[] | string | null;
  "image 4"?: BaserowFile[] | string | null;
  // Alternative field names with IDs (Baserow format)
  "image 1 (13300)"?: BaserowFile[] | string | null;
  "image 2 (13301)"?: BaserowFile[] | string | null;
  "image 3 (13302)"?: BaserowFile[] | string | null;
  "image 4 (13303)"?: BaserowFile[] | string | null;
  "Client Email": string;
  "Business Hook?": boolean;
  Location: string;
  Blog_ID: string;
  "Needs Approval?": boolean;
  // Date tracking - can be date field or text field in Baserow
  Created_At?: string;
}

export interface BaserowUser {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
}
