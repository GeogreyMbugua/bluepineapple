#!/usr/bin/env python3

from pathlib import Path

PROJECT_STRUCTURE = [
    "apps/web",
    "apps/api",
    "apps/workers",
    "packages/database",
    "packages/types",
    "packages/validation",
    "packages/config",
    "packages/ui",
    "packages/shared",
    "infrastructure",
    "docs",
    "docs/architecture",
    "docs/adr",
    ".github/workflows",
]


FILES = {
    "pnpm-workspace.yaml": """
packages:
  - apps/*
  - packages/*
""",
    "turbo.json": """
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {},
    "test": {}
  }
}
""",
    "tsconfig.base.json": """
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  }
}
""",
    ".env.example": """
DATABASE_URL=

REDIS_URL=

JWT_SECRET=
JWT_REFRESH_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
""",
    ".gitignore": """
node_modules
.next
dist
coverage

.env
.env.local
.env.development
.env.production

pnpm-lock.yaml

.DS_Store
""",
    ".editorconfig": """
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
""",
    "README.md": """
# Blue Pineapple

Investment Platform

## Architecture

- Next.js
- NestJS
- PostgreSQL
- Prisma
- Redis
- BullMQ
- Turborepo
"""
}


def create_directory(path: str):
    directory = Path(path)

    if not directory.exists():
        directory.mkdir(parents=True, exist_ok=True)
        print(f"✓ Created directory: {path}")
    else:
        print(f"• Exists: {path}")


def create_file(path: str, content: str):
    file = Path(path)

    if not file.exists():
        file.write_text(content.strip() + "\n")
        print(f"✓ Created file: {path}")
    else:
        print(f"• Exists: {path}")


def main():
    print("\n🚀 Blue Pineapple Bootstrap\n")

    for directory in PROJECT_STRUCTURE:
        create_directory(directory)

    print("\n📄 Creating files...\n")

    for file_path, content in FILES.items():
        create_file(file_path, content)

    print("\n✅ Bootstrap complete.\n")


if __name__ == "__main__":
    main()