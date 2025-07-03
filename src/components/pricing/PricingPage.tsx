import { BookOpen, Coffee, Crown, ExternalLink, Heart, Loader2, Star } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { products } from '../../stripe-config';

export default function PricingPage() {
  const { t, language } = useLanguage();
  const { themeConfig } = useTheme();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSponsor = async (priceId: string, _mode: 'payment' | 'subscription') => {
    setLoading(priceId);
    
    try {
      // Create Stripe checkout URL - replace with your actual Stripe checkout URLs
      const checkoutUrls: Record<string, string> = {
        'price_1RgBFtGzYU9LC2rhWCNUvQNG': 'https://buy.stripe.com/test_advanced_monthly', // Advanced
        'price_1RgBFfGzYU9LC2rh4LDpFBCr': 'https://buy.stripe.com/test_standard_monthly', // Standard
        'price_1RgBEPGzYU9LC2rhy3WTMOmk': 'https://buy.stripe.com/test_basic_monthly'     // Basic
      };

      const checkoutUrl = checkoutUrls[priceId];
      
      if (checkoutUrl) {
        // Redirect to Stripe checkout
        window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      } else {
        // Fallback message for development
        const message = language === 'pt-BR' 
          ? 'Checkout do Stripe será configurado em breve. Obrigado pelo seu interesse em apoiar o Studorama!'
          : 'Stripe checkout will be configured soon. Thank you for your interest in supporting Studorama!';
        alert(message);
      }
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
        return <Crown className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: themeConfig.colors.primary }} />;
      case 'Standard':
        return <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: themeConfig.colors.primary }} />;
      case 'Basic':
        return <Coffee className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: themeConfig.colors.primary }} />;
      default:
        return <Heart className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: themeConfig.colors.primary }} />;
    }
  };

  const getGradient = (name: string) => {
    switch (name) {
      case 'Advanced':
        return themeConfig.gradients.primary;
      case 'Standard':
        return themeConfig.gradients.secondary;
      case 'Basic':
        return themeConfig.gradients.primary;
      default:
        return themeConfig.gradients.primary;
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
    <div 
      className="min-h-screen py-6 sm:py-12"
      style={{ background: themeConfig.gradients.background }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div 
            className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-4 sm:mb-6"
            style={{ backgroundColor: themeConfig.colors.primary + '20' }}
          >
            <Heart className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: themeConfig.colors.primary }} />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-2" style={{ color: themeConfig.colors.text }}>
            {t.supportStudorama}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl max-w-3xl mx-auto mb-4 sm:mb-6 px-4 leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
            {t.supportStudoramaDesc}
          </p>
          <div 
            className="border rounded-lg p-3 sm:p-4 max-w-2xl mx-auto"
            style={{
              backgroundColor: themeConfig.colors.success + '20',
              borderColor: themeConfig.colors.success + '30'
            }}
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: themeConfig.colors.success }} />
              <span className="font-semibold text-sm sm:text-base" style={{ color: themeConfig.colors.success }}>{t.freeForever}</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: themeConfig.colors.success }}>
              {t.freeForeverDesc}
            </p>
          </div>
        </div>

        {/* No Account Required Notice */}
        <div 
          className="border rounded-lg p-4 sm:p-6 max-w-4xl mx-auto mb-8 sm:mb-12"
          style={{
            backgroundColor: themeConfig.colors.info + '20',
            borderColor: themeConfig.colors.info + '30'
          }}
        >
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3" style={{ color: themeConfig.colors.info }}>
              🎓 {t.noAccountRequired}
            </h2>
            <p className="leading-relaxed text-sm sm:text-base" style={{ color: themeConfig.colors.info }}>
              <strong>{t.startLearningImmediately}!</strong> {t.noAccountRequiredDesc}
            </p>
          </div>
        </div>

        {/* Patreon Support Section */}
        <div 
          className="rounded-xl sm:rounded-2xl shadow-xl border p-6 sm:p-8 mb-8 sm:mb-12 text-white"
          style={{ 
            background: themeConfig.gradients.primary,
            borderColor: themeConfig.colors.primary
          }}
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full mb-4 sm:mb-6">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">
              {language === 'pt-BR' ? 'Apoie no Patreon' : 'Support on Patreon'}
            </h2>
            <p className="text-white/90 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
              {language === 'pt-BR' 
                ? 'Junte-se à nossa comunidade no Patreon e ajude a manter o Studorama gratuito para todos. Escolha o nível de apoio que funciona para você!'
                : 'Join our community on Patreon and help keep Studorama free for everyone. Choose the support level that works for you!'
              }
            </p>
            <button
              onClick={handlePatreonSupport}
              className="inline-flex items-center bg-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base lg:text-lg"
              style={{ color: themeConfig.colors.primary }}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
              <span>
                {language === 'pt-BR' ? 'Apoiar no Patreon' : 'Support on Patreon'}
              </span>
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 flex-shrink-0" />
            </button>
            <p className="text-white/80 text-xs sm:text-sm mt-3 sm:mt-4">
              patreon.com/studorama
            </p>
          </div>
        </div>

        {/* Alternative Support Options */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-3" style={{ color: themeConfig.colors.text }}>
            {language === 'pt-BR' ? 'Outras Opções de Apoio' : 'Alternative Support Options'}
          </h2>
          <p className="text-sm sm:text-base" style={{ color: themeConfig.colors.textSecondary }}>
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
              className="rounded-xl sm:rounded-2xl shadow-lg border p-6 sm:p-8 relative overflow-hidden hover:shadow-xl transition-shadow duration-300"
              style={{
                backgroundColor: themeConfig.colors.surface,
                borderColor: themeConfig.colors.border
              }}
            >
              {product.name === 'Advanced' && (
                <div 
                  className="absolute top-0 right-0 text-white px-2 sm:px-4 py-1 text-xs sm:text-sm font-medium rounded-bl-lg"
                  style={{ background: themeConfig.gradients.primary }}
                >
                  {t.mostPopular}
                </div>
              )}

              <div className="text-center mb-6 sm:mb-8">
                <div 
                  className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-4"
                  style={{ backgroundColor: themeConfig.colors.primary + '20' }}
                >
                  {getIcon(product.name)}
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 leading-tight" style={{ color: themeConfig.colors.text }}>
                  {getSupportName(product.name)}
                </h3>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1" style={{ color: themeConfig.colors.text }}>
                  ${product.price}
                  <span className="text-sm sm:text-base lg:text-lg font-normal" style={{ color: themeConfig.colors.textSecondary }}>
                    {language === 'pt-BR' ? '/mês' : '/month'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm" style={{ color: themeConfig.colors.textMuted }}>
                  {t.monthlySponsorship}
                </p>
              </div>

              <div className="mb-6 sm:mb-8">
                <p className="text-center leading-relaxed text-sm sm:text-base" style={{ color: themeConfig.colors.textSecondary }}>
                  {getSupportDescription(product.name)}
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="flex items-start text-xs sm:text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" style={{ color: themeConfig.colors.error }} />
                  <span className="leading-relaxed">{t.supportFreeEducation}</span>
                </div>
                <div className="flex items-start text-xs sm:text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" style={{ color: themeConfig.colors.warning }} />
                  <span className="leading-relaxed">{t.helpImprovePlatform}</span>
                </div>
                <div className="flex items-start text-xs sm:text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                  <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" style={{ color: themeConfig.colors.primary }} />
                  <span className="leading-relaxed">{t.recognitionAsSupporter}</span>
                </div>
                <div className="flex items-start text-xs sm:text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" style={{ color: themeConfig.colors.info }} />
                  <span className="leading-relaxed">{t.helpKeepPlatformAccountless}</span>
                </div>
              </div>

              <button
                onClick={() => handleSponsor(product.priceId, product.mode)}
                disabled={loading === product.priceId}
                className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base text-white`}
                style={{ background: getGradient(product.name) }}
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

              <p className="text-center text-xs sm:text-sm mt-2 sm:mt-3 leading-relaxed" style={{ color: themeConfig.colors.textMuted }}>
                {t.externalCheckout}
              </p>
            </div>
          ))}
        </div>

        {/* Why Support Section */}
        <div 
          className="rounded-xl sm:rounded-2xl shadow-lg border p-6 sm:p-8 mb-8 sm:mb-12"
          style={{
            backgroundColor: themeConfig.colors.surface,
            borderColor: themeConfig.colors.border
          }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 px-2" style={{ color: themeConfig.colors.text }}>
            {t.whySponsorStudorama}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4"
                style={{ backgroundColor: themeConfig.colors.info + '20' }}
              >
                <Star className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: themeConfig.colors.info }} />
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base" style={{ color: themeConfig.colors.text }}>{t.keepItFree}</h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
                {t.keepItFreeDesc}
              </p>
            </div>
            <div className="text-center">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4"
                style={{ backgroundColor: themeConfig.colors.success + '20' }}
              >
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: themeConfig.colors.success }} />
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base" style={{ color: themeConfig.colors.text }}>{t.fundDevelopment}</h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
                {t.fundDevelopmentDesc}
              </p>
            </div>
            <div className="text-center">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4"
                style={{ backgroundColor: themeConfig.colors.primary + '20' }}
              >
                <Crown className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: themeConfig.colors.primary }} />
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base" style={{ color: themeConfig.colors.text }}>{t.serverCosts}</h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
                {t.serverCostsDesc}
              </p>
            </div>
            <div className="text-center">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4"
                style={{ backgroundColor: themeConfig.colors.warning + '20' }}
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: themeConfig.colors.warning }} />
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base" style={{ color: themeConfig.colors.text }}>{t.privacyFirst}</h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
                {t.privacyFirstDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Accountless Benefits */}
        <div 
          className="rounded-xl sm:rounded-2xl shadow-lg border p-6 sm:p-8 mb-8 sm:mb-12"
          style={{
            backgroundColor: themeConfig.colors.warning + '10',
            borderColor: themeConfig.colors.warning + '30'
          }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 px-2" style={{ color: themeConfig.colors.text }}>
            🚀 {t.startLearningInstantly}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: themeConfig.colors.text }}>✨ {t.noBarriersToLearning}</h3>
              <ul className="space-y-1.5 sm:space-y-2" style={{ color: themeConfig.colors.textSecondary }}>
                <li className="text-sm sm:text-base">• {t.noEmailRequired}</li>
                <li className="text-sm sm:text-base">• {t.noPasswordToRemember}</li>
                <li className="text-sm sm:text-base">• {t.noVerificationSteps}</li>
                <li className="text-sm sm:text-base">• {t.noPersonalDataCollection}</li>
                <li className="text-sm sm:text-base">• {t.startStudyingInSeconds}</li>
              </ul>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: themeConfig.colors.text }}>🔒 {t.privacyFocused}</h3>
              <ul className="space-y-1.5 sm:space-y-2" style={{ color: themeConfig.colors.textSecondary }}>
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
          <div 
            className="border rounded-lg p-4 sm:p-6 max-w-3xl mx-auto"
            style={{
              backgroundColor: themeConfig.colors.info + '10',
              borderColor: themeConfig.colors.info + '30'
            }}
          >
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3" style={{ color: themeConfig.colors.info }}>
              {t.transparencyTrust}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: themeConfig.colors.info }}>
              {t.transparencyTrustDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}