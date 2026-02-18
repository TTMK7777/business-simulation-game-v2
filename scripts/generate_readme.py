#!/usr/bin/env python3
"""
README.md generator v2.0 - Enhanced Version
version.jsonの詳細情報からリッチなREADME.mdを自動生成

新機能:
- tech_stack（技術スタック）の表示
- project_type（プロジェクトタイプ）の表示
- バッジ表示（プロジェクトタイプ別）
- 目次の自動生成
- より詳細な機能説明
"""
import json
from datetime import datetime
from pathlib import Path


def generate_badges(version_data: dict) -> list:
    """プロジェクトタイプに基づくバッジを生成"""
    badges = []
    project_type = version_data.get("project_type", "")
    tech_stack = version_data.get("tech_stack", [])

    # バッジマッピング
    badge_map = {
        "Next.js": "![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)",
        "React": "![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)",
        "TypeScript": "![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)",
        "Python": "![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)",
        "Express.js": "![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)",
        "FastAPI": "![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)",
        "Streamlit": "![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=flat&logo=streamlit&logoColor=white)",
        "Tailwind CSS": "![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat&logo=tailwind-css&logoColor=white)",
        "LangGraph": "![LangGraph](https://img.shields.io/badge/LangGraph-FF6F00?style=flat&logo=python&logoColor=white)",
        "Google Maps API": "![Google Maps](https://img.shields.io/badge/Google_Maps-4285F4?style=flat&logo=google-maps&logoColor=white)",
        "Vercel Deployment": "![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)",
        "OpenAI API": "![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)",
        "Google Gemini API": "![Gemini](https://img.shields.io/badge/Gemini-4285F4?style=flat&logo=google&logoColor=white)",
    }

    # プロジェクトタイプに基づく基本バッジ
    if "Python" in project_type:
        badges.append(badge_map.get("Python", ""))
    elif "Next.js" in project_type:
        badges.append(badge_map.get("Next.js", ""))
    elif "Express" in project_type:
        badges.append(badge_map.get("Express.js", ""))
    elif "Streamlit" in project_type:
        badges.append(badge_map.get("Streamlit", ""))
    elif "FastAPI" in project_type:
        badges.append(badge_map.get("FastAPI", ""))

    # 技術スタックからバッジ追加
    for tech in tech_stack[:5]:
        if tech in badge_map and badge_map[tech] not in badges:
            badges.append(badge_map[tech])

    return [b for b in badges if b][:6]  # 最大6個


def generate_readme(version_data: dict) -> str:
    """version.jsonから詳細なREADME.mdを生成"""

    name = version_data.get("name", "Project")
    version = version_data.get("version", "1.0")
    edition = version_data.get("edition", "")
    description = version_data.get("description", "")
    project_type = version_data.get("project_type", "")
    tech_stack = version_data.get("tech_stack", [])
    highlights = version_data.get("highlights", [])
    architecture = version_data.get("architecture", {})
    workflow_phases = version_data.get("workflow_phases", [])
    supported_models = version_data.get("supported_models", {})
    features = version_data.get("features", [])
    changelog = version_data.get("changelog", [])
    quick_start = version_data.get("quick_start", {})

    today = datetime.now().strftime("%Y-%m-%d")
    version_str = f"v{version} ({edition})" if edition else f"v{version}"

    lines = []

    # Header with badges
    lines.append(f"# {name} {version_str}")
    lines.append("")

    # Badges
    badges = generate_badges(version_data)
    if badges:
        lines.append(" ".join(badges))
        lines.append("")

    # Metadata
    lines.append(f"> **最終更新**: {today} | **バージョン**: {version_str}")
    if project_type:
        lines.append(f"> **プロジェクトタイプ**: {project_type}")
    lines.append("")

    # Table of Contents
    lines.append("## 目次")
    lines.append("")
    lines.append("- [概要](#概要)")
    if tech_stack:
        lines.append("- [技術スタック](#技術スタック)")
    if features:
        lines.append("- [機能一覧](#機能一覧)")
    if architecture:
        lines.append("- [アーキテクチャ](#アーキテクチャ)")
    if quick_start:
        lines.append("- [クイックスタート](#クイックスタート)")
    if changelog:
        lines.append("- [変更履歴](#変更履歴)")
    lines.append("")

    lines.append("---")
    lines.append("")

    # Overview
    lines.append("## 概要")
    lines.append("")
    lines.append(description if description != name else f"{name}は、効率的なワークフローを提供するプロジェクトです。")
    lines.append("")

    # Highlights
    if highlights:
        lines.append("### 特徴")
        lines.append("")
        for h in highlights:
            lines.append(f"- {h}")
        lines.append("")

    lines.append("---")
    lines.append("")

    # Tech Stack
    if tech_stack:
        lines.append("## 技術スタック")
        lines.append("")
        lines.append("| カテゴリ | 技術 |")
        lines.append("|---------|------|")

        # カテゴリ分類
        frontend = [t for t in tech_stack if t in ["Next.js", "React", "TypeScript", "Tailwind CSS", "PWA Support"]]
        backend = [t for t in tech_stack if t in ["Express.js", "FastAPI", "Flask", "Django", "Node.js"]]
        data = [t for t in tech_stack if t in ["Pandas", "NumPy", "Streamlit"]]
        ai = [t for t in tech_stack if t in ["OpenAI API", "Anthropic API", "Google Gemini API", "LangGraph", "LangChain"]]
        infra = [t for t in tech_stack if t in ["Vercel Deployment", "Docker", "GitHub Actions CI/CD"]]
        other = [t for t in tech_stack if t not in frontend + backend + data + ai + infra]

        if frontend:
            lines.append(f"| フロントエンド | {', '.join(frontend)} |")
        if backend:
            lines.append(f"| バックエンド | {', '.join(backend)} |")
        if data:
            lines.append(f"| データ処理 | {', '.join(data)} |")
        if ai:
            lines.append(f"| AI/ML | {', '.join(ai)} |")
        if infra:
            lines.append(f"| インフラ | {', '.join(infra)} |")
        if other:
            lines.append(f"| その他 | {', '.join(other)} |")

        lines.append("")

    lines.append("---")
    lines.append("")

    # Features
    if features:
        lines.append("## 機能一覧")
        lines.append("")

        # 機能をカテゴリ分け
        for i, f in enumerate(features, 1):
            # アイコン付きで表示
            icon = "✅" if i <= 5 else "🔧"
            lines.append(f"{icon} **{f}**")
        lines.append("")

    lines.append("---")
    lines.append("")

    # Architecture (AI projects)
    if architecture:
        lines.append("## アーキテクチャ")
        lines.append("")

        # Workflow diagram
        if workflow_phases:
            lines.append("```mermaid")
            lines.append("graph TD")
            lines.append("    START([Start]) --> A")
            for i, phase in enumerate(workflow_phases):
                node_id = chr(65 + i)  # A, B, C, ...
                next_id = chr(65 + i + 1) if i < len(workflow_phases) - 1 else "END"
                lines.append(f"    {node_id}[{phase['name']}: {phase['description']}] --> {next_id}")
            lines.append("    END([End])")
            lines.append("```")
            lines.append("")

        # Roles table
        lines.append("### 役割分担")
        lines.append("")
        lines.append("| 役割 | モデル | 担当 |")
        lines.append("|------|--------|------|")

        if "commander" in architecture:
            c = architecture["commander"]
            lines.append(f"| 🎖️ {c['name']} | {c['model']} | {c['role']} |")
        if "advisor" in architecture:
            a = architecture["advisor"]
            lines.append(f"| 🧠 {a['name']} | {a['model']} | {a['role']} |")
        for spec in architecture.get("specialists", []):
            lines.append(f"| 📋 {spec['name']} | - | {spec['role']} |")
        if "reviewer" in architecture:
            r = architecture["reviewer"]
            lines.append(f"| 👁️ {r['name']} | {r['model']} | {r['role']} |")

        lines.append("")

    # Supported Models
    if supported_models:
        lines.append("### 対応モデル")
        lines.append("")
        for provider, models in supported_models.items():
            lines.append(f"- **{provider.capitalize()}**: {', '.join(models)}")
        lines.append("")

    lines.append("---")
    lines.append("")

    # Quick Start
    if quick_start and (quick_start.get("install") or quick_start.get("run")):
        lines.append("## クイックスタート")
        lines.append("")

        lines.append("### 1. インストール")
        lines.append("")
        lines.append("```bash")
        lines.append(quick_start.get("install", "pip install -r requirements.txt"))
        lines.append("```")
        lines.append("")

        env_vars = quick_start.get("env_vars", [])
        if env_vars:
            lines.append("### 2. 環境変数の設定")
            lines.append("")
            lines.append("`.env.local` ファイルを作成し、以下の環境変数を設定:")
            lines.append("")
            lines.append("```bash")
            for env in env_vars:
                lines.append(f"{env}=your_value_here")
            lines.append("```")
            lines.append("")

        lines.append(f"### {'3' if env_vars else '2'}. 実行")
        lines.append("")
        lines.append("```bash")
        lines.append(quick_start.get("run", "python main.py"))
        lines.append("```")
        lines.append("")

    lines.append("---")
    lines.append("")

    # Changelog
    if changelog:
        lines.append("## 変更履歴")
        lines.append("")
        for entry in changelog[:5]:  # 最新5件
            v = entry.get("version", "")
            d = entry.get("date", "")
            changes = entry.get("changes", [])
            lines.append(f"### v{v} ({d})")
            lines.append("")
            for c in changes:
                lines.append(f"- {c}")
            lines.append("")

    # Footer
    lines.append("---")
    lines.append("")
    lines.append("*このREADMEは `version.json` から自動生成されています ([generate_readme.py](scripts/generate_readme.py))*")
    lines.append("")

    return "\n".join(lines)


def main():
    """メイン処理"""
    version_path = Path(__file__).parent.parent / "version.json"

    if not version_path.exists():
        print("Error: version.json not found")
        return 1

    with open(version_path, "r", encoding="utf-8") as f:
        version_data = json.load(f)

    readme_content = generate_readme(version_data)

    readme_path = Path(__file__).parent.parent / "README.md"
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(readme_content)

    print(f"README.md generated successfully ({len(readme_content)} chars)")
    return 0


if __name__ == "__main__":
    exit(main())
