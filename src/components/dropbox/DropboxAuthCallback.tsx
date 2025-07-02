import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DropboxSync } from '../../utils/dropbox';
import { Loader2 } from 'lucide-react';

export default function DropboxAuthCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        // Send error to parent window
        window.opener?.postMessage({
          type: 'DROPBOX_AUTH_ERROR',
          error: error
        }, window.location.origin);
        window.close();
        return;
      }

      if (code) {
        try {
          const accessToken = await DropboxSync.completeAuth(code);
          
          // Send success to parent window
          window.opener?.postMessage({
            type: 'DROPBOX_AUTH_SUCCESS',
            accessToken
          }, window.location.origin);
          
          window.close();
        } catch (error: any) {
          // Send error to parent window
          window.opener?.postMessage({
            type: 'DROPBOX_AUTH_ERROR',
            error: error.message
          }, window.location.origin);
          window.close();
        }
      }
    };

    handleAuth();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing Dropbox Authentication...
        </h2>
        <p className="text-gray-600">
          Please wait while we connect your account.
        </p>
      </div>
    </div>
  );
}