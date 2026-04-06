/**
 * OpenClaw Skills Loader - Production Injection Script
 *
 * This script injects the skills-loader component into the OpenClaw Control UI
 * by modifying the index.html entry point.
 *
 * Usage: Run this script after building the frontend components, or manually
 * add the generated HTML to index.html.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTROL_UI_DIR = path.join(
  process.env.APPDATA || "",
  "npm",
  "node_modules",
  "openclaw",
  "dist",
  "control-ui",
);

const INDEX_HTML = path.join(CONTROL_UI_DIR, "index.html");

const INJECTION_HTML = `<!-- Skills Loader Extension -->
<script type="module">
(function() {
  const GATEWAY_URL = window.location.origin;
  const AUTH_TOKEN = null;

  async function loadSkillsModule() {
    try {
      const res = await fetch(GATEWAY_URL + '/plugins/skills-loader/list');
      if (!res.ok) {
        console.error('Failed to load skills:', res.status);
        return null;
      }
      const data = await res.json();
      return data.skills || [];
    } catch {
      return [];
    }
  }

  function insertSkillIntoInput(name, content) {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const formatted = '/skill ' + name;
      textarea.value = formatted;
      textarea.selectionStart = textarea.selectionEnd = formatted.length;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.focus();
    }
  }

  function createSkillsButton() {
    const btn = document.createElement('button');
    btn.id = 'skills-loader-btn';
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8"/><path d="M8 11h6"/></svg> Skills';
    btn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:6px 12px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e0e0e0;font-size:13px;cursor:pointer;transition:all 0.2s ease;white-space:nowrap;margin-left:8px;';
    btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(255,255,255,0.15)'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'rgba(255,255,255,0.08)'; });
    btn.addEventListener('click', toggleSkillsPanel);
    return btn;
  }

  function createSkillsPanel() {
    const panel = document.createElement('div');
    panel.id = 'skills-panel';
    panel.style.cssText = 'display:none;position:absolute;bottom:100%;left:0;right:0;margin-bottom:8px;background:#1e1e1e;border:1px solid rgba(255,255,255,0.12);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.4);max-height:400px;overflow:hidden;z-index:10000;flex-direction:column;';

    const header = document.createElement('div');
    header.style.cssText = 'padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;';
    header.innerHTML = '<h3 style="margin:0;font-size:14px;font-weight:600;color:#e0e0e0;">Available Skills (<span id="skills-count">0</span>)</h3>';
    panel.appendChild(header);

    const search = document.createElement('input');
    search.type = 'text';
    search.placeholder = 'Search skills...';
    search.style.cssText = 'width:calc(100% - 32px);padding:8px 12px;margin:8px 16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#e0e0e0;font-size:13px;outline:none;';
    search.addEventListener('input', (e) => filterSkills(e.target.value));
    search.addEventListener('click', (e) => e.stopPropagation());
    panel.appendChild(search);

    const list = document.createElement('div');
    list.id = 'skills-list';
    list.style.cssText = 'overflow-y:auto;padding:8px;flex:1;';
    panel.appendChild(list);

    panel.addEventListener('click', (e) => e.stopPropagation());

    return panel;
  }

  let allSkills = [];
  let panelVisible = false;
  let skillsBtn, skillsPanel;

  function toggleSkillsPanel() {
    if (!skillsPanel) return;
    panelVisible = !panelVisible;
    skillsPanel.style.display = panelVisible ? 'flex' : 'none';
    if (panelVisible && allSkills.length === 0) {
      loadAndRenderSkills();
    }
  }

  async function loadAndRenderSkills() {
    const list = document.getElementById('skills-list');
    const count = document.getElementById('skills-count');
    if (!list) return;

    list.innerHTML = '<div style="padding:24px;text-align:center;color:rgba(255,255,255,0.5);font-size:13px;">Loading skills...</div>';

    allSkills = await loadSkillsModule();
    if (!allSkills) allSkills = [];
    if (count) count.textContent = allSkills.length;

    renderSkillsList(allSkills);
  }

  function renderSkillsList(skills) {
    const list = document.getElementById('skills-list');
    if (!list) return;

    if (skills.length === 0) {
      list.innerHTML = '<div style="padding:24px;text-align:center;color:rgba(255,255,255,0.5);font-size:13px;">No skills found</div>';
      return;
    }

    list.innerHTML = '';
    skills.forEach(skill => {
      const item = document.createElement('div');
      item.style.cssText = 'padding:10px 12px;border-radius:8px;cursor:pointer;transition:background 0.15s ease;margin-bottom:4px;';
      item.innerHTML = '<div style="font-size:13px;font-weight:500;color:#e0e0e0;margin-bottom:2px;">' + skill.name + '</div><div style="font-size:12px;color:rgba(255,255,255,0.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (skill.description || '') + '</div>';
      item.addEventListener('mouseenter', () => { item.style.background = 'rgba(74,158,255,0.12)'; });
      item.addEventListener('mouseleave', () => { item.style.background = ''; });
      item.addEventListener('click', () => loadSkillContent(skill));
      list.appendChild(item);
    });
  }

  function filterSkills(query) {
    const filtered = allSkills.filter(s =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(query.toLowerCase())
    );
    renderSkillsList(filtered);
  }

  async function loadSkillContent(skill) {
    try {
      const res = await fetch(GATEWAY_URL + '/plugins/skills-loader/content?name=' + encodeURIComponent(skill.name));
      if (!res.ok) throw new Error('Failed to load skill');
      const data = await res.json();
      insertSkillIntoInput(skill.name, data.content);
      panelVisible = false;
      if (skillsPanel) skillsPanel.style.display = 'none';
    } catch (err) {
      alert('Error loading skill: ' + err.message);
    }
  }

  function injectIntoChatInput() {
    const chatInputContainer = document.querySelector('.chat-input-container') ||
      document.querySelector('[class*="chat-input"]') ||
      document.querySelector('form') ||
      document.querySelector('textarea')?.parentElement;

    if (!chatInputContainer) {
      setTimeout(injectIntoChatInput, 500);
      return;
    }

    if (document.getElementById('skills-loader-btn')) return;

    skillsBtn = createSkillsButton();
    skillsPanel = createSkillsPanel();

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;align-items:center;position:relative;';
    wrapper.appendChild(skillsBtn);
    wrapper.appendChild(skillsPanel);

    if (chatInputContainer.tagName === 'TEXTAREA' || chatInputContainer.querySelector('textarea')) {
      chatInputContainer.parentElement?.insertBefore(wrapper, chatInputContainer.nextSibling);
    } else {
      chatInputContainer.appendChild(wrapper);
    }

    document.addEventListener('click', (e) => {
      if (panelVisible && !skillsPanel.contains(e.target) && e.target !== skillsBtn) {
        panelVisible = false;
        skillsPanel.style.display = 'none';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectIntoChatInput);
  } else {
    injectIntoChatInput();
  }

  const observer = new MutationObserver(() => {
    if (document.querySelector('textarea') && !document.getElementById('skills-loader-btn')) {
      injectIntoChatInput();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
</script>
<!-- End Skills Loader Extension -->
`;

function inject() {
  if (!fs.existsSync(INDEX_HTML)) {
    console.error("Error: index.html not found at", INDEX_HTML);
    process.exit(1);
  }

  let html = fs.readFileSync(INDEX_HTML, "utf-8");

  if (html.includes("Skills Loader Extension")) {
    console.log("Skills Loader already injected. Skipping.");
    return;
  }

  html = html.replace("</body>", INJECTION_HTML + "\n</body>");
  fs.writeFileSync(INDEX_HTML, html, "utf-8");
  console.log("Skills Loader injected successfully into", INDEX_HTML);
}

inject();
