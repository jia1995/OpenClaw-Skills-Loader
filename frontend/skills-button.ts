import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("skills-button")
export class SkillsButton extends LitElement {
  @property({ type: Boolean })
  loading = false;

  @property({ type: Number })
  skillCount = 0;

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
    }

    button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      color: #e0e0e0;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    button:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.25);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .icon {
      width: 16px;
      height: 16px;
    }

    .badge {
      background: #4a9eff;
      color: white;
      font-size: 10px;
      padding: 1px 5px;
      border-radius: 10px;
      min-width: 16px;
      text-align: center;
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top-color: #4a9eff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  render() {
    return html`
      <button
        @click=${this._onClick}
        ?disabled=${this.loading}
        title="Load Skills"
      >
        ${this.loading
          ? html`<div class="spinner"></div>`
          : html`
              <svg
                class="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path
                  d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                />
                <path d="M8 7h8" />
                <path d="M8 11h6" />
              </svg>
            `}
        <span>Skills</span>
        ${this.skillCount > 0
          ? html`<span class="badge">${this.skillCount}</span>`
          : ""}
      </button>
    `;
  }

  private _onClick() {
    this.dispatchEvent(new CustomEvent("skills-click", { bubbles: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "skills-button": SkillsButton;
  }
}
