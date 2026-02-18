// STEPS (status) values from your Baserow - value is the option ID for filtering
export const BLOG_STATUSES = [
  { value: "5133", label: "Parking", color: "bg-red-500" },
  { value: "5141", label: "Auto Pilot", color: "bg-gray-500" },
  { value: "5131", label: "SERP", color: "bg-green-500" },
  { value: "5132", label: "Title", color: "bg-yellow-500" },
  { value: "5134", label: "Permalink", color: "bg-orange-500" },
  { value: "5136", label: "Meta Description", color: "bg-blue-500" },
  { value: "5135", label: "Introduction", color: "bg-red-400" },
  { value: "5137", label: "TOC", color: "bg-purple-500" },
  { value: "5138", label: "TL;DR", color: "bg-cyan-500" },
  { value: "5139", label: "Conclusion", color: "bg-gray-400" },
  { value: "5129", label: "Full", color: "bg-blue-600" },
  { value: "5130", label: "Publish", color: "bg-pink-500" },
  { value: "5140", label: "Completed", color: "bg-green-600" },
  { value: "5142", label: "Positive", color: "bg-green-700" },
  { value: "5143", label: "Neutral", color: "bg-yellow-600" },
  { value: "5144", label: "Negative", color: "bg-red-600" },
  { value: "5145", label: "Wait", color: "bg-purple-600" },
  { value: "5146", label: "ATOMA", color: "bg-blue-400" },
  { value: "5147", label: "HARLOCK", color: "bg-cyan-400" },
] as const;

// Map STEPS ID to name for display/logic
export const STEPS_ID_TO_NAME: Record<string, string> = {
  "5133": "PARKING",
  "5141": "Auto Pilot",
  "5131": "SERP",
  "5132": "Title",
  "5134": "Permalink",
  "5136": "Meta Description",
  "5135": "Introduction",
  "5137": "TOC",
  "5138": "TL;DR",
  "5139": "Conclusion",
  "5129": "Full",
  "5130": "PUBLISH",
  "5140": "COMPLETED",
  "5142": "Positive",
  "5143": "Neutral",
  "5144": "Negative",
  "5145": "WAIT",
  "5146": "ATOMA",
  "5147": "HARLOCK",
};

// Map STEPS name to ID for lookups
export const STEPS_NAME_TO_ID: Record<string, string> = {
  "PARKING": "5133",
  "Auto Pilot": "5141",
  "SERP": "5131",
  "Title": "5132",
  "Permalink": "5134",
  "Meta Description": "5136",
  "Introduction": "5135",
  "TOC": "5137",
  "TL;DR": "5138",
  "Conclusion": "5139",
  "Full": "5129",
  "PUBLISH": "5130",
  "COMPLETED": "5140",
  "Positive": "5142",
  "Neutral": "5143",
  "Negative": "5144",
  "WAIT": "5145",
  "ATOMA": "5146",
  "HARLOCK": "5147",
};

// User-editable statuses (text names for comparison with transformed blog data)
export const USER_EDITABLE_STATUSES = ["PARKING", "Auto Pilot", "PUBLISH", "WAIT"] as const;

// User-editable statuses as IDs (for API filtering if needed)
export const USER_EDITABLE_STATUS_IDS = ["5133", "5141", "5130", "5145"] as const;

// Generation step order for progress tracking
export const GENERATION_STEP_ORDER = [
  "Auto Pilot",
  "SERP",
  "Title",
  "Permalink",
  "Meta Description",
  "Introduction",
  "TOC",
  "TL;DR",
  "Conclusion",
  "Full",
] as const;

// Steps that indicate active content generation
export const ACTIVE_GENERATION_STEPS = [
  "Auto Pilot",
  "SERP",
  "Title",
  "Permalink",
  "Meta Description",
  "Introduction",
  "TOC",
  "TL;DR",
  "Conclusion",
  "Full",
] as const;

// Projects from your Baserow - value is the option ID for filtering
export const PROJECTS = [
  { value: "5148", label: "Intelligent B2B", color: "dark-red" },
  { value: "5149", label: "Letsportogether", color: "light-blue" },
  { value: "5150", label: "Fabio Marenghi", color: "light-cyan" },
  { value: "5151", label: "One Travel Lover", color: "light-pink" },
  { value: "5152", label: "ATOMA", color: "light-green" },
  { value: "5153", label: "HARLOCK", color: "light-yellow" },
  { value: "5154", label: "PARKING", color: "light-blue" },
  { value: "5263", label: "999kmh", color: "pink" },
  { value: "5499", label: "mindenergy", color: "darker-yellow" },
  { value: "5659", label: "belotti", color: "yellow" },
  { value: "5672", label: "Techstyle", color: "darker-purple" },
] as const;

// Map project ID to name for display purposes
export const PROJECT_ID_TO_NAME: Record<string, string> = {
  "5148": "Intelligent B2B",
  "5149": "Letsportogether",
  "5150": "Fabio Marenghi",
  "5151": "One Travel Lover",
  "5152": "ATOMA",
  "5153": "HARLOCK",
  "5154": "PARKING",
  "5263": "999kmh",
  "5499": "mindenergy",
  "5659": "belotti",
  "5672": "Techstyle",
};

// Map project name to ID for lookups
export const PROJECT_NAME_TO_ID: Record<string, string> = {
  "Intelligent B2B": "5148",
  "Letsportogether": "5149",
  "Fabio Marenghi": "5150",
  "One Travel Lover": "5151",
  "ATOMA": "5152",
  "HARLOCK": "5153",
  "PARKING": "5154",
  "999kmh": "5263",
  "mindenergy": "5499",
  "belotti": "5659",
  "Techstyle": "5672",
};

// Languages from your Baserow
export const LANGUAGES = [
  { value: "English", label: "English", code: "en" },
  { value: "Italian", label: "Italian", code: "it" },
  { value: "French", label: "French", code: "fr" },
  { value: "German", label: "German", code: "de" },
  { value: "Arabic", label: "Arabic", code: "ar" },
  { value: "Spanish", label: "Spanish", code: "es" },
  { value: "polish", label: "Polish", code: "pl" },
  { value: "turkish", label: "Turkish", code: "tr" },
] as const;

// Country codes
export const COUNTRY_CODES = [
  { value: "us", label: "United States" },
  { value: "it", label: "Italy" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "es", label: "Spain" },
  { value: "ma", label: "Morocco" },
  { value: "at", label: "Austria" },
] as const;

// NTOC (Number of TOC sections)
export const NTOC_OPTIONS = [
  { value: "3", label: "3 Sections" },
  { value: "4", label: "4 Sections" },
  { value: "5", label: "5 Sections" },
  { value: "6", label: "6 Sections" },
  { value: "7", label: "7 Sections" },
  { value: "8", label: "8 Sections" },
  { value: "9", label: "9 Sections" },
  { value: "10", label: "10 Sections" },
] as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/",
  BLOGS: "/blogs",
  BLOG_NEW: "/blogs/new",
  BLOG_EDIT: (id: number) => `/blogs/${id}/edit`,
  BLOG_VIEW: (id: number) => `/blogs/${id}`,
  KEYWORDS: "/keywords",
  PROJECTS: "/projects",
} as const;

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },
  BLOGS: "/api/blogs",
  BLOG: (id: number) => `/api/blogs/${id}`,
  KEYWORDS_BULK: "/api/keywords/bulk",
  PROJECTS: "/api/projects",
  STATS: "/api/stats",
} as const;
