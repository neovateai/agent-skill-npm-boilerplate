#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const { getEnabledTargets,extractSkillName, detectInstallLocation } = require('./utils');

function installToTarget(target, config) {
  console.log(`\n📦 Installing to ${target.name}...`);

  // Determine installation location
  const location = detectInstallLocation(target.paths);

  // Extract skill name from package name (remove scope prefix)
  const skillName = extractSkillName(config.name);

  const targetDir = path.join(location.base, skillName);

  // Alternative path format with full package name (including scope)
  const altTargetDir = path.join(location.base, config.name);

  console.log(`  Type: ${location.type}`);
  console.log(`  Directory: ${targetDir}`);

  // Clean up alternative path format (for compatibility)
  if (fs.existsSync(altTargetDir) && altTargetDir !== targetDir) {
    console.log(`  🧹 Cleaning up alternative path format...`);
    fs.rmSync(altTargetDir, { recursive: true, force: true });
    console.log(`  ✓ Removed directory: ${config.name}`);
  }

  // Create target directory
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy SKILL.md (required)
  const skillMdSource = path.join(__dirname, 'SKILL.md');
  if (!fs.existsSync(skillMdSource)) {
    throw new Error('SKILL.md is required but not found');
  }
  fs.copyFileSync(skillMdSource, path.join(targetDir, 'SKILL.md'));
  console.log('  ✓ Copied SKILL.md');

  // Copy other files
  if (config.files) {
    Object.entries(config.files).forEach(([source, dest]) => {
      const sourcePath = path.join(__dirname, source);
      if (!fs.existsSync(sourcePath)) {
        console.warn(`  ⚠ Warning: ${source} not found, skipping`);
        return;
      }

      const destPath = path.join(targetDir, dest);

      if (fs.statSync(sourcePath).isDirectory()) {
        copyDir(sourcePath, destPath);
        console.log(`  ✓ Copied directory: ${source}`);
      } else {
        // Ensure target directory exists
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(sourcePath, destPath);
        console.log(`  ✓ Copied file: ${source}`);
      }
    });
  }

  // Update manifest
  updateManifest(location.base, config, target.name);

  // Run postinstall hooks
  if (config.hooks && config.hooks.postinstall) {
    console.log('  🔧 Running postinstall hook...');
    const { execSync } = require('child_process');
    try {
      execSync(config.hooks.postinstall, {
        cwd: targetDir,
        stdio: 'pipe'
      });
      console.log('  ✓ Postinstall hook completed');
    } catch (error) {
      console.warn(`  ⚠ Warning: postinstall hook failed`);
    }
  }

  // Merge settings into .claude/settings.json
  if (config.settings) {
    const settingsPath = path.join(location.base, '..', 'settings.json');
    mergeSettings(settingsPath, config.settings);
  }

  console.log(`  ✅ Installed to ${target.name}`);
  return targetDir;
}

function installSkill() {
  console.log('🚀 Installing AI Coding Skill...\n');

  // Read configuration
  const configPath = path.join(__dirname, '.claude-skill.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('.claude-skill.json not found');
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Get enabled targets
  const enabledTargets = getEnabledTargets(config);

  if (enabledTargets.length === 0) {
    console.warn('⚠ No targets enabled in configuration');
    console.warn('Please enable at least one target in .claude-skill.json');
    return;
  }

  console.log(`Installing skill "${config.name}" to ${enabledTargets.length} target(s):`);
  enabledTargets.forEach(target => {
    console.log(`  • ${target.name}`);
  });

  // Install to all enabled targets
  const installedPaths = [];
  for (const target of enabledTargets) {
    try {
      const installPath = installToTarget(target, config);
      installedPaths.push({ target: target.name, path: installPath });
    } catch (error) {
      console.error(`\n❌ Failed to install to ${target.name}:`, error.message);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ Installation Complete!');
  console.log('='.repeat(60));

  if (installedPaths.length > 0) {
    console.log('\nInstalled to:');
    installedPaths.forEach(({ target, path: installPath }) => {
      console.log(`  • ${target}: ${installPath}`);
    });

    console.log('\n📖 Next Steps:');
    console.log('  1. Restart your AI coding tool(s)');
    console.log('  2. Ask: "What skills are available?"');
    console.log('  3. Start using your skill!');
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function updateManifest(skillsDir, config, targetName) {
  const manifestPath = path.join(skillsDir, '.skills-manifest.json');
  let manifest = { skills: {} };

  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (error) {
      console.warn('  Warning: Could not parse existing manifest, creating new one');
      manifest = { skills: {} };
    }
  }

  // Extract skill name from package name (remove scope prefix)
  const skillName = config.name.startsWith('@') ?
    config.name.split('/')[1] || config.name :
    config.name;

  manifest.skills[config.name] = {
    version: config.version,
    installedAt: new Date().toISOString(),
    package: config.package || config.name,
    path: path.join(skillsDir, skillName),
    target: targetName
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

function deepMerge(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function mergeSettings(settingsPath, newSettings) {
  let existingSettings = {};

  // Read existing settings if the file exists
  if (fs.existsSync(settingsPath)) {
    try {
      existingSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (error) {
      console.warn('  ⚠ Warning: Could not parse existing settings.json, creating new one');
      existingSettings = {};
    }
  }

  // Merge new settings with special handling for hooks arrays
  const mergedSettings = deepMergeWithArrays(existingSettings, newSettings);

  // Write merged settings back
  fs.writeFileSync(settingsPath, JSON.stringify(mergedSettings, null, 2));
  console.log(`  ✓ Merged settings into ${settingsPath}`);
}

function deepMergeWithArrays(target, source) {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (Array.isArray(source[key])) {
        // For arrays, especially hooks, concatenate with deduplication
        if (!Array.isArray(target[key])) {
          // Target doesn't have this array key, use source array
          output[key] = source[key];
        } else {
          // Both are arrays, merge with deduplication
          output[key] = mergeArraysDedupe(target[key], source[key]);
        }
      } else if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMergeWithArrays(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }

  return output;
}

function mergeArraysDedupe(existing, newArray) {
  const result = [...existing];

  for (const newItem of newArray) {
    // Check if this item already exists in the array
    const exists = result.some(item => JSON.stringify(item) === JSON.stringify(newItem));
    if (!exists) {
      result.push(newItem);
    }
  }

  return result;
}

// Execute installation
try {
  installSkill();
} catch (error) {
  console.error('\n❌ Failed to install skill:', error.message);
  console.error('\nTroubleshooting:');
  console.error('- Ensure .claude-skill.json exists and is valid JSON');
  console.error('- Ensure SKILL.md exists');
  console.error('- Check file permissions for target directories');
  console.error('- Verify at least one target is enabled in .claude-skill.json');
  console.error('- Try running with sudo for global installation (if needed)');
  process.exit(1);
}
