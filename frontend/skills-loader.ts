import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { SkillInfo, SkillsListResponse, SkillContentResponse } from "../types";
import "./skills-button";
import "./skills-panel";

@customElement("skills-loader")
export class SkillsLoader extends LitElement {
  @property({ type: String })
  gatewayUrl = "http://127.0.0.1:18789";

  @property({ type: String })
  authToken = "";

  @state()
  private _skills: SkillInfo[] = [];

  @state()
  private _panelVisible = false;

  @state()
  private _loading = false;

  @state()
  private _error: string | null = null;

  @state()
  private _searchQuery = "";

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      position: relative;
    }
  `;

  render() {
    return html`
      <skills-button
        .loading=${this._loading}
        .skillCount=${this._skills.length}
        @skills-click=${this._onButtonClick}
      ></skills-button>

      <skills-panel
        ?visible=${this._panelVisible}
        .skills=${this._skills}
        .loading=${this._loading}
        .error=${this._error}
        .searchQuery=${this._searchQuery}
        @skill-select=${this._onSkillSelect}
        @skills-search=${this._onSearch}
        @panel-open=${this._onPanelOpen}
      ></skills-panel>
    `;
  }

  private async _onButtonClick() {
    if (this._skills.length === 0) {
      await this._loadSkills();
    }
    this._panelVisible = !this._panelVisible;
  }

  private async _loadSkills() {
    this._loading = true;
    this._error = null;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (this.authToken) {
        headers["Authorization"] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`${this.gatewayUrl}/api/skills/list`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to load skills (${response.status})`);
      }

      const data: SkillsListResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      this._skills = data.skills;
    } catch (error) {
      this._error = (error as Error).message;
    } finally {
      this._loading = false;
    }
  }

  private async _onSkillSelect(e: CustomEvent) {
    const skill: SkillInfo = e.detail.skill;

    try {
      this._loading = true;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (this.authToken) {
        headers["Authorization"] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(
        `${this.gatewayUrl}/api/skills/${encodeURIComponent(skill.name)}/content`,
        { headers },
      );

      if (!response.ok) {
        throw new Error(`Failed to load skill content (${response.status})`);
      }

      const data: SkillContentResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      this.dispatchEvent(
        new CustomEvent("skill-loaded", {
          detail: {
            name: skill.name,
            content: data.content,
          },
          bubbles: true,
          composed: true,
        }),
      );

      this._panelVisible = false;
    } catch (error) {
      this._error = (error as Error).message;
    } finally {
      this._loading = false;
    }
  }

  private _onSearch(e: CustomEvent) {
    this._searchQuery = e.detail.query;
  }

  private _onPanelOpen() {
    this._error = null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "skills-loader": SkillsLoader;
  }
}
