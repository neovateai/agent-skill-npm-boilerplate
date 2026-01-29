# Agent Skill NPM Boilerplate

> **Distribute AI agent skills like any other npm package**

AI coding tools (Claude Code, Cursor, Windsurf) support custom "skills" - reusable instructions that extend agent capabilities. But distributing them means manual file copying, no versioning, and painful updates.

**This template lets you publish skills to npm:**

```bash
# Install
npm install -g @your-org/git-commit-helper

# Update
npm update -g @your-org/git-commit-helper

# It just works - installs to ~/.claude/skills/, ~/.cursor/skills/, etc.
```

**Why this matters:** Skills become proper software artifacts with semantic versioning, dependency management, private registries, and global discovery. Same infrastructure that distributes React and Express.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Template](https://img.shields.io/badge/Template-Use%20This-brightgreen)](https://github.com/YOUR-USERNAME/agent-skill-npm-boilerplate/generate)

---

**Quick start:** Fork this template, edit `SKILL.md`, run `npm publish`. Your skill is now installable worldwide.

**Supports:** [Claude Code](https://code.claude.com/docs/en/skills), Cursor, Windsurf, and any tool following similar skill patterns. See [MULTI-TOOL-SUPPORT.md](MULTI-TOOL-SUPPORT.md).

## 💡 Why npm for Skills?

Manual skill distribution requires downloading files, copying to `~/.claude/skills/`, and repeating for every update. No versioning, no dependency management, no discovery.

**npm solves this:**

```bash
# Install/update/uninstall with standard commands
npm install -g @your-org/skill-name
npm update -g @your-org/skill-name
npm uninstall -g @your-org/skill-name

# Semantic versioning for controlled updates
npm install @your-org/skill@^2.1.0

# Project-specific skills (version-locked, committed to git)
npm install --save-dev @your-org/skill-name
```

**Core benefits:**
- **Version control** - Semantic versioning, upgrade/rollback easily
- **Global distribution** - Publish once, available worldwide via npm's CDN
- **Discoverability** - Searchable on npmjs.com
- **Enterprise ready** - Private registries for internal skills
- **Ecosystem integration** - Works with CI/CD, monorepos, existing tooling

Skills become first-class software artifacts, using the same infrastructure as React, Express, and millions of other packages.

## ✨ Features

- ✅ **Official Specification**: Fully compliant with Claude Code skills format
- ✅ **Multi-Tool Support**: Install to Claude Code, Cursor, Windsurf, and more! (See [Multi-Tool Support](MULTI-TOOL-SUPPORT.md))
- ✅ **Smart Installation**: Auto-detects global vs project-level installation
- ✅ **Progressive Disclosure**: Supports main SKILL.md + reference files
- ✅ **Lifecycle Management**: Install, update, uninstall scripts included
- ✅ **Best Practices**: Follows all recommended patterns from official docs
- ✅ **Ready to Publish**: Just customize and publish to npm

## 🚀 Quick Start

### Option 1: Use as GitHub Template (Recommended)

This is a **GitHub Template Repository**. The easiest way to use it:

1. **Click the "Use this template" button** at the top of this repository (or [click here](https://github.com/YOUR-USERNAME/agent-skill-npm-boilerplate/generate))
2. **Name your new repository** (e.g., `my-awesome-skill`)
3. **Clone your new repository**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/my-awesome-skill.git
   cd my-awesome-skill
   ```
4. **Customize your skill** (see [Customization Guide](#-customization-guide))
5. **Publish to npm**:
   ```bash
   npm login
   npm publish --access public
   ```

### Option 2: Clone Directly

```bash
# Clone this repository
git clone https://github.com/YOUR-USERNAME/agent-skill-npm-boilerplate.git my-skill
cd my-skill

# Remove git history and start fresh
rm -rf .git
git init

# Install dependencies (for development)
npm install

# Customize your skill
```

## 📁 Project Structure

```
agent-skill-npm-boilerplate/
├── package.json                # npm package configuration
├── SKILL.md                   # Main skill definition (REQUIRED)
├── .claude-skill.json         # Installation configuration
├── install-skill.js           # Installation script
├── uninstall-skill.js         # Uninstallation script
├── reference.md               # Detailed documentation (optional)
├── examples.md                # Usage examples (optional)
├── scripts/                   # Utility scripts (optional)
│   ├── setup.sh              # Post-install setup
│   └── config.json.example   # Configuration template
├── README.md                  # This file (customize for your skill)
├── LICENSE                    # License file
└── .gitignore                # Git ignore rules
```

## 🎨 Customization Guide

### Step 1: Update package.json

Replace the following placeholders:

```json
{
  "name": "@your-org/your-skill-name",        // Change this
  "version": "1.0.0",
  "description": "YOUR SKILL DESCRIPTION",     // Change this
  "author": "YOUR NAME",                       // Change this
  "repository": {
    "url": "YOUR-REPO-URL"                     // Change this
  }
}
```

**About npm scopes:**
- Use a scope (`@your-org/skill-name`) if you want to organize skills under your organization
- Use no scope (`skill-name`) for standalone packages
- Popular scopes: `@your-company`, `@your-username`, or custom like `@claude-skills`
- Scopes require configuration: `npm config set @your-org:registry https://registry.npmjs.org/`

### Step 2: Update SKILL.md

Edit `SKILL.md` and replace placeholders:

```yaml
---
name: your-skill-name              # Must match directory name
description: Your skill description here. Use when [scenarios].
allowed-tools: Read, Bash          # Tools your skill can use
---
```

### Step 3: Update .claude-skill.json

```json
{
  "name": "your-skill-name",        // Must match SKILL.md name
  "package": "@your-org/your-skill-name"
}
```

### Step 4: Add Your Logic

Edit the "Instructions" section in `SKILL.md`:

```markdown
## Instructions

When the user [describes scenario]:

1. **Step 1**: Do something
2. **Step 2**: Do something else
3. **Step 3**: Complete the task
```

### Step 5: Test Locally

```bash
# Test the installation script
node install-skill.js

# Check if installed correctly
ls -la ~/.claude/skills/your-skill-name/
cat ~/.claude/skills/your-skill-name/SKILL.md

# Open Claude Code and verify
# Ask Claude: "What skills are available?"
```

### Step 6: Publish to npm

```bash
# Login to npm (first time only)
npm login

# Publish your skill
npm publish --access public
```

## 📖 Skill Development Best Practices

### 1. Write Clear Descriptions

The `description` field in SKILL.md is crucial - it determines when Claude uses your skill:

```yaml
# ❌ Bad: Too vague
description: Helps with files

# ✅ Good: Specific and includes trigger keywords
description: Analyzes TypeScript files for type errors. Use when checking types, debugging TypeScript issues, or validating .ts files.
```

### 2. Use Progressive Disclosure

Keep SKILL.md under 500 lines. Put detailed content in separate files:

```markdown
# In SKILL.md
For complete API reference, see [reference.md](reference.md)
For examples, see [examples.md](examples.md)
```

Claude will only load these files when needed, saving context.

### 3. Limit Tool Access

Use `allowed-tools` to restrict what your skill can do:

```yaml
# Read-only skill
allowed-tools: Read, Grep, Glob

# Can read and execute (but not modify files)
allowed-tools: Read, Bash

# Full access
allowed-tools: Read, Edit, Write, Bash
```

### 4. Include Examples

Show concrete examples in your SKILL.md:

```markdown
## Examples

### Example 1: Basic Usage

User asks: "Check my commit message"

Claude will:
1. Read the commit message
2. Validate format
3. Suggest improvements
```

## 📦 Installation Behavior

### Global Installation (Recommended)

```bash
npm install -g @your-org/your-skill
```

Installs to: `~/.claude/skills/your-skill-name/`

Available: Across all projects for the current user

### Project-Level Installation

```bash
npm install --save-dev @your-org/your-skill
```

Installs to: `.claude/skills/your-skill-name/`

Available: Only in this project (can be committed to git)

### Priority Order

When multiple skills exist:
1. Enterprise (managed settings)
2. Personal (`~/.claude/skills/`)
3. Project (`.claude/skills/`)
4. Plugin

## How Installation and Uninstallation Work

This boilerplate includes automatic installation and uninstallation scripts that run when users install or remove your skill package via npm.

### Installation Process

When a user runs `npm install` (or `npm install -g`) on your skill package:

1. **Target Detection**: The script identifies which AI coding tools are configured for installation based on `.claude-skill.json`
2. **Scope Prefix Handling**: Extracts the actual skill name by removing any npm scope prefix (e.g., `@your-org/skill-name` becomes `skill-name`)
3. **Path Resolution**: For each target tool, it determines the appropriate installation location:
   - Global installation: `~/{tool-path}/skills/` (user's home directory)
   - Project installation: `./{tool-path}/skills/` (project root directory)
4. **Directory Setup**: Creates the skill directory using the skill name (without npm scope prefix)
5. **File Copying**: Copies essential files:
   - `SKILL.md` (required) - The main skill definition
   - Any additional files specified in `.claude-skill.json`
6. **Compatibility Cleanup**: Removes any legacy installation paths for backward compatibility
7. **Manifest Update**: Updates the `.skills-manifest.json` to track installed skills
8. **Post-install Hooks**: Runs any custom setup scripts defined in `.claude-skill.json`
9. **Settings Merge**: Deep merges any settings from `settings` field into `.claude/settings.json`

### Uninstallation Process

When a user runs `npm uninstall` (or `npm uninstall -g`) on your skill package:

1. **Target Detection**: Identifies which AI coding tools were configured for the skill
2. **Scope Prefix Handling**: Uses both the skill name (without scope prefix) and full package name (with scope prefix) for compatibility
3. **Path Resolution**: Determines the appropriate uninstallation locations
4. **Directory Removal**: Removes the skill directory from all configured targets:
   - Path using skill name (primary location)
   - Path with full package name (legacy location for compatibility)
5. **Manifest Update**: Removes the skill entry from `.skills-manifest.json`
6. **Settings Cleanup**: Removes any settings that were merged from this skill
7. **Best-effort Cleanup**: Continues even if some steps fail to ensure clean removal

## 🔧 Advanced Features

### Custom Hooks

Run scripts during installation:

```json
// .claude-skill.json
{
  "hooks": {
    "postinstall": "bash scripts/setup.sh"
  }
}
```

### Multiple Files

Support rich documentation:

```json
// .claude-skill.json
{
  "files": {
    "reference.md": "reference.md",
    "examples.md": "examples.md",
    "scripts": "scripts/"
  }
}
```

### Configuration

Let users customize your skill:

```bash
# scripts/setup.sh
cat > scripts/config.json <<EOF
{
  "option1": "default",
  "option2": true
}
EOF
```

### Auto Settings

Automatically merge configuration into `.claude/settings.json`:

```json
// .claude-skill.json
{
  "name": "six-clock-off",
  "settings": {
    "hooks": {
      "SessionEnd": [
        {
          "hooks": [
            {
              "type": "command",
              "command": "/six-clock-off"
            }
          ]
        }
      ]
    }
  }
}
```

When installing, the `settings` field is deeply merged into the user's `.claude/settings.json`. On uninstall, the matching settings are automatically removed.

**Use cases:**
- Register hooks that auto-trigger your skill (e.g., `SessionEnd`)
- Add system-level configuration
- Configure permission settings

**Note:** Unlike `files` which are copied, `settings` are merged, preserving existing configuration.

## 🐛 Troubleshooting

### Skill Not Appearing

```bash
# Check installation location
ls -la ~/.claude/skills/

# Verify SKILL.md format
cat ~/.claude/skills/your-skill/SKILL.md

# Check manifest
cat ~/.claude/skills/.skills-manifest.json
```

### Permission Errors

```bash
# Fix npm permissions (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Or use sudo (not recommended)
sudo npm install -g @your-org/your-skill
```

### Skill Not Triggering

- Make sure the `description` includes keywords users would naturally say
- Test by asking Claude directly: "Use the your-skill-name skill to..."

## 📚 Resources

- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Skills Best Practices](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices)
- [npm Package Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

This template is [MIT licensed](LICENSE). Skills you create from this template can use any license you choose.

## 💡 Examples

Skills built with this template:

- `@your-org/git-commit-helper` - Generate conventional commit messages
- `@your-org/code-reviewer` - Automated code review assistance
- `@your-org/test-generator` - Generate test cases from code

*(Add your skill here after publishing!)*

## 🙋 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/agent-skill-npm-boilerplate/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/agent-skill-npm-boilerplate/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/agent-skill-npm-boilerplate/wiki)

## 🌟 Show Your Support

If you find this template helpful:
- ⭐ Star this repository
- 🐛 Report bugs
- 💡 Suggest features
- 📝 Improve documentation

---

**Made with ❤️ for the Claude Code community**
