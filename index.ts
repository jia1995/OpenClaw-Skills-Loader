import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { scanSkills, getSkillContent } from "./skills-scanner";
import type { SkillsListResponse, SkillContentResponse } from "./types";

const skillsLoaderPlugin = {
  id: "openclaw-skills-loader",
  name: "Skills Loader",
  description: "Load local skills into the frontend input box",

  register(api: any) {
    api.registerHttpRoute({
      path: "/plugins/skills-loader/list",
      auth: "plugin",
      handler: async (req: any, res: any) => {
        try {
          let customPaths: string[] | undefined;
          
          try {
            const config = api.getPluginConfig?.();
            customPaths = config?.skillsPaths;
            api.logger?.info?.(`Skills Loader config: paths=${JSON.stringify(customPaths)}`);
          } catch (e) {
            api.logger?.warn?.(`Failed to read plugin config: ${e}`);
          }
          
          const skills = await scanSkills(customPaths);

          const response: SkillsListResponse = { skills };
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(response));
        } catch (error) {
          const response: SkillsListResponse = {
            skills: [],
            error: (error as Error).message,
          };
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify(response));
        }
      },
    });

    api.registerHttpRoute({
      path: "/plugins/skills-loader/content",
      auth: "plugin",
      handler: async (req: any, res: any) => {
        try {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const skillName = url.searchParams.get("name");
          if (!skillName) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Skill name is required" }));
            return;
          }

          const config = api.getPluginConfig?.() as any;
          const customPaths = config?.skillsPaths;
          const skills = await scanSkills(customPaths);
          const skill = skills.find((s) => s.name === skillName);

          if (!skill) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: `Skill '${skillName}' not found` }));
            return;
          }

          const content = await getSkillContent(
            `${skill.path}/SKILL.md`,
          );

          if (!content) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ error: `Failed to read SKILL.md for '${skillName}'` }),
            );
            return;
          }

          const response: SkillContentResponse = { name: skillName, content };
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(response));
        } catch (error) {
          const response: SkillContentResponse = {
            name: "",
            content: "",
            error: (error as Error).message,
          };
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify(response));
        }
      },
    });
  },
};

export default skillsLoaderPlugin;
