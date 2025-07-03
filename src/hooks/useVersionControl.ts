import { useEffect, useState } from 'react';
import { 
  handleVersionMigration, 
  getVersionInfo 
} from '../core/services/version/versionControl';
import { APP_VERSION } from '../core/config/constants';

/**
 * Hook to manage version control and migration
 */
export function useVersionControl() {
  const [migrationPerformed, setMigrationPerformed] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Perform version check and migration on app startup
    const performMigration = () => {
      try {
        const migrated = handleVersionMigration();
        setMigrationPerformed(migrated);
        setIsReady(true);
        
        if (migrated) {
          console.log('Version migration completed successfully');
        } else {
          console.log('No migration needed - version is current');
        }
      } catch (error) {
        console.error('Error during version migration:', error);
        setIsReady(true); // Still mark as ready to prevent blocking the app
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