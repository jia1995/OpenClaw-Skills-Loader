import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import type { SkillInfo } from "./types";

const DEFAULT_SKILLS_PATHS = [
  // User's home directory
  process.platform === "win32"
    ? join(process.env.USERPROFILE || "", ".agents", "skills")
    : join(process.env.HOME || "", ".agents", "skills"),
  // Common workspace locations
  "F:\\openclawWorkspace\\.agents\\skills",
  "F:\\openclawWorkspace\\skills",
];

export async function scanSkills(
  customPaths?: string[],
): Promise<SkillInfo[]> {
  const searchPaths = customPaths && customPaths.length > 0
    ? customPaths
    : DEFAULT_SKILLS_PATHS;
  const skills: SkillInfo[] = [];
  const seen = new Set<string>();

  for (const basePath of searchPaths) {
    if (!existsSync(basePath)) continue;
    await scanDirectory(basePath, skills, seen);
  }

  return skills;
}

async function scanDirectory(dir: string, skills: SkillInfo[], seen: Set<string>): Promise<void> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;

      const fullPath = join(dir, entry.name);
      const realPath = fullPath.toLowerCase();

      if (seen.has(realPath)) continue;
      seen.add(realPath);

      if (entry.isDirectory()) {
        const skillMdPath = join(fullPath, "SKILL.md");
        if (existsSync(skillMdPath)) {
          const description = await extractSkillDescription(skillMdPath);
          skills.push({
            name: entry.name,
            path: fullPath,
            description,
          });
        }
        await scanDirectory(fullPath, skills, seen);
      }
    }
  } catch (err) {
    // Silently skip unreadable directories
  }
}

async function extractSkillDescription(filePath: string): Promise<string> {
  try {
    const content = await readFile(filePath, "utf-8");
    const firstLines = content.split("\n").slice(0, 10).join("\n");
    const titleMatch = firstLines.match(/^#\s+(.+)$/m);
    const descMatch = firstLines.match(
      /^(?:description|Description):\s*(.+)$/im,
    );

    if (descMatch) return descMatch[1].trim();
    if (titleMatch) return titleMatch[1].trim();
    return "No description available";
  } catch {
    return "Failed to read skill";
  }
}

export async function getSkillContent(
  skillPath: string,
): Promise<string | null> {
  try {
    const content = await readFile(skillPath, "utf-8");
    return content;
  } catch {
    return null;
  }
}
