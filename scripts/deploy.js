#!/usr/bin/env node

/**
 * Deployment script with automatic version bumping
 */

import { execSync } from 'child_process';
import VersionManager from './version-manager.js';

class DeployManager {
  constructor() {
    this.versionManager = new VersionManager();
  }

  /**
   * Execute shell command with error handling
   */
  exec(command, options = {}) {
    try {
      console.log(`🔧 Running: ${command}`);
      const result = execSync(command, { 
        stdio: 'inherit', 
        encoding: 'utf8',
        ...options 
      });
      return result;
    } catch (error) {
      console.error(`❌ Command failed: ${command}`);
      console.error(error.message);
      process.exit(1);
    }
  }

  /**
   * Pre-deployment checks
   */
  preDeploymentChecks() {
    console.log('🔍 Running pre-deployment checks...');
    
    // Check if we're in a git repository
    try {
      this.exec('git status', { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ Not in a git repository');
      process.exit(1);
    }
    
    // Check for uncommitted changes
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        console.warn('⚠️  You have uncommitted changes:');
        console.log(status);
        
        // Ask user if they want to continue
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        return new Promise((resolve) => {
          readline.question('Continue with deployment? (y/N): ', (answer) => {
            readline.close();
            if (answer.toLowerCase() !== 'y') {
              console.log('❌ Deployment cancelled');
              process.exit(1);
            }
            resolve();
          });
        });
      }
    } catch (error) {
      // Git status failed, continue anyway
    }
    
    console.log('✅ Pre-deployment checks passed');
  }

  /**
   * Build the application
   */
  build() {
    console.log('🏗️  Building application...');
    this.exec('npm install');
    this.exec('npm run build');
    console.log('✅ Build completed');
  }

  /**
   * Deploy to production
   */
  async deploy(versionType = 'patch', skipBuild = false) {
    console.log('🚀 Starting deployment process...');
    
    // Pre-deployment checks
    await this.preDeploymentChecks();
    
    // Bump version
    const newVersion = this.versionManager.bump(versionType);
    
    // Build application (unless skipped)
    if (!skipBuild) {
      this.build();
    }
    
    // Commit version changes
    try {
      this.exec('git add .');
      this.exec(`git commit -m "chore: bump version to ${newVersion}"`);
      this.exec(`git tag -a v${newVersion} -m "Release version ${newVersion}"`);
      console.log(`✅ Created git tag v${newVersion}`);
    } catch (error) {
      console.warn('⚠️  Could not create git commit/tag (this is optional)');
    }
    
    // Push to repository (optional)
    try {
      this.exec('git push origin main');
      this.exec('git push origin --tags');
      console.log('✅ Pushed changes to repository');
    } catch (error) {
      console.warn('⚠️  Could not push to repository (this is optional)');
    }
    
    console.log(`🎉 Deployment completed! Version: ${newVersion}`);
    console.log(`📦 Build files are ready in the 'dist' directory`);
    
    return newVersion;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'deploy';
  const versionType = args[1] || 'patch';
  const skipBuild = args.includes('--skip-build');
  
  const deployManager = new DeployManager();
  
  switch (command) {
    case 'deploy':
      await deployManager.deploy(versionType, skipBuild);
      break;
      
    case 'build':
      deployManager.build();
      break;
      
    default:
      console.log(`
🚀 Studorama Deploy Manager

Usage:
  node scripts/deploy.js [command] [version-type] [options]

Commands:
  deploy [type]    Deploy with version bump (patch, minor, major)
  build           Build application only

Options:
  --skip-build    Skip the build step during deployment

Examples:
  node scripts/deploy.js deploy patch
  node scripts/deploy.js deploy minor
  node scripts/deploy.js build
  node scripts/deploy.js deploy major --skip-build
      `);
      break;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default DeployManager;