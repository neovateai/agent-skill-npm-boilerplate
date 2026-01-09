# Multi-Tool Support Guide

This boilerplate supports installing skills to multiple AI coding tools simultaneously!

## Supported AI Tools

Out of the box, we support:

| AI Tool | Status | Default Path |
|---------|--------|--------------|
| **Claude Code** | ✅ Enabled by default | `~/.claude/skills` |
| **Cursor** | ⚪ Disabled | `~/.cursor/skills` |
| **Windsurf** | ⚪ Disabled | `~/.windsurf/skills` |
| **Aider** | ⚪ Disabled | `~/.aider/skills` |
| **Custom** | ⚪ Disabled | Custom path |

## Configuration

Edit `.claude-skill.json` to enable/disable targets:

```json
{
  "name": "your-skill-name",
  "version": "1.0.0",
  "package": "@antskill/your-skill-name",
  "targets": {
    "claude-code": {
      "enabled": true,
      "paths": {
        "global": ".claude/skills",
        "project": ".claude/skills"
      }
    },
    "cursor": {
      "enabled": true,      // 👈 Enable Cursor support
      "paths": {
        "global": ".cursor/skills",
        "project": ".cursor/skills"
      }
    },
    "windsurf": {
      "enabled": false,
      "paths": {
        "global": ".windsurf/skills",
        "project": ".windsurf/skills"
      }
    },
    "custom": {
      "enabled": false,
      "paths": {
        "global": ".ai-skills",        // Custom path
        "project": ".ai-skills"
      }
    }
  }
}
```

## How It Works

### Installation Behavior

When you run `npm install`, the skill will be installed to **all enabled targets**:

```bash
npm install -g @antskill/your-skill

# Output:
# 🚀 Installing AI Coding Skill...
#
# Installing skill "your-skill" to 2 target(s):
#   • claude-code
#   • cursor
#
# 📦 Installing to claude-code...
#   Type: personal
#   Directory: /Users/you/.claude/skills/your-skill
#   ✓ Copied SKILL.md
#   ✓ Copied directory: scripts
#   ✅ Installed to claude-code
#
# 📦 Installing to cursor...
#   Type: personal
#   Directory: /Users/you/.cursor/skills/your-skill
#   ✓ Copied SKILL.md
#   ✓ Copied directory: scripts
#   ✅ Installed to cursor
#
# ============================================================
# ✅ Installation Complete!
# ============================================================
#
# Installed to:
#   • claude-code: /Users/you/.claude/skills/your-skill
#   • cursor: /Users/you/.cursor/skills/your-skill
```

### Uninstallation

Uninstallation removes the skill from all enabled targets:

```bash
npm uninstall -g @antskill/your-skill

# Removes from both claude-code and cursor
```

### Global vs Project Installation

Each target supports both installation types:

**Global installation** (`npm install -g`):
- Installs to `~/{tool-path}/skills/`
- Available to the user across all projects

**Project installation** (`npm install --save-dev`):
- Installs to `./{tool-path}/skills/` in the project root
- Available only in that specific project
- Can be committed to version control

## Use Cases

### Use Case 1: Multi-Tool Developer

You use both Claude Code and Cursor:

```json
{
  "targets": {
    "claude-code": { "enabled": true },
    "cursor": { "enabled": true }
  }
}
```

Your skill is available in both tools!

### Use Case 2: Team Standard

Your team uses Windsurf, install skill to project:

```json
{
  "targets": {
    "windsurf": { "enabled": true }
  }
}
```

```bash
# In your project
npm install --save-dev @your-org/team-skill

# Commit .windsurf/skills/ to git
git add .windsurf/
git commit -m "Add team skill"
```

All team members get the skill automatically.

### Use Case 3: Custom AI Tool

You're building your own AI coding tool:

```json
{
  "targets": {
    "custom": {
      "enabled": true,
      "paths": {
        "global": ".myaitool/skills",
        "project": ".myaitool/skills"
      }
    }
  }
}
```

## Adding New AI Tools

To add support for a new AI tool:

1. Add a new target in `.claude-skill.json`:

```json
{
  "targets": {
    "your-tool": {
      "enabled": true,
      "paths": {
        "global": ".yourtool/skills",    // Path relative to home directory
        "project": ".yourtool/skills"     // Path relative to project root
      }
    }
  }
}
```

2. Test the installation:

```bash
npm test
```

3. Verify the skill appears in the expected location

## Backward Compatibility

If `.claude-skill.json` doesn't have a `targets` section, it defaults to Claude Code only:

```json
{
  "name": "your-skill",
  "version": "1.0.0"
  // No targets specified
}
```

This is equivalent to:

```json
{
  "name": "your-skill",
  "version": "1.0.0",
  "targets": {
    "claude-code": {
      "enabled": true,
      "paths": {
        "global": ".claude/skills",
        "project": ".claude/skills"
      }
    }
  }
}
```

## Path Conventions

Different AI tools may use different path conventions:

| Tool | Convention | Example |
|------|-----------|---------|
| Claude Code | `~/.claude/skills/` | Official |
| Cursor | `~/.cursor/skills/` | Hypothetical |
| Windsurf | `~/.windsurf/skills/` | Hypothetical |
| Aider | `~/.aider/skills/` | Hypothetical |

**Note**: Path conventions for tools other than Claude Code are illustrative examples. Check each tool's documentation for their actual skills directory structure.

## Environment Variables

You can override target enable/disable at install time:

```bash
# Enable only specific targets
SKILL_TARGETS="claude-code,cursor" npm install -g @antskill/your-skill

# Disable specific targets
SKILL_DISABLE="windsurf" npm install -g @antskill/your-skill
```

(Feature to be implemented in future versions)

## FAQ

### Q: Can I install to some targets globally and others per-project?

A: Not currently. The installation mode (global vs project) applies to all targets. This is a limitation of npm's install hooks.

### Q: What if a tool doesn't support skills?

A: The files will still be installed to the specified path, but the tool won't use them unless it has skill support. No harm done!

### Q: Can I customize paths per installation?

A: Currently, paths are defined in `.claude-skill.json`. To use different paths, modify the config file before publishing your package.

### Q: How do I know which tools are actually enabled?

A: Run `npm test` to see which targets your skill will install to.

## Best Practices

1. **Test all enabled targets**: Ensure your skill works correctly in each AI tool
2. **Document tool-specific features**: If your skill behaves differently across tools
3. **Consider tool capabilities**: Not all tools may support all skill features
4. **Default to Claude Code only**: Enable other targets explicitly when needed

## Contributing

Have a suggestion for supporting a new AI tool? Open an issue or PR!

---

**Made with ❤️ for the AI coding community**
