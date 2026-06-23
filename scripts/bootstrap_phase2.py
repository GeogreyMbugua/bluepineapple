#!/usr/bin/env python3

from pathlib import Path
import json


def create_dir(path: str) -> None:
    Path(path).mkdir(parents=True, exist_ok=True)
    print(f"✓ {path}")


def create_file(path: str, content: str) -> None:
    file_path = Path(path)

    if file_path.exists():
        print(f"• exists: {path}")
        return

    file_path.write_text(content.strip() + "\n", encoding="utf-8")
    print(f"✓ {path}")


ROOT_PACKAGE_JSON = {
    "name": "blue-pineapple",
    "private": True,
    "packageManager": "pnpm@10",
    "scripts": {
        "dev": "turbo dev",
        "build": "turbo build",
        "lint": "turbo lint",
        "test": "turbo test",
        "typecheck": "turbo typecheck",
    },
    "devDependencies": {
        "turbo": "^2.5.0",
        "typescript": "^5.8.0",
    },
}


PACKAGE_TEMPLATE = """{
  "name": "%NAME%",
  "version": "0.0.1",
  "private": true,
  "main": "src/index.ts"
}
"""


def main() -> None:
    print("\n🚀 Phase 2 Bootstrap\n")

    directories = [
        "packages/database/prisma",
        "packages/database/src",
        "packages/types/src",
        "packages/validation/src",
        "packages/config/src",
        "packages/shared/src",
        "packages/ui/src",
        "apps/web/src",
        "apps/api/src",
        "apps/workers/src",
    ]

    for directory in directories:
        create_dir(directory)

    create_file(
        "package.json",
        json.dumps(ROOT_PACKAGE_JSON, indent=2),
    )

    workspace_packages = [
        "database",
        "types",
        "validation",
        "config",
        "shared",
        "ui",
    ]

    for package_name in workspace_packages:
        create_file(
            f"packages/{package_name}/package.json",
            PACKAGE_TEMPLATE.replace(
                "%NAME%",
                f"@blue-pineapple/{package_name}",
            ),
        )

    create_file(
        "packages/database/prisma/schema.prisma",
        """
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
""",
    )

    create_file(
        ".prettierrc",
        """
{
  "semi": true,
  "singleQuote": true
}
""",
    )

    create_file(
        "docker-compose.yml",
        """
services:
  postgres:
    image: postgres:17
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: blue_pineapple
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    restart: always
    ports:
      - "6379:6379"
""",
    )

    create_file(
        ".github/workflows/ci.yml",
        """
name: CI

on:
  push:
  pull_request:

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - run: pnpm install

      - run: pnpm lint

      - run: pnpm typecheck
""",
    )

    print("\n✅ Phase 2 Complete\n")


if __name__ == "__main__":
    main()