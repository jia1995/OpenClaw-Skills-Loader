import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { SkillInfo } from "../types";

@customElement("skills-panel")
export class SkillsPanel extends LitElement {
  @property({ type: Boolean })
  visible = false;

  @property({ type: Array })
  skills: SkillInfo[] = [];

  @property({ type: Boolean })
  loading = false;

  @property({ type: String })
  error: string | null = null;

  @property({ type: String })
  searchQuery = "";

  static styles = css`
    :host {
      display: none;
    }

    :host([visible]) {
      display: block;
    }

    .panel {
      position: absolute;
      bottom: 100%;
      left: 0;
      right: 0;
      margin-bottom: 8px;
      background: #1e1e1e;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      max-height: 400px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      z-index: 1000;
    }

    .header {
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #e0e0e0;
    }

    .search-input {
      width: 100%;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #e0e0e0;
      font-size: 13px;
      outline: none;
      margin: 8px 16px;
      width: calc(100% - 32px);
    }

    .search-input:focus {
      border-color: #4a9eff;
    }

    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    .skills-list {
      overflow-y: auto;
      padding: 8px;
      flex: 1;
    }

    .skill-item {
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s ease;
      margin-bottom: 4px;
    }

    .skill-item:hover {
      background: rgba(74, 158, 255, 0.12);
    }

    .skill-item.selected {
      background: rgba(74, 158, 255, 0.2);
      border-left: 3px solid #4a9eff;
    }

    .skill-name {
      font-size: 13px;
      font-weight: 500;
      color: #e0e0e0;
      margin-bottom: 2px;
    }

    .skill-description {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .loading,
    .error,
    .empty {
      padding: 24px;
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
      font-size: 13px;
    }

    .error {
      color: #ff6b6b;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: #4a9eff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 12px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  render() {
    if (!this.visible) return html``;

    const filteredSkills = this.skills.filter(
      (s) =>
        s.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(this.searchQuery.toLowerCase()),
    );

    return html`
      <div class="panel">
        <div class="header">
          <h3>Available Skills (${this.skills.length})</h3>
        </div>

        <input
          class="search-input"
          type="text"
          placeholder="Search skills..."
          .value=${this.searchQuery}
          @input=${this._onSearch}
        />

        ${this.loading
          ? html`
              <div class="loading">
                <div class="spinner"></div>
                Loading skills...
              </div>
            `
          : this.error
            ? html`<div class="error">${this.error}</div>`
            : filteredSkills.length === 0
              ? html`<div class="empty">No skills found</div>`
              : html`
                  <div class="skills-list">
                    ${filteredSkills.map(
                      (skill) => html`
                        <div
                          class="skill-item"
                          @click=${() => this._onSelect(skill)}
                        >
                          <div class="skill-name">${skill.name}</div>
                          <div class="skill-description">
                            ${skill.description}
                          </div>
                        </div>
                      `,
                    )}
                  </div>
                `}
      </div>
    `;
  }

  private _onSearch(e: Event) {
    const target = e.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.dispatchEvent(
      new CustomEvent("skills-search", {
        detail: { query: target.value },
        bubbles: true,
      }),
    );
  }

  private _onSelect(skill: SkillInfo) {
    this.dispatchEvent(
      new CustomEvent("skill-select", {
        detail: { skill },
        bubbles: true,
      }),
    );
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("visible") && this.visible) {
      this.dispatchEvent(new CustomEvent("panel-open", { bubbles: true }));
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "skills-panel": SkillsPanel;
  }
}
