import type {
  BaserowBlog,
  BaserowUser,
  BaserowFile,
  Blog,
  User,
  PaginatedResponse,
  BlogStatus,
  ProjectType,
} from "@/types";

const BASEROW_API_URL = process.env.BASEROW_API_URL || "https://dayta.intelligentb2b.com";
const BASEROW_API_TOKEN = process.env.BASEROW_API_TOKEN || "";

const TABLES = {
  USERS: process.env.BASEROW_USERS_TABLE_ID || "",
  BLOGS: process.env.BASEROW_BLOGS_TABLE_ID || "1346",
};

interface BaserowError {
  error: string;
  detail?: string;
}

class BaserowClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = BASEROW_API_URL;
    this.token = BASEROW_API_TOKEN;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      Authorization: `Token ${this.token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Unknown error",
      }));
      // Handle various error formats from Baserow
      let errorMessage = `HTTP ${response.status}`;
      if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (errorData.detail) {
        errorMessage = typeof errorData.detail === "string"
          ? errorData.detail
          : JSON.stringify(errorData.detail);
      } else if (errorData.error) {
        errorMessage = typeof errorData.error === "string"
          ? errorData.error
          : JSON.stringify(errorData.error);
      } else {
        errorMessage = JSON.stringify(errorData);
      }
      console.error("Baserow API error:", errorMessage, errorData);
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Generic CRUD operations
  async listRows<T>(
    tableId: string,
    params?: {
      filters?: Record<string, unknown>;
      search?: string;
      orderBy?: string;
      page?: number;
      size?: number;
    }
  ): Promise<PaginatedResponse<T>> {
    const searchParams = new URLSearchParams();
    searchParams.set("user_field_names", "true");

    if (params?.search) {
      searchParams.set("search", params.search);
    }

    if (params?.orderBy) {
      searchParams.set("order_by", params.orderBy);
    }

    if (params?.page) {
      searchParams.set("page", params.page.toString());
    }

    if (params?.size) {
      searchParams.set("size", params.size.toString());
    }

    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.set(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/database/rows/table/${tableId}/?${queryString}`;

    return this.request<PaginatedResponse<T>>(endpoint);
  }

  async getRow<T>(tableId: string, rowId: number): Promise<T> {
    return this.request<T>(
      `/api/database/rows/table/${tableId}/${rowId}/?user_field_names=true`
    );
  }

  async createRow<T>(tableId: string, data: Record<string, unknown>): Promise<T> {
    return this.request<T>(
      `/api/database/rows/table/${tableId}/?user_field_names=true`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async updateRow<T>(
    tableId: string,
    rowId: number,
    data: Record<string, unknown>
  ): Promise<T> {
    return this.request<T>(
      `/api/database/rows/table/${tableId}/${rowId}/?user_field_names=true`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  }

  async deleteRow(tableId: string, rowId: number): Promise<void> {
    await this.request(`/api/database/rows/table/${tableId}/${rowId}/`, {
      method: "DELETE",
    });
  }

  // User operations
  async getUserByEmail(email: string): Promise<BaserowUser | null> {
    if (!TABLES.USERS) return null;

    const response = await this.listRows<BaserowUser>(TABLES.USERS, {
      filters: {
        [`filter__email__equal`]: email,
      },
      size: 1,
    });

    return response.results[0] || null;
  }

  async createUser(data: {
    email: string;
    password_hash: string;
    name: string;
  }): Promise<BaserowUser> {
    return this.createRow<BaserowUser>(TABLES.USERS, {
      ...data,
      created_at: new Date().toISOString(),
    });
  }

  async getUserById(userId: number): Promise<BaserowUser | null> {
    if (!TABLES.USERS) return null;

    try {
      return await this.getRow<BaserowUser>(TABLES.USERS, userId);
    } catch {
      return null;
    }
  }

  // Blog operations - NO email filtering (single-tenant mode)
  async getBlogs(
    params?: {
      status?: string;
      project?: string;
      search?: string;
      page?: number;
      size?: number;
      sortNewest?: boolean;
    }
  ): Promise<PaginatedResponse<BaserowBlog>> {
    const filters: Record<string, unknown> = {};

    // Use single_select_equal for STEPS (single_select field)
    if (params?.status) {
      filters[`filter__STEPS__single_select_equal`] = params.status;
    }

    // Use single_select_equal for Project (single_select field)
    if (params?.project) {
      filters[`filter__Project__single_select_equal`] = params.project;
    }

    const size = params?.size || 25;

    // If sortNewest is true, we need to fetch from the end and reverse
    if (params?.sortNewest) {
      // First get total count with filters
      const countResponse = await this.listRows<BaserowBlog>(TABLES.BLOGS, {
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        search: params?.search,
        size: 1,
      });

      const total = countResponse.count;
      if (total === 0) {
        return { count: 0, next: null, previous: null, results: [] };
      }

      // Calculate pages for newest-first pagination
      const totalPages = Math.ceil(total / size);
      const requestedPage = params?.page || 1;
      // Reverse the page: page 1 becomes last page, page 2 becomes second-to-last, etc.
      const reversedPage = totalPages - requestedPage + 1;

      if (reversedPage < 1) {
        return { count: total, next: null, previous: null, results: [] };
      }

      const response = await this.listRows<BaserowBlog>(TABLES.BLOGS, {
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        search: params?.search,
        page: reversedPage,
        size,
      });

      // Reverse results to show newest first
      return {
        ...response,
        results: response.results.reverse(),
        // Adjust pagination flags for reversed order
        next: requestedPage < totalPages ? `page=${requestedPage + 1}` : null,
        previous: requestedPage > 1 ? `page=${requestedPage - 1}` : null,
      };
    }

    return this.listRows<BaserowBlog>(TABLES.BLOGS, {
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      search: params?.search,
      page: params?.page,
      size,
    });
  }

  async getBlogById(blogId: number): Promise<Blog | null> {
    try {
      const blog = await this.getRow<BaserowBlog>(TABLES.BLOGS, blogId);
      return this.transformBlog(blog);
    } catch {
      return null;
    }
  }

  // Get recent blogs (newest first) by fetching from the last page
  async getRecentBlogs(limit: number = 10): Promise<Blog[]> {
    // First get total count
    const countResponse = await this.listRows<BaserowBlog>(TABLES.BLOGS, {
      size: 1,
    });

    const total = countResponse.count;
    if (total === 0) return [];

    // Calculate the last page to get the most recent items
    const lastPage = Math.ceil(total / limit);

    // Fetch the last page
    const response = await this.listRows<BaserowBlog>(TABLES.BLOGS, {
      page: lastPage,
      size: limit,
    });

    // Reverse to show newest first (highest IDs first)
    const blogs = this.transformBlogs(response.results);
    return blogs.reverse();
  }

  async createBlog(
    data: {
      Keywords: string;
      Project: string;
      Language: string;
      Language_Code: string;
      Country_Code: string;
      NTOC: string;
      STEPS: string;
      "Needs Approval?"?: boolean;
      Location?: string;
    }
  ): Promise<Blog> {
    // Map text values to Baserow option IDs for single_select fields
    // These IDs are from the constants.ts file
    const STEPS_MAP: Record<string, number> = {
      "PARKING": 5133, "Parking": 5133, "parking": 5133,
      "Auto Pilot": 5141, "auto pilot": 5141, "AUTO PILOT": 5141,
      "SERP": 5131, "Title": 5132, "Permalink": 5134,
      "Meta Description": 5136, "Introduction": 5135, "TOC": 5137,
      "TL;DR": 5138, "Conclusion": 5139, "Full": 5129,
      "PUBLISH": 5130, "Publish": 5130,
      "COMPLETED": 5140, "Completed": 5140,
      "WAIT": 5145, "Wait": 5145,
      "ATOMA": 5146, "HARLOCK": 5147,
      "Positive": 5142, "Neutral": 5143, "Negative": 5144,
    };

    const PROJECT_MAP: Record<string, number> = {
      "Intelligent B2B": 5148,
      "Letsportogether": 5149,
      "Fabio Marenghi": 5150,
      "One Travel Lover": 5151,
      "ATOMA": 5152,
      "HARLOCK": 5153,
      "PARKING": 5154,
      "999kmh": 5263,
      "mindenergy": 5499,
      "belotti": 5659,
      "Techstyle": 5672,
    };

    // Build the payload - use IDs for STEPS and Project, text for others
    // Get today's date in YYYY-MM-DD format for Baserow date field
    const today = new Date().toISOString().split("T")[0];

    const payload: Record<string, unknown> = {
      Keywords: data.Keywords,
      Project: PROJECT_MAP[data.Project] || data.Project,
      STEPS: STEPS_MAP[data.STEPS] || data.STEPS,
      // These might be text fields or have different IDs - try text first
      Language: data.Language,
      Language_Code: data.Language_Code,
      Country_Code: data.Country_Code,
      NTOC: data.NTOC,
      // Auto-set creation date
      Created_At: today,
      // Needs Approval flag
      "Needs Approval?": data["Needs Approval?"] || false,
      // Location field
      Location: data.Location || "",
    };

    console.log("Creating blog with payload:", JSON.stringify(payload, null, 2));

    const blog = await this.createRow<BaserowBlog>(TABLES.BLOGS, payload);
    return this.transformBlog(blog);
  }

  async updateBlog(
    blogId: number,
    data: Record<string, unknown>
  ): Promise<Blog | null> {
    try {
      const updated = await this.updateRow<BaserowBlog>(TABLES.BLOGS, blogId, data);
      return this.transformBlog(updated);
    } catch {
      return null;
    }
  }

  async deleteBlog(blogId: number): Promise<boolean> {
    try {
      await this.deleteRow(TABLES.BLOGS, blogId);
      return true;
    } catch {
      return false;
    }
  }

  async getBlogStats(): Promise<{
    total: number;
    completed: number;
    autopilot: number;
    parking: number;
    publish: number;
    inProgress: number;
  }> {
    // Status IDs from Baserow
    const STATUS_IDS = {
      COMPLETED: "5140",
      AUTO_PILOT: "5141",
      PARKING: "5133",
      PUBLISH: "5130",
      // In-progress statuses (SERP, Title, Permalink, Meta Desc, Intro, TOC, TL;DR, Conclusion, Full)
      IN_PROGRESS: ["5131", "5132", "5134", "5136", "5135", "5137", "5138", "5139", "5129"],
    };

    // Get stats using option IDs
    const [total, completed, autopilot, parking, publish, ...inProgressResults] = await Promise.all([
      this.listRows<BaserowBlog>(TABLES.BLOGS, {
        size: 1,
      }),
      this.listRows<BaserowBlog>(TABLES.BLOGS, {
        filters: {
          [`filter__STEPS__single_select_equal`]: STATUS_IDS.COMPLETED,
        },
        size: 1,
      }),
      this.listRows<BaserowBlog>(TABLES.BLOGS, {
        filters: {
          [`filter__STEPS__single_select_equal`]: STATUS_IDS.AUTO_PILOT,
        },
        size: 1,
      }),
      this.listRows<BaserowBlog>(TABLES.BLOGS, {
        filters: {
          [`filter__STEPS__single_select_equal`]: STATUS_IDS.PARKING,
        },
        size: 1,
      }),
      this.listRows<BaserowBlog>(TABLES.BLOGS, {
        filters: {
          [`filter__STEPS__single_select_equal`]: STATUS_IDS.PUBLISH,
        },
        size: 1,
      }),
      // Count each in-progress status
      ...STATUS_IDS.IN_PROGRESS.map(id =>
        this.listRows<BaserowBlog>(TABLES.BLOGS, {
          filters: {
            [`filter__STEPS__single_select_equal`]: id,
          },
          size: 1,
        })
      ),
    ]);

    // Sum up all in-progress counts
    const inProgressCount = inProgressResults.reduce((sum, result) => sum + result.count, 0);

    return {
      total: total.count,
      completed: completed.count,
      autopilot: autopilot.count,
      parking: parking.count,
      publish: publish.count,
      inProgress: inProgressCount,
    };
  }

  // Get unique projects
  async getProjects(): Promise<string[]> {
    const response = await this.listRows<BaserowBlog>(TABLES.BLOGS, {
      size: 200,
    });

    const projects = new Set<string>();
    response.results.forEach((blog) => {
      if (blog.Project?.value) {
        projects.add(blog.Project.value);
      }
    });

    return Array.from(projects);
  }

  async getProjectCount(): Promise<number> {
    const projects = await this.getProjects();
    return projects.length;
  }

  // Helper to extract URL from Baserow file field
  private extractImageUrl(field: BaserowFile[] | string | null | undefined): string | null {
    if (!field) return null;
    // If it's a string (URL), return it directly
    if (typeof field === "string") {
      return field || null;
    }
    // If it's an array of file objects, get the first file's URL
    if (Array.isArray(field) && field.length > 0) {
      return field[0].url || null;
    }
    return null;
  }

  // Helper to find image field by pattern (handles "image 1", "image 1 (13300)", etc.)
  private findImageField(blog: Record<string, unknown>, imageNum: number): BaserowFile[] | string | null {
    // Try exact match first
    const exactKey = `image ${imageNum}`;
    if (blog[exactKey] !== undefined) {
      return blog[exactKey] as BaserowFile[] | string | null;
    }
    // Search for field with ID suffix like "image 1 (13300)"
    for (const key of Object.keys(blog)) {
      if (key.startsWith(`image ${imageNum} (`)) {
        return blog[key] as BaserowFile[] | string | null;
      }
    }
    return null;
  }

  // Helper to find field by name pattern (handles fields with ID suffix)
  private findFieldByPattern(blog: Record<string, unknown>, fieldName: string): string | null {
    // Try exact match first
    if (blog[fieldName] !== undefined && blog[fieldName] !== null) {
      return String(blog[fieldName]);
    }
    // Search for field with ID suffix like "images URL (12345)"
    for (const key of Object.keys(blog)) {
      if (key.startsWith(`${fieldName} (`)) {
        return blog[key] !== null ? String(blog[key]) : null;
      }
    }
    return null;
  }

  // Transform functions
  private transformBlog(blog: BaserowBlog): Blog {
    return {
      id: blog.id,
      order: blog.order || "",
      Keywords: blog.Keywords || "",
      STEPS: (blog.STEPS?.value as BlogStatus) || "PARKING",
      Project: (blog.Project?.value as ProjectType) || "Intelligent B2B",
      Language: blog.Language?.value || "",
      Country_Code: blog.Country_Code?.value || "",
      Language_Code: blog.Language_Code?.value || "",
      Niche: blog.Niche?.map((n) => n.value) || [],
      NTOC: blog.NTOC?.value || "",
      "Article Category": blog["Article Category"] || "",
      TITLE: blog.TITLE || "",
      Permalink: blog.Permalink || "",
      "META DESC": blog["META DESC"] || "",
      INTRODUCTION: blog.INTRODUCTION || "",
      "KW CLUSTER": blog["KW CLUSTER"] || "",
      TOC: blog.TOC || "",
      "TL;DR": blog["TL;DR"] || "",
      CONCLUSION: blog.CONCLUSION || "",
      "Section 1": blog["Section 1"] || "",
      "Section 2": blog["Section 2"] || "",
      "Section 3": blog["Section 3"] || "",
      "Section 4": blog["Section 4"] || "",
      "Section 5": blog["Section 5"] || "",
      "Section 6": blog["Section 6"] || "",
      "Section 7": blog["Section 7"] || "",
      FAQ: blog.FAQ || "",
      "Schema Markup": blog["Schema Markup"] || "",
      BODY: blog.BODY || "",
      "images URL": this.findFieldByPattern(blog as unknown as Record<string, unknown>, "images URL") || "",
      "image 1": this.extractImageUrl(this.findImageField(blog as unknown as Record<string, unknown>, 1)),
      "image 2": this.extractImageUrl(this.findImageField(blog as unknown as Record<string, unknown>, 2)),
      "image 3": this.extractImageUrl(this.findImageField(blog as unknown as Record<string, unknown>, 3)),
      "image 4": this.extractImageUrl(this.findImageField(blog as unknown as Record<string, unknown>, 4)),
      "Client Email": blog["Client Email"] || "",
      "Business Hook?": blog["Business Hook?"] || false,
      Location: blog.Location || "",
      Blog_ID: blog.Blog_ID || "",
      "Needs Approval?": blog["Needs Approval?"] || false,
      Created_At: blog.Created_At || undefined,
    };
  }

  transformBlogs(blogs: BaserowBlog[]): Blog[] {
    return blogs.map((blog) => this.transformBlog(blog));
  }
}

export const baserow = new BaserowClient();
