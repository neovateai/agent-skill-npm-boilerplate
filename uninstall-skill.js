#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

function getEnabledTargets(config) {
  // 如果没有 targets 配置，使用默认的 Claude Code 配置（向后兼容）
  if (!config.targets) {
    return [{
      name: 'claude-code',
      paths: {
        global: '.claude/skills',
        project: '.claude/skills'
      }
    }];
  }

  // 返回所有启用的目标
  return Object.entries(config.targets)
    .filter(([_, target]) => target.enabled)
    .map(([name, target]) => ({
      name,
      paths: target.paths
    }));
}

function detectInstallLocation(targetPaths) {
  // 检测是否为全局安装
  const isGlobal = process.env.npm_config_global === 'true';

  if (isGlobal) {
    return {
      type: 'personal',
      base: path.join(os.homedir(), targetPaths.global)
    };
  } else {
    // 项目级安装：查找项目根目录
    let currentDir = process.cwd();
    let projectRoot = currentDir;

    while (projectRoot !== path.dirname(projectRoot)) {
      if (fs.existsSync(path.join(projectRoot, 'package.json')) ||
          fs.existsSync(path.join(projectRoot, '.git'))) {
        break;
      }
      projectRoot = path.dirname(projectRoot);
    }

    return {
      type: 'project',
      base: path.join(projectRoot, targetPaths.project)
    };
  }
}

function uninstallFromTarget(target, config) {
  console.log(`\n🗑️  Uninstalling from ${target.name}...`);

  const location = detectInstallLocation(target.paths);
  const targetDir = path.join(location.base, config.name);

  if (fs.existsSync(targetDir)) {
    // 删除 skill 目录
    fs.rmSync(targetDir, { recursive: true, force: true });
    console.log(`  ✓ Removed skill directory`);

    // 更新 manifest
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

    console.log(`  ✅ Uninstalled from ${target.name}`);
    return true;
  } else {
    console.log(`  ℹ️  Skill was not installed in ${target.name}`);
    return false;
  }
}

function uninstallSkill() {
  console.log('🗑️  Uninstalling AI Coding Skill...\n');

  // 读取配置
  const configPath = path.join(__dirname, '.claude-skill.json');
  if (!fs.existsSync(configPath)) {
    console.warn('Warning: .claude-skill.json not found, skipping cleanup');
    return;
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // 获取启用的目标
  const enabledTargets = getEnabledTargets(config);

  console.log(`Uninstalling skill "${config.name}" from ${enabledTargets.length} target(s):`);
  enabledTargets.forEach(target => {
    console.log(`  • ${target.name}`);
  });

  // 从所有启用的目标卸载
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

  // 总结
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

// 执行卸载
try {
  uninstallSkill();
} catch (error) {
  console.error('\n⚠️  Warning during uninstall:', error.message);
  // Don't exit with error code as uninstall should be best-effort
}
