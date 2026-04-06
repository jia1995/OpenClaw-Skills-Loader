export interface SkillInfo {
  name: string;
  path: string;
  description: string;
  content?: string;
}

export interface SkillsListResponse {
  skills: SkillInfo[];
  error?: string;
}

export interface SkillContentResponse {
  name: string;
  content: string;
  error?: string;
}

export interface SkillsLoaderConfig {
  skillsPaths: string[];
  gatewayUrl: string;
  authToken?: string;
}
