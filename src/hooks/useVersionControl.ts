import { useEffect, useState } from 'react';
import { 
  handleVersionMigration, 
  getVersionInfo 
} from '../core/services/version/versionControl';
import { APP_VERSION } from '../core/config/constants';

/**
 * Hook to manage version control and migration with performance optimizations
 */
export function useVersionControl() {
  const [migrationPerformed, setMigrationPerformed] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Perform version check and migration on app startup
    const performMigration = async () => {
      try {
        // Use requestIdleCallback to avoid blocking the main thread
        const runMigration = () => {
          return new Promise<boolean>((resolve) => {
            requestIdleCallback(() => {
              try {
                const migrated = handleVersionMigration();
                resolve(migrated);
              } catch (error) {
                console.error('Error during version migration:', error);
                resolve(false);
              }
            });
          });
        };

        const migrated = await runMigration();
        setMigrationPerformed(migrated);
        
        if (migrated) {
          console.log('Version migration completed successfully');
        } else {
          console.log('No migration needed - version is current');
        }
      } catch (error) {
        console.error('Error during version migration:', error);
      } finally {
        setIsReady(true);
      }
    };

    // Run migration check
    performMigration();
  }, []);

  return {
    currentVersion: APP_VERSION,
    migrationPerformed,
    isReady,
    versionInfo: getVersionInfo(),
  };
}