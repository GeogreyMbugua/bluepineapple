from pathlib import Path

ROOT = Path.cwd()

IAM_ROOT = ROOT / "packages" / "iam"

DIRECTORIES = [
    "src",
    "src/auth",
    "src/authorization",
    "src/middleware",
    "src/repositories",
    "src/types",
    "src/constants",
    "src/validators",
    "src/utils",
]

FILES = {
    "package.json": """{
  "name": "@blue-pineapple/iam",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
""",

    "tsconfig.json": """{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
""",

    "README.md": "# Blue Pineapple IAM\n",

    "src/index.ts": "",

    "src/auth/login.service.ts": "",
    "src/auth/logout.service.ts": "",
    "src/auth/otp.service.ts": "",
    "src/auth/session.service.ts": "",
    "src/auth/jwt.service.ts": "",

    "src/authorization/permission.service.ts": "",
    "src/authorization/role.service.ts": "",
    "src/authorization/policy.service.ts": "",
    "src/authorization/access-control.service.ts": "",

    "src/middleware/authenticate.ts": "",
    "src/middleware/authorize.ts": "",
    "src/middleware/require-role.ts": "",

    "src/repositories/user.repository.ts": "",
    "src/repositories/session.repository.ts": "",
    "src/repositories/otp.repository.ts": "",
    "src/repositories/role.repository.ts": "",

    "src/types/claims.ts": "",
    "src/types/auth-user.ts": "",
    "src/types/session.ts": "",
    "src/types/permissions.ts": "",

    "src/constants/auth.constants.ts": "",
    "src/constants/permission.constants.ts": "",

    "src/validators/login.schema.ts": "",
    "src/validators/verify-otp.schema.ts": "",
    "src/validators/refresh-token.schema.ts": "",

    "src/utils/otp-generator.ts": "",
    "src/utils/token-hash.ts": "",
    "src/utils/permission-resolver.ts": "",
}


def create_directory(path: Path):
    path.mkdir(parents=True, exist_ok=True)
    print(f"✓ Directory: {path}")


def create_file(path: Path, content: str):
    if not path.exists():
        path.write_text(content)
        print(f"✓ File: {path}")
    else:
        print(f"↷ Exists: {path}")


def main():
    print("\n🔐 Blue Pineapple IAM Bootstrap\n")

    for directory in DIRECTORIES:
        create_directory(IAM_ROOT / directory)

    print("\n📄 Creating files...\n")

    for relative_path, content in FILES.items():
        create_file(IAM_ROOT / relative_path, content)

    print("\n✅ IAM scaffold complete.\n")


if __name__ == "__main__":
    main()