var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// api/saveData.js
var saveData_exports = {};
__export(saveData_exports, {
  default: () => handler
});
async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }
  const { collection, data, password } = request.body;
  const { GITHUB_TOKEN, ADMIN_PASSWORD } = process.env;
  if (ADMIN_PASSWORD && password !== ADMIN_PASSWORD) {
    return response.status(401).json({ error: "Unauthorized" });
  }
  if (!GITHUB_TOKEN) {
    return response.status(500).json({ error: "GitHub Token not configured" });
  }
  if (!collection || !data) {
    return response.status(400).json({ error: "Collection and Data are required" });
  }
  const fileMap = {
    "posts": "src/data/posts.json",
    "reels": "src/data/reels.json",
    "arts": "src/data/arts.json",
    "quotes": "src/data/quotes.json",
    "profile": "src/data/profile.json",
    "stories": "src/data/stories.json",
    "archived": "src/data/archived.json",
    "dm_chats": "src/data/dm_chats.json",
    "blog": "src/data/blog.json",
    "articles": "src/data/articles.json",
    "essays": "src/data/essays.json",
    "short_stories": "src/data/short_stories.json",
    "poems": "src/data/poems.json",
    "thoughts": "src/data/thoughts.json",
    "diary": "src/data/diary.json"
  };
  const filePath = fileMap[collection];
  if (!filePath) {
    return response.status(400).json({ error: "Invalid collection" });
  }
  const OWNER = "ElvanParthasarathy";
  const REPO = "Elvan";
  const BRANCH = "main";
  try {
    const fileResponse = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    );
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
    }
    const fileData = await fileResponse.json();
    const sha = fileData.sha;
    const contentString = JSON.stringify(data, null, 2);
    const contentBase64 = Buffer.from(contentString).toString("base64");
    const updateResponse = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Update ${collection} via CMS Admin`,
          content: contentBase64,
          sha,
          branch: BRANCH
        })
      }
    );
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error("GitHub API Update Error:", errorText);
      throw new Error(`Failed to update file: ${updateResponse.statusText}`);
    }
    return response.status(200).json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
var init_saveData = __esm({
  "api/saveData.js"() {
  }
});

// vite.config.ts
import { defineConfig, loadEnv } from "file:///D:/Projects/Navil/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Projects/Navil/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///D:/Projects/Navil/node_modules/@tailwindcss/vite/dist/index.mjs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
var __vite_injected_original_import_meta_url = "file:///D:/Projects/Navil/vite.config.ts";
var __filename = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname = dirname(__filename);
var vercelAdapter = async (req, res, handler2) => {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const data = Buffer.concat(buffers).toString();
  try {
    req.body = JSON.parse(data);
  } catch {
    req.body = {};
  }
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data2) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data2));
    return res;
  };
  await handler2(req, res);
};
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env = { ...process.env, ...env };
  return {
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
          admin: resolve(__dirname, "admin.html")
        }
      }
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "local-api-server",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === "/api/saveData" && req.method === "POST") {
              try {
                console.log("Intercepting /api/saveData locally...");
                const { default: handler2 } = await Promise.resolve().then(() => (init_saveData(), saveData_exports));
                await vercelAdapter(req, res, handler2);
              } catch (error) {
                console.error("Local API Error:", error);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: "Internal Local Server Error" }));
              }
            } else {
              next();
            }
          });
        }
      },
      {
        name: "admin-spa-fallback",
        configureServer(server) {
          return () => {
            server.middlewares.use(async (req, res, next) => {
              if (req.url && (req.url === "/admin" || req.url.startsWith("/admin/") || req.url.startsWith("/admin?"))) {
                const { readFileSync } = await import("fs");
                const htmlPath = resolve(__dirname, "admin.html");
                let html = readFileSync(htmlPath, "utf-8");
                html = await server.transformIndexHtml(req.url, html);
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                res.end(html);
              } else {
                next();
              }
            });
          };
        }
      }
    ]
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiYXBpL3NhdmVEYXRhLmpzIiwgInZpdGUuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcUHJvamVjdHNcXFxcTmF2aWxcXFxcYXBpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQcm9qZWN0c1xcXFxOYXZpbFxcXFxhcGlcXFxcc2F2ZURhdGEuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1Byb2plY3RzL05hdmlsL2FwaS9zYXZlRGF0YS5qc1wiO1xyXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcXVlc3QsIHJlc3BvbnNlKSB7XHJcbiAgICBpZiAocmVxdWVzdC5tZXRob2QgIT09ICdQT1NUJykge1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5zdGF0dXMoNDA1KS5qc29uKHsgZXJyb3I6ICdNZXRob2Qgbm90IGFsbG93ZWQnIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgY29sbGVjdGlvbiwgZGF0YSwgcGFzc3dvcmQgfSA9IHJlcXVlc3QuYm9keTtcclxuICAgIGNvbnN0IHsgR0lUSFVCX1RPS0VOLCBBRE1JTl9QQVNTV09SRCB9ID0gcHJvY2Vzcy5lbnY7XHJcblxyXG4gICAgLy8gT3B0aW9uYWwgU2VjdXJpdHkgQ2hlY2tcclxuICAgIGlmIChBRE1JTl9QQVNTV09SRCAmJiBwYXNzd29yZCAhPT0gQURNSU5fUEFTU1dPUkQpIHtcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2Uuc3RhdHVzKDQwMSkuanNvbih7IGVycm9yOiAnVW5hdXRob3JpemVkJyB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIUdJVEhVQl9UT0tFTikge1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6ICdHaXRIdWIgVG9rZW4gbm90IGNvbmZpZ3VyZWQnIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghY29sbGVjdGlvbiB8fCAhZGF0YSkge1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5zdGF0dXMoNDAwKS5qc29uKHsgZXJyb3I6ICdDb2xsZWN0aW9uIGFuZCBEYXRhIGFyZSByZXF1aXJlZCcgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTWFwIGNvbGxlY3Rpb24gdG8gZmlsZSBwYXRoXHJcbiAgICBjb25zdCBmaWxlTWFwID0ge1xyXG4gICAgICAgICdwb3N0cyc6ICdzcmMvZGF0YS9wb3N0cy5qc29uJyxcclxuICAgICAgICAncmVlbHMnOiAnc3JjL2RhdGEvcmVlbHMuanNvbicsXHJcbiAgICAgICAgJ2FydHMnOiAnc3JjL2RhdGEvYXJ0cy5qc29uJyxcclxuICAgICAgICAncXVvdGVzJzogJ3NyYy9kYXRhL3F1b3Rlcy5qc29uJyxcclxuICAgICAgICAncHJvZmlsZSc6ICdzcmMvZGF0YS9wcm9maWxlLmpzb24nLFxyXG4gICAgICAgICdzdG9yaWVzJzogJ3NyYy9kYXRhL3N0b3JpZXMuanNvbicsXHJcbiAgICAgICAgJ2FyY2hpdmVkJzogJ3NyYy9kYXRhL2FyY2hpdmVkLmpzb24nLFxyXG4gICAgICAgICdkbV9jaGF0cyc6ICdzcmMvZGF0YS9kbV9jaGF0cy5qc29uJyxcclxuICAgICAgICAnYmxvZyc6ICdzcmMvZGF0YS9ibG9nLmpzb24nLFxyXG4gICAgICAgICdhcnRpY2xlcyc6ICdzcmMvZGF0YS9hcnRpY2xlcy5qc29uJyxcclxuICAgICAgICAnZXNzYXlzJzogJ3NyYy9kYXRhL2Vzc2F5cy5qc29uJyxcclxuICAgICAgICAnc2hvcnRfc3Rvcmllcyc6ICdzcmMvZGF0YS9zaG9ydF9zdG9yaWVzLmpzb24nLFxyXG4gICAgICAgICdwb2Vtcyc6ICdzcmMvZGF0YS9wb2Vtcy5qc29uJyxcclxuICAgICAgICAndGhvdWdodHMnOiAnc3JjL2RhdGEvdGhvdWdodHMuanNvbicsXHJcbiAgICAgICAgJ2RpYXJ5JzogJ3NyYy9kYXRhL2RpYXJ5Lmpzb24nXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGZpbGVQYXRoID0gZmlsZU1hcFtjb2xsZWN0aW9uXTtcclxuICAgIGlmICghZmlsZVBhdGgpIHtcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2Uuc3RhdHVzKDQwMCkuanNvbih7IGVycm9yOiAnSW52YWxpZCBjb2xsZWN0aW9uJyB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBPV05FUiA9ICdFbHZhblBhcnRoYXNhcmF0aHknO1xyXG4gICAgY29uc3QgUkVQTyA9ICdFbHZhbic7XHJcbiAgICBjb25zdCBCUkFOQ0ggPSAnbWFpbic7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICAvLyAxLiBHZXQgY3VycmVudCBmaWxlICh0byBnZXQgU0hBKVxyXG4gICAgICAgIGNvbnN0IGZpbGVSZXNwb25zZSA9IGF3YWl0IGZldGNoKFxyXG4gICAgICAgICAgICBgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy8ke09XTkVSfS8ke1JFUE99L2NvbnRlbnRzLyR7ZmlsZVBhdGh9P3JlZj0ke0JSQU5DSH1gLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke0dJVEhVQl9UT0tFTn1gLFxyXG4gICAgICAgICAgICAgICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL3ZuZC5naXRodWIudjMranNvbicsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCFmaWxlUmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgLy8gSWYgZmlsZSBkb2Vzbid0IGV4aXN0LCB3ZSBtaWdodCB3YW50IHRvIGNyZWF0ZSBpdCwgYnV0IGZvciBub3cgZXJyb3Igb3V0IGFzIHRoZXNlIHNob3VsZCBleGlzdFxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBmZXRjaCBmaWxlOiAke2ZpbGVSZXNwb25zZS5zdGF0dXNUZXh0fWApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZmlsZURhdGEgPSBhd2FpdCBmaWxlUmVzcG9uc2UuanNvbigpO1xyXG4gICAgICAgIGNvbnN0IHNoYSA9IGZpbGVEYXRhLnNoYTtcclxuXHJcbiAgICAgICAgLy8gMi4gUHJlcGFyZSBuZXcgY29udGVudFxyXG4gICAgICAgIC8vIGRhdGEgaXMgZXhwZWN0ZWQgdG8gYmUgdGhlIEZVTEwgbmV3IGNvbnRlbnRcclxuICAgICAgICBjb25zdCBjb250ZW50U3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMik7XHJcbiAgICAgICAgY29uc3QgY29udGVudEJhc2U2NCA9IEJ1ZmZlci5mcm9tKGNvbnRlbnRTdHJpbmcpLnRvU3RyaW5nKCdiYXNlNjQnKTtcclxuXHJcbiAgICAgICAgLy8gMy4gVXBkYXRlIGZpbGVcclxuICAgICAgICBjb25zdCB1cGRhdGVSZXNwb25zZSA9IGF3YWl0IGZldGNoKFxyXG4gICAgICAgICAgICBgaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy8ke09XTkVSfS8ke1JFUE99L2NvbnRlbnRzLyR7ZmlsZVBhdGh9YCxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7R0lUSFVCX1RPS0VOfWAsXHJcbiAgICAgICAgICAgICAgICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vdm5kLmdpdGh1Yi52Mytqc29uJyxcclxuICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgVXBkYXRlICR7Y29sbGVjdGlvbn0gdmlhIENNUyBBZG1pbmAsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogY29udGVudEJhc2U2NCxcclxuICAgICAgICAgICAgICAgICAgICBzaGE6IHNoYSxcclxuICAgICAgICAgICAgICAgICAgICBicmFuY2g6IEJSQU5DSCxcclxuICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCF1cGRhdGVSZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCB1cGRhdGVSZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0dpdEh1YiBBUEkgVXBkYXRlIEVycm9yOicsIGVycm9yVGV4dCk7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIHVwZGF0ZSBmaWxlOiAke3VwZGF0ZVJlc3BvbnNlLnN0YXR1c1RleHR9YCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzcG9uc2Uuc3RhdHVzKDIwMCkuanNvbih7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcblxyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdBUEkgRXJyb3I6JywgZXJyb3IpO1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5zdGF0dXMoNTAwKS5qc29uKHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XHJcbiAgICB9XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQcm9qZWN0c1xcXFxOYXZpbFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcUHJvamVjdHNcXFxcTmF2aWxcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1Byb2plY3RzL05hdmlsL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSc7XHJcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnO1xyXG5pbXBvcnQgeyBkaXJuYW1lLCByZXNvbHZlIH0gZnJvbSAncGF0aCc7XHJcblxyXG5jb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpO1xyXG5jb25zdCBfX2Rpcm5hbWUgPSBkaXJuYW1lKF9fZmlsZW5hbWUpO1xyXG4vLyBBZGFwdGVyIHRvIG1ha2UgVml0ZSBSZXF1ZXN0L1Jlc3BvbnNlIGxvb2sgbGlrZSBWZXJjZWwgU2VydmVybGVzcyBGdW5jdGlvblxyXG5jb25zdCB2ZXJjZWxBZGFwdGVyID0gYXN5bmMgKHJlcSwgcmVzLCBoYW5kbGVyKSA9PiB7XHJcbiAgY29uc3QgYnVmZmVycyA9IFtdO1xyXG4gIGZvciBhd2FpdCAoY29uc3QgY2h1bmsgb2YgcmVxKSB7XHJcbiAgICBidWZmZXJzLnB1c2goY2h1bmspO1xyXG4gIH1cclxuICBjb25zdCBkYXRhID0gQnVmZmVyLmNvbmNhdChidWZmZXJzKS50b1N0cmluZygpO1xyXG4gIHRyeSB7XHJcbiAgICByZXEuYm9keSA9IEpTT04ucGFyc2UoZGF0YSk7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICByZXEuYm9keSA9IHt9O1xyXG4gIH1cclxuXHJcbiAgcmVzLnN0YXR1cyA9IChjb2RlKSA9PiB7XHJcbiAgICByZXMuc3RhdHVzQ29kZSA9IGNvZGU7XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH07XHJcbiAgcmVzLmpzb24gPSAoZGF0YSkgPT4ge1xyXG4gICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xyXG4gICAgcmV0dXJuIHJlcztcclxuICB9O1xyXG5cclxuICBhd2FpdCBoYW5kbGVyKHJlcSwgcmVzKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcclxuICAvLyBMb2FkIGVudiB2YXJzIGludG8gcHJvY2Vzcy5lbnYgc28gdGhlIGhhbmRsZXIgY2FuIGFjY2VzcyB0aGVtXHJcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XHJcbiAgcHJvY2Vzcy5lbnYgPSB7IC4uLnByb2Nlc3MuZW52LCAuLi5lbnYgfTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICBpbnB1dDoge1xyXG4gICAgICAgICAgbWFpbjogcmVzb2x2ZShfX2Rpcm5hbWUsICdpbmRleC5odG1sJyksXHJcbiAgICAgICAgICBhZG1pbjogcmVzb2x2ZShfX2Rpcm5hbWUsICdhZG1pbi5odG1sJylcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIHJlYWN0KCksXHJcbiAgICAgIHRhaWx3aW5kY3NzKCksXHJcbiAgICAgIHtcclxuICAgICAgICBuYW1lOiAnbG9jYWwtYXBpLXNlcnZlcicsXHJcbiAgICAgICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xyXG4gICAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZShhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHJlcS51cmwgPT09ICcvYXBpL3NhdmVEYXRhJyAmJiByZXEubWV0aG9kID09PSAnUE9TVCcpIHtcclxuICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0ludGVyY2VwdGluZyAvYXBpL3NhdmVEYXRhIGxvY2FsbHkuLi4nKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHsgZGVmYXVsdDogaGFuZGxlciB9ID0gYXdhaXQgaW1wb3J0KCcuL2FwaS9zYXZlRGF0YS5qcycpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdmVyY2VsQWRhcHRlcihyZXEsIHJlcywgaGFuZGxlcik7XHJcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0xvY2FsIEFQSSBFcnJvcjonLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMDtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ0ludGVybmFsIExvY2FsIFNlcnZlciBFcnJvcicgfSkpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBuZXh0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIG5hbWU6ICdhZG1pbi1zcGEtZmFsbGJhY2snLFxyXG4gICAgICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcclxuICAgICAgICAgIC8vIFRoaXMgbXVzdCByZXR1cm4gYSBmdW5jdGlvbiBzbyBpdCBydW5zIEFGVEVSIFZpdGUncyBpbnRlcm5hbCBtaWRkbGV3YXJlXHJcbiAgICAgICAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xyXG4gICAgICAgICAgICAgIGlmIChyZXEudXJsICYmIChyZXEudXJsID09PSAnL2FkbWluJyB8fCByZXEudXJsLnN0YXJ0c1dpdGgoJy9hZG1pbi8nKSB8fCByZXEudXJsLnN0YXJ0c1dpdGgoJy9hZG1pbj8nKSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHsgcmVhZEZpbGVTeW5jIH0gPSBhd2FpdCBpbXBvcnQoJ2ZzJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sUGF0aCA9IHJlc29sdmUoX19kaXJuYW1lLCAnYWRtaW4uaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGh0bWwgPSByZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpO1xyXG4gICAgICAgICAgICAgICAgaHRtbCA9IGF3YWl0IHNlcnZlci50cmFuc2Zvcm1JbmRleEh0bWwocmVxLnVybCwgaHRtbCk7XHJcbiAgICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcclxuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2h0bWwnKTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoaHRtbCk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5leHQoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIF0sXHJcbiAgfTtcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDQSxlQUFPLFFBQStCLFNBQVMsVUFBVTtBQUNyRCxNQUFJLFFBQVEsV0FBVyxRQUFRO0FBQzNCLFdBQU8sU0FBUyxPQUFPLEdBQUcsRUFBRSxLQUFLLEVBQUUsT0FBTyxxQkFBcUIsQ0FBQztBQUFBLEVB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TUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLFlBQVk7QUFBQSxNQUNaO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixnQkFBZ0IsUUFBUTtBQUN0QixpQkFBTyxZQUFZLElBQUksT0FBTyxLQUFLLEtBQUssU0FBUztBQUMvQyxnQkFBSSxJQUFJLFFBQVEsbUJBQW1CLElBQUksV0FBVyxRQUFRO0FBQ3hELGtCQUFJO0FBQ0Ysd0JBQVEsSUFBSSx1Q0FBdUM7QUFDbkQsc0JBQU0sRUFBRSxTQUFTQSxTQUFRLElBQUksTUFBTTtBQUNuQyxzQkFBTSxjQUFjLEtBQUssS0FBS0EsUUFBTztBQUFBLGNBQ3ZDLFNBQVMsT0FBTztBQUNkLHdCQUFRLE1BQU0sb0JBQW9CLEtBQUs7QUFDdkMsb0JBQUksYUFBYTtBQUNqQixvQkFBSSxJQUFJLEtBQUssVUFBVSxFQUFFLE9BQU8sOEJBQThCLENBQUMsQ0FBQztBQUFBLGNBQ2xFO0FBQUEsWUFDRixPQUFPO0FBQ0wsbUJBQUs7QUFBQSxZQUNQO0FBQUEsVUFDRixDQUFDO0FBQUEsUUFDSDtBQUFBLE1BQ0Y7QUFBQSxNQUNBO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixnQkFBZ0IsUUFBUTtBQUV0QixpQkFBTyxNQUFNO0FBQ1gsbUJBQU8sWUFBWSxJQUFJLE9BQU8sS0FBSyxLQUFLLFNBQVM7QUFDL0Msa0JBQUksSUFBSSxRQUFRLElBQUksUUFBUSxZQUFZLElBQUksSUFBSSxXQUFXLFNBQVMsS0FBSyxJQUFJLElBQUksV0FBVyxTQUFTLElBQUk7QUFDdkcsc0JBQU0sRUFBRSxhQUFhLElBQUksTUFBTSxPQUFPLElBQUk7QUFDMUMsc0JBQU0sV0FBVyxRQUFRLFdBQVcsWUFBWTtBQUNoRCxvQkFBSSxPQUFPLGFBQWEsVUFBVSxPQUFPO0FBQ3pDLHVCQUFPLE1BQU0sT0FBTyxtQkFBbUIsSUFBSSxLQUFLLElBQUk7QUFDcEQsb0JBQUksYUFBYTtBQUNqQixvQkFBSSxVQUFVLGdCQUFnQixXQUFXO0FBQ3pDLG9CQUFJLElBQUksSUFBSTtBQUFBLGNBQ2QsT0FBTztBQUNMLHFCQUFLO0FBQUEsY0FDUDtBQUFBLFlBQ0YsQ0FBQztBQUFBLFVBQ0g7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFsiaGFuZGxlciIsICJkYXRhIl0KfQo=
