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
    // 全局安装：安装到用户主目录
    return {
      type: 'personal',
      base: path.join(os.homedir(), targetPaths.global)
    };
  } else {
    // 项目级安装：查找项目根目录
    let currentDir = process.cwd();
    let projectRoot = currentDir;

    // 向上查找 package.json 或 .git
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

function installToTarget(target, config) {
  console.log(`\n📦 Installing to ${target.name}...`);

  // 确定安装位置
  const location = detectInstallLocation(target.paths);
  const targetDir = path.join(location.base, config.name);

  console.log(`  Type: ${location.type}`);
  console.log(`  Directory: ${targetDir}`);

  // 创建目标目录
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 拷贝 SKILL.md（必需）
  const skillMdSource = path.join(__dirname, 'SKILL.md');
  if (!fs.existsSync(skillMdSource)) {
    throw new Error('SKILL.md is required but not found');
  }
  fs.copyFileSync(skillMdSource, path.join(targetDir, 'SKILL.md'));
  console.log('  ✓ Copied SKILL.md');

  // 拷贝其他文件
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
        // 确保目标目录存在
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(sourcePath, destPath);
        console.log(`  ✓ Copied file: ${source}`);
      }
    });
  }

  // 更新 manifest
  updateManifest(location.base, config, target.name);

  // 运行 postinstall hooks
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

  console.log(`  ✅ Installed to ${target.name}`);
  return targetDir;
}

function installSkill() {
  console.log('🚀 Installing AI Coding Skill...\n');

  // 读取配置
  const configPath = path.join(__dirname, '.claude-skill.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('.claude-skill.json not found');
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // 获取启用的目标
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

  // 安装到所有启用的目标
  const installedPaths = [];
  for (const target of enabledTargets) {
    try {
      const installPath = installToTarget(target, config);
      installedPaths.push({ target: target.name, path: installPath });
    } catch (error) {
      console.error(`\n❌ Failed to install to ${target.name}:`, error.message);
    }
  }

  // 总结
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

  manifest.skills[config.name] = {
    version: config.version,
    installedAt: new Date().toISOString(),
    package: config.package || `@antskill/${config.name}`,
    path: path.join(skillsDir, config.name),
    target: targetName
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

// 执行安装
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
