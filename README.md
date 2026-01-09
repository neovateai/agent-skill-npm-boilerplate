# Agent Skill NPM Boilerplate

> 🚀 A template for creating and publishing Claude Code skills as npm packages

This is a GitHub template repository for creating [Claude Code skills](https://code.claude.com/docs/en/skills) that can be distributed and installed via npm. It provides a complete, production-ready structure following the official Claude Code skills specification.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/badge/npm-%40antskill-brightgreen)](https://www.npmjs.com/package/@antskill)

## 🎯 What is this?

This boilerplate helps you create skills that can be installed via npm:

```bash
# Your users can install your skill like this
npm install -g @antskill/your-skill

# The skill is automatically installed to ~/.claude/skills/
# and immediately available in Claude Code
```

## ✨ Features

- ✅ **Official Specification**: Fully compliant with Claude Code skills format
- ✅ **Multi-Tool Support**: Install to Claude Code, Cursor, Windsurf, and more! (See [Multi-Tool Support](MULTI-TOOL-SUPPORT.md))
- ✅ **Smart Installation**: Auto-detects global vs project-level installation
- ✅ **Progressive Disclosure**: Supports main SKILL.md + reference files
- ✅ **Lifecycle Management**: Install, update, uninstall scripts included
- ✅ **Best Practices**: Follows all recommended patterns from official docs
- ✅ **Ready to Publish**: Just customize and publish to npm

## 🚀 Quick Start

### Option 1: Use as GitHub Template

1. Click the "Use this template" button at the top of this repository
2. Clone your new repository
3. Customize your skill (see [Customization Guide](#-customization-guide))
4. Publish to npm

### Option 2: Clone Directly

```bash
# Clone this repository
git clone https://github.com/yourusername/agent-skill-npm-boilerplate.git my-skill
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
  "name": "@antskill/YOUR-SKILL-NAME",        // Change this
  "version": "1.0.0",
  "description": "YOUR SKILL DESCRIPTION",     // Change this
  "author": "YOUR NAME",                       // Change this
  "repository": {
    "url": "YOUR-REPO-URL"                     // Change this
  }
}
```

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
  "package": "@antskill/your-skill-name"
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
npm install -g @antskill/your-skill
```

Installs to: `~/.claude/skills/your-skill-name/`

Available: Across all projects for the current user

### Project-Level Installation

```bash
npm install --save-dev @antskill/your-skill
```

Installs to: `.claude/skills/your-skill-name/`

Available: Only in this project (can be committed to git)

### Priority Order

When multiple skills exist:
1. Enterprise (managed settings)
2. Personal (`~/.claude/skills/`)
3. Project (`.claude/skills/`)
4. Plugin

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
sudo npm install -g @antskill/your-skill
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

- `@antskill/git-commit-helper` - Generate conventional commit messages
- `@antskill/code-reviewer` - Automated code review assistance
- `@antskill/test-generator` - Generate test cases from code

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
