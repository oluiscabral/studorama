import React, { useState } from 'react';
import { Heart, Loader2, Crown, Coffee, BookOpen, Star, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { products } from '../../stripe-config';

export default function PricingPage() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSponsor = async (priceId: string, mode: 'payment' | 'subscription') => {
    // For accountless app, redirect to external Stripe checkout
    setLoading(priceId);
    
    try {
      // Create a simple checkout URL - this would need to be implemented
      // For now, show a message about account requirement for sponsorship
      const message = language === 'pt-BR' 
        ? 'Para se tornar um apoiador, você precisaria criar uma conta. Os recursos principais do Studorama permanecem completamente gratuitos e sem necessidade de conta!'
        : 'To become a supporter, you would need to create an account. The core Studorama features remain completely free and accountless!';
      alert(message);
    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage = language === 'pt-BR' 
        ? 'Erro ao processar solicitação de apoio'
        : 'Error processing support request';
      alert(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const handlePatreonSupport = () => {
    window.open('https://patreon.com/studorama', '_blank', 'noopener,noreferrer');
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Advanced':
        return <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />;
      case 'Standard':
        return <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />;
      case 'Basic':
        return <Coffee className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />;
      default:
        return <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />;
    }
  };

  const getGradient = (name: string) => {
    switch (name) {
      case 'Advanced':
        return 'from-purple-500 to-purple-600';
      case 'Standard':
        return 'from-blue-500 to-blue-600';
      case 'Basic':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getSupportName = (name: string) => {
    if (language === 'pt-BR') {
      switch (name) {
        case 'Advanced': return t.advanced;
        case 'Standard': return t.standard;
        case 'Basic': return t.basic;
        default: return name;
      }
    }
    return name;
  };

  const getSupportDescription = (name: string) => {
    if (language === 'pt-BR') {
      switch (name) {
        case 'Advanced': return t.advancedDesc;
        case 'Standard': return t.standardDesc;
        case 'Basic': return t.basicDesc;
        default: return '';
      }
    }
    
    switch (name) {
      case 'Advanced': return t.advancedDesc;
      case 'Standard': return t.standardDesc;
      case 'Basic': return t.basicDesc;
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full mb-4 sm:mb-6">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            {t.supportStudorama}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-4 sm:mb-6 px-4 leading-relaxed">
            {t.supportStudoramaDesc}
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
              <span className="font-semibold text-green-800 text-sm sm:text-base">{t.freeForever}</span>
            </div>
            <p className="text-green-700 text-xs sm:text-sm leading-relaxed">
              {t.freeForeverDesc}
            </p>
          </div>
        </div>

        {/* No Account Required Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 max-w-4xl mx-auto mb-8 sm:mb-12">
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-blue-900 mb-2 sm:mb-3">
              🎓 {t.noAccountRequired}
            </h2>
            <p className="text-blue-800 leading-relaxed text-sm sm:text-base">
              <strong>{t.startLearningImmediately}!</strong> {t.noAccountRequiredDesc}
            </p>
          </div>
        </div>

        {/* Patreon Support Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl shadow-xl border border-orange-300 p-6 sm:p-8 mb-8 sm:mb-12 text-white">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full mb-4 sm:mb-6">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">
              {language === 'pt-BR' ? 'Apoie no Patreon' : 'Support on Patreon'}
            </h2>
            <p className="text-orange-100 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
              {language === 'pt-BR' 
                ? 'Junte-se à nossa comunidade no Patreon e ajude a manter o Studorama gratuito para todos. Escolha o nível de apoio que funciona para você!'
                : 'Join our community on Patreon and help keep Studorama free for everyone. Choose the support level that works for you!'
              }
            </p>
            <button
              onClick={handlePatreonSupport}
              className="inline-flex items-center bg-white text-orange-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold hover:bg-orange-50 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base lg:text-lg"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
              <span>
                {language === 'pt-BR' ? 'Apoiar no Patreon' : 'Support on Patreon'}
              </span>
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 flex-shrink-0" />
            </button>
            <p className="text-orange-200 text-xs sm:text-sm mt-3 sm:mt-4">
              patreon.com/studorama
            </p>
          </div>
        </div>

        {/* Alternative Support Options */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
            {language === 'pt-BR' ? 'Outras Opções de Apoio' : 'Alternative Support Options'}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {language === 'pt-BR' 
              ? 'Prefere outras formas de apoio? Confira nossas opções de apoio direto:'
              : 'Prefer other ways to support? Check out our direct support options:'
            }
          </p>
        </div>

        {/* Support Tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto mb-8 sm:mb-12">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 relative overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {product.name === 'Advanced' && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-purple-600 text-white px-2 sm:px-4 py-1 text-xs sm:text-sm font-medium rounded-bl-lg">
                  {t.mostPopular}
                </div>
              )}

              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 rounded-full mb-3 sm:mb-4">
                  {getIcon(product.name)}
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                  {getSupportName(product.name)}
                </h3>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                  ${product.price}
                  <span className="text-sm sm:text-base lg:text-lg font-normal text-gray-600">
                    {language === 'pt-BR' ? '/mês' : '/month'}
                  </span>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">
                  {t.monthlySponsorship}
                </p>
              </div>

              <div className="mb-6 sm:mb-8">
                <p className="text-gray-700 text-center leading-relaxed text-sm sm:text-base">
                  {getSupportDescription(product.name)}
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="flex items-start text-xs sm:text-sm text-gray-600">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t.supportFreeEducation}</span>
                </div>
                <div className="flex items-start text-xs sm:text-sm text-gray-600">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t.helpImprovePlatform}</span>
                </div>
                <div className="flex items-start text-xs sm:text-sm text-gray-600">
                  <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t.recognitionAsSupporter}</span>
                </div>
                <div className="flex items-start text-xs sm:text-sm text-gray-600">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t.helpKeepPlatformAccountless}</span>
                </div>
              </div>

              <button
                onClick={() => handleSponsor(product.priceId, product.mode)}
                disabled={loading === product.priceId}
                className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center bg-gradient-to-r ${getGradient(product.name)} text-white hover:shadow-lg text-sm sm:text-base`}
              >
                {loading === product.priceId ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <>
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                    <span className="text-center leading-tight">
                      {t.becomeSupporter} {getSupportName(product.name)}
                    </span>
                  </>
                )}
              </button>

              <p className="text-center text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 leading-relaxed">
                {t.externalCheckout} ({t.accountOptional})
              </p>
            </div>
          ))}
        </div>

        {/* Why Support Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8 px-2">
            {t.whySponsorStudorama}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{t.keepItFree}</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {t.keepItFreeDesc}
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{t.fundDevelopment}</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {t.fundDevelopmentDesc}
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{t.serverCosts}</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {t.serverCostsDesc}
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{t.privacyFirst}</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {t.privacyFirstDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Accountless Benefits */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl sm:rounded-2xl shadow-lg border border-orange-200 p-6 sm:p-8 mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8 px-2">
            🚀 {t.startLearningInstantly}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">✨ {t.noBarriersToLearning}</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-gray-700">
                <li className="text-sm sm:text-base">• {t.noEmailRequired}</li>
                <li className="text-sm sm:text-base">• {t.noPasswordToRemember}</li>
                <li className="text-sm sm:text-base">• {t.noVerificationSteps}</li>
                <li className="text-sm sm:text-base">• {t.noPersonalDataCollection}</li>
                <li className="text-sm sm:text-base">• {t.startStudyingInSeconds}</li>
              </ul>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">🔒 {t.privacyFocused}</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-gray-700">
                <li className="text-sm sm:text-base">• {t.dataStaysInBrowser}</li>
                <li className="text-sm sm:text-base">• {t.noTrackingOrAnalytics}</li>
                <li className="text-sm sm:text-base">• {t.yourApiKeyStaysLocal}</li>
                <li className="text-sm sm:text-base">• {t.completeAnonymity}</li>
                <li className="text-sm sm:text-base">• {t.gdprCompliantByDesign}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Transparency Section */}
        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 max-w-3xl mx-auto">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-3">
              {t.transparencyTrust}
            </h3>
            <p className="text-blue-800 text-xs sm:text-sm leading-relaxed">
              {t.transparencyTrustDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}