#!/usr/bin/env node

/**
 * Version Manager for Studorama
 * Automatically increments version numbers and updates all relevant files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Version types
const VERSION_TYPES = {
  MAJOR: 'major',    // Breaking changes (1.0.0 -> 2.0.0)
  MINOR: 'minor',    // New features (1.0.0 -> 1.1.0)
  PATCH: 'patch',    // Bug fixes (1.0.0 -> 1.0.1)
  BUILD: 'build'     // Build number (1.0.0 -> 1.0.1)
};

class VersionManager {
  constructor() {
    this.packageJsonPath = path.join(projectRoot, 'package.json');
    this.envPath = path.join(projectRoot, '.env');
    this.indexHtmlPath = path.join(projectRoot, 'index.html');
    this.swPath = path.join(projectRoot, 'public/sw.js');
    this.constantsPath = path.join(projectRoot, 'src/core/config/constants.ts');
  }

  /**
   * Parse version string into components
   */
  parseVersion(versionString) {
    const match = versionString.match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!match) {
      throw new Error(`Invalid version format: ${versionString}`);
    }
    
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10)
    };
  }

  /**
   * Increment version based on type
   */
  incrementVersion(currentVersion, type) {
    const version = this.parseVersion(currentVersion);
    
    switch (type) {
      case VERSION_TYPES.MAJOR:
        version.major += 1;
        version.minor = 0;
        version.patch = 0;
        break;
      case VERSION_TYPES.MINOR:
        version.minor += 1;
        version.patch = 0;
        break;
      case VERSION_TYPES.PATCH:
      case VERSION_TYPES.BUILD:
      default:
        version.patch += 1;
        break;
    }
    
    return `${version.major}.${version.minor}.${version.patch}`;
  }

  /**
   * Get current version from package.json
   */
  getCurrentVersion() {
    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
      return packageJson.version || '1.0.0';
    } catch (error) {
      console.warn('Could not read package.json, defaulting to 1.0.0');
      return '1.0.0';
    }
  }

  /**
   * Update package.json version
   */
  updatePackageJson(newVersion) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
      packageJson.version = newVersion;
      fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`✓ Updated package.json to version ${newVersion}`);
    } catch (error) {
      console.error('Failed to update package.json:', error.message);
    }
  }

  /**
   * Update .env file
   */
  updateEnvFile(newVersion) {
    try {
      let envContent = '';
      
      if (fs.existsSync(this.envPath)) {
        envContent = fs.readFileSync(this.envPath, 'utf8');
      }
      
      // Update or add APP_VERSION
      if (envContent.includes('APP_VERSION=')) {
        envContent = envContent.replace(/APP_VERSION=.*$/m, `APP_VERSION=${newVersion}`);
      } else {
        envContent += `\nAPP_VERSION=${newVersion}\n`;
      }
      
      fs.writeFileSync(this.envPath, envContent);
      console.log(`✓ Updated .env with APP_VERSION=${newVersion}`);
    } catch (error) {
      console.error('Failed to update .env:', error.message);
    }
  }

  /**
   * Update index.html structured data
   */
  updateIndexHtml(newVersion) {
    try {
      let content = fs.readFileSync(this.indexHtmlPath, 'utf8');
      
      // Update softwareVersion in structured data
      content = content.replace(
        /"softwareVersion": "[^"]*"/g,
        `"softwareVersion": "${newVersion}"`
      );
      
      fs.writeFileSync(this.indexHtmlPath, content);
      console.log(`✓ Updated index.html structured data to version ${newVersion}`);
    } catch (error) {
      console.error('Failed to update index.html:', error.message);
    }
  }

  /**
   * Update service worker cache names
   */
  updateServiceWorker(newVersion) {
    try {
      let content = fs.readFileSync(this.swPath, 'utf8');
      
      // Update cache name
      content = content.replace(
        /const CACHE_NAME = 'studorama-v[^']*'/,
        `const CACHE_NAME = 'studorama-v${newVersion}'`
      );
      
      fs.writeFileSync(this.swPath, content);
      console.log(`✓ Updated service worker cache name to v${newVersion}`);
    } catch (error) {
      console.error('Failed to update service worker:', error.message);
    }
  }

  /**
   * Update constants file (for build-time version)
   */
  updateConstants(newVersion) {
    try {
      let content = fs.readFileSync(this.constantsPath, 'utf8');
      
      // Update cache names that use APP_VERSION
      content = content.replace(
        /STATIC: `studorama-static-v\$\{APP_VERSION\}`/,
        `STATIC: \`studorama-static-v${newVersion}\``
      );
      content = content.replace(
        /DYNAMIC: `studorama-dynamic-v\$\{APP_VERSION\}`/,
        `DYNAMIC: \`studorama-dynamic-v${newVersion}\``
      );
      content = content.replace(
        /MAIN: `studorama-v\$\{APP_VERSION\}`/,
        `MAIN: \`studorama-v${newVersion}\``
      );
      
      fs.writeFileSync(this.constantsPath, content);
      console.log(`✓ Updated constants.ts cache names to v${newVersion}`);
    } catch (error) {
      console.error('Failed to update constants.ts:', error.message);
    }
  }

  /**
   * Create a version info file
   */
  createVersionInfo(newVersion) {
    const versionInfo = {
      version: newVersion,
      buildDate: new Date().toISOString(),
      buildNumber: Date.now(),
      environment: process.env.NODE_ENV || 'development'
    };
    
    const versionInfoPath = path.join(projectRoot, 'public/version.json');
    fs.writeFileSync(versionInfoPath, JSON.stringify(versionInfo, null, 2));
    console.log(`✓ Created version info file: ${versionInfo.version} (${versionInfo.buildDate})`);
  }

  /**
   * Main version bump function
   */
  bump(type = VERSION_TYPES.PATCH) {
    console.log(`🚀 Starting version bump (${type})...`);
    
    const currentVersion = this.getCurrentVersion();
    const newVersion = this.incrementVersion(currentVersion, type);
    
    console.log(`📦 Current version: ${currentVersion}`);
    console.log(`📦 New version: ${newVersion}`);
    
    // Update all files
    this.updatePackageJson(newVersion);
    this.updateEnvFile(newVersion);
    this.updateIndexHtml(newVersion);
    this.updateServiceWorker(newVersion);
    this.updateConstants(newVersion);
    this.createVersionInfo(newVersion);
    
    console.log(`✅ Version bump complete! New version: ${newVersion}`);
    return newVersion;
  }

  /**
   * Get version information
   */
  info() {
    const currentVersion = this.getCurrentVersion();
    const parsed = this.parseVersion(currentVersion);
    
    console.log(`📦 Current version: ${currentVersion}`);
    console.log(`   Major: ${parsed.major}`);
    console.log(`   Minor: ${parsed.minor}`);
    console.log(`   Patch: ${parsed.patch}`);
    
    return currentVersion;
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const type = args[1] || VERSION_TYPES.PATCH;
  
  const versionManager = new VersionManager();
  
  switch (command) {
    case 'bump':
      if (!Object.values(VERSION_TYPES).includes(type)) {
        console.error(`❌ Invalid version type: ${type}`);
        console.log(`Valid types: ${Object.values(VERSION_TYPES).join(', ')}`);
        process.exit(1);
      }
      versionManager.bump(type);
      break;
      
    case 'info':
      versionManager.info();
      break;
      
    case 'major':
      versionManager.bump(VERSION_TYPES.MAJOR);
      break;
      
    case 'minor':
      versionManager.bump(VERSION_TYPES.MINOR);
      break;
      
    case 'patch':
      versionManager.bump(VERSION_TYPES.PATCH);
      break;
      
    default:
      console.log(`
📦 Studorama Version Manager

Usage:
  node scripts/version-manager.js <command> [type]

Commands:
  bump [type]    Bump version by type (patch, minor, major)
  major          Bump major version (breaking changes)
  minor          Bump minor version (new features)
  patch          Bump patch version (bug fixes)
  info           Show current version info

Examples:
  node scripts/version-manager.js bump patch
  node scripts/version-manager.js major
  node scripts/version-manager.js info
      `);
      break;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default VersionManager;