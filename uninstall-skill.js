#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const { getEnabledTargets, extractSkillName, detectInstallLocation } = require('./utils');

function uninstallFromTarget(target, config) {
  console.log(`\n🗑️  Uninstalling from ${target.name}...`);

  const isGlobal = process.env.npm_config_global === 'true';
  const location = detectInstallLocation(target.paths, isGlobal);

  // Extract skill name from package name (remove scope prefix)
  const skillName = extractSkillName(config.name);

  // Path format using skill name
  const skillNameTargetDir = path.join(location.base, skillName);

  // Path format with full package name (including scope)
  const fullPackageNameTargetDir = path.join(location.base, config.name);

  let removed = false;

  // Check and remove path using skill name
  if (fs.existsSync(skillNameTargetDir)) {
    fs.rmSync(skillNameTargetDir, { recursive: true, force: true });
    console.log(`  ✓ Removed skill directory: ${skillName}`);
    removed = true;
  }

  // Check and remove path with full package name (for compatibility)
  if (fs.existsSync(fullPackageNameTargetDir) && fullPackageNameTargetDir !== skillNameTargetDir) {
    fs.rmSync(fullPackageNameTargetDir, { recursive: true, force: true });
    console.log(`  ✓ Removed skill directory: ${config.name}`);
    removed = true;
  }

  // Update manifest
  const manifestPath = path.join(location.base, '.skills-manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (manifest.skills && manifest.skills[config.name]) {
        delete manifest.skills[config.name];
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        console.log(`  ✓ Updated manifest`);
      }
    } catch (error) {
      console.warn('  Warning: Could not update manifest:', error.message);
    }
  }

  // Remove settings from .claude/settings.json
  if (config.settings) {
    const settingsPath = path.join(location.base, '..', 'settings.json');
    removeSettings(settingsPath, config.settings, config.name);
  }

  if (removed) {
    console.log(`  ✅ Uninstalled from ${target.name}`);
    return true;
  } else {
    console.log(`  ℹ️  Skill was not installed in ${target.name}`);
    return false;
  }
}

function uninstallSkill() {
  console.log('🗑️  Uninstalling AI Coding Skill...\n');

  // Read configuration
  const configPath = path.join(__dirname, '.claude-skill.json');
  if (!fs.existsSync(configPath)) {
    console.warn('Warning: .claude-skill.json not found, skipping cleanup');
    return;
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Get enabled targets
  const enabledTargets = getEnabledTargets(config);

  console.log(`Uninstalling skill "${config.name}" from ${enabledTargets.length} target(s):`);
  enabledTargets.forEach(target => {
    console.log(`  • ${target.name}`);
  });

  // Uninstall from all enabled targets
  const uninstalledFrom = [];
  for (const target of enabledTargets) {
    try {
      const success = uninstallFromTarget(target, config);
      if (success) {
        uninstalledFrom.push(target.name);
      }
    } catch (error) {
      console.error(`\n❌ Failed to uninstall from ${target.name}:`, error.message);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  if (uninstalledFrom.length > 0) {
    console.log('✅ Uninstallation Complete!');
    console.log('='.repeat(60));
    console.log('\nUninstalled from:');
    uninstalledFrom.forEach(target => {
      console.log(`  • ${target}`);
    });
  } else {
    console.log('ℹ️  Skill was not installed');
    console.log('='.repeat(60));
  }
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function removeSettingsItem(obj, pattern) {
  if (!isObject(obj) && !Array.isArray(obj)) return obj;

  if (Array.isArray(obj)) {
    // For arrays, filter out items that match the pattern
    return obj.filter(item => {
      if (Array.isArray(pattern)) {
        // If pattern is also an array, filter by comparing each element
        return !pattern.some(patternItem => JSON.stringify(item) === JSON.stringify(patternItem));
      }
      return true;
    });
  }

  const result = { ...obj };
  const patternKeys = Object.keys(pattern);

  patternKeys.forEach(key => {
    if (Array.isArray(pattern[key])) {
      // Pattern has an array - filter matching items from result array
      if (Array.isArray(result[key])) {
        result[key] = result[key].filter(item => {
          return !pattern[key].some(patternItem =>
            JSON.stringify(item) === JSON.stringify(patternItem)
          );
        });
        // Remove the key if array is now empty
        if (result[key].length === 0) {
          delete result[key];
        }
      }
    } else if (isObject(pattern[key])) {
      // Nested object, recurse
      if (isObject(result[key]) || Array.isArray(result[key])) {
        result[key] = removeSettingsItem(result[key], pattern[key]);
        // Remove if now empty (for objects) or empty array
        if (isObject(result[key]) && Object.keys(result[key]).length === 0) {
          delete result[key];
        } else if (Array.isArray(result[key]) && result[key].length === 0) {
          delete result[key];
        }
      }
    } else {
      // Exact value match, delete the key
      if (result[key] === pattern[key]) {
        delete result[key];
      }
    }
  });

  return result;
}

function removeSettings(settingsPath, settingsToRemove, skillName) {
  if (!fs.existsSync(settingsPath)) {
    console.log('  ℹ️  No settings.json found, skipping cleanup');
    return;
  }

  try {
    const existingSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const cleanedSettings = removeSettingsItem(existingSettings, settingsToRemove);

    // Write cleaned settings back
    fs.writeFileSync(settingsPath, JSON.stringify(cleanedSettings, null, 2));
    console.log(`  ✓ Updated settings.json (removed ${skillName} config)`);
  } catch (error) {
    console.warn('  ⚠ Warning: Could not update settings.json:', error.message);
  }
}

// Execute uninstall
try {
  uninstallSkill();
} catch (error) {
  console.error('\n⚠️  Warning during uninstall:', error.message);
  // Don't exit with error code as uninstall should be best-effort
}
