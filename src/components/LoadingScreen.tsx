import { useLanguage } from '../hooks';
import Logo from './ui/Logo';

export default function LoadingScreen() {
  const { language } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="mb-6 animate-pulse">
          <Logo size="lg" className="mx-auto" />
        </div>
        
        {/* Loading Text */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Studorama
        </h1>
        <p className="text-gray-600 mb-6">
          {language === 'pt-BR' 
            ? 'Inicializando sua experiência de aprendizado...' 
            : 'Initializing your learning experience...'}
        </p>
        
        {/* Loading Spinner */}
        <div className="flex justify-center">
          <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
        </div>
        
        {/* Version Info */}
        <div className="mt-8 text-xs text-gray-500">
          {language === 'pt-BR' 
            ? 'Verificando atualizações...' 
            : 'Checking for updates...'}
        </div>
      </div>
    </div>
  );
}