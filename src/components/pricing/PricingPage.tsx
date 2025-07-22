import { BookOpen, CheckCircle, Code, Coffee, Crown, ExternalLink, Gift, Github, Globe, Heart, Loader2, Shield, Sparkles, Star, Users, Zap } from 'lucide-react';
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

  const handleGitHubVisit = () => {
    window.open('https://github.com/oluiscabral/studorama', '_blank', 'noopener,noreferrer');
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Advanced':
        return <Crown className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: themeConfig.colors.primary }} />;
      case 'Standard':
        return <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: themeConfig.colors.primary }} />;
      case 'Basic':
        return <Coffee className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: themeConfig.colors.primary }} />;
      default:
        return <Heart className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: themeConfig.colors.primary }} />;
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
      className="min-h-screen py-6 sm:py-8 lg:py-12 safe-top safe-bottom"
      style={{ background: themeConfig.gradients.background }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 max-w-4xl mx-auto">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mb-6 sm:mb-8 shadow-2xl animate-pulse-slow"
            style={{ 
              background: themeConfig.gradients.primary,
              boxShadow: `0 20px 60px ${themeConfig.colors.primary}40`
            }}
          >
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white animate-pulse" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 px-2 leading-tight" style={{ color: themeConfig.colors.text }}>
            {t.supportStudorama}
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto mb-6 sm:mb-8 px-4 leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
            {t.supportStudoramaDesc}
          </p>
          
          {/* Free Forever Badge */}
          <div 
            className="inline-flex items-center space-x-3 px-6 py-3 sm:px-8 sm:py-4 rounded-full shadow-lg mb-6 sm:mb-8 animate-bounce-gentle"
            style={{
              background: themeConfig.gradients.primary,
              color: 'white'
            }}
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            <span className="font-bold text-base sm:text-lg">{t.freeForever}</span>
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          
          <p className="text-sm sm:text-base lg:text-lg leading-relaxed px-4" style={{ color: themeConfig.colors.textSecondary }}>
            {t.freeForeverDesc}
          </p>
        </div>

        {/* Key Benefits Section */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div 
              className="text-center p-6 sm:p-8 rounded-2xl sm:rounded-3xl border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: themeConfig.colors.surface,
                borderColor: themeConfig.colors.border
              }}
            >
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                style={{ backgroundColor: themeConfig.colors.success + '20' }}
              >
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: themeConfig.colors.success }} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: themeConfig.colors.text }}>
                {t.noAccountRequired}
              </h3>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
                {t.startLearningImmediately}! {t.noAccountRequiredDesc}
              </p>
            </div>

            <div 
              className="text-center p-6 sm:p-8 rounded-2xl sm:rounded-3xl border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: themeConfig.colors.surface,
                borderColor: themeConfig.colors.border
              }}
            >
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                style={{ backgroundColor: themeConfig.colors.info + '20' }}
              >
                <Shield className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: themeConfig.colors.info }} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: themeConfig.colors.text }}>
                {t.privacyFocused}
              </h3>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
                {t.dataStaysInBrowser}. {t.noTrackingOrAnalytics}. {t.completeAnonymity}.
              </p>
            </div>

            <div 
              className="text-center p-6 sm:p-8 rounded-2xl sm:rounded-3xl border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 sm:col-span-2 lg:col-span-1"
              style={{
                backgroundColor: themeConfig.colors.surface,
                borderColor: themeConfig.colors.border
              }}
            >
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                style={{ backgroundColor: themeConfig.colors.primary + '20' }}
              >
                <Code className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: themeConfig.colors.primary }} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: themeConfig.colors.text }}>
                {t.openSourceProject}
              </h3>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
                {t.openSourceDescription}
              </p>
            </div>
          </div>
        </div>

        {/* GitHub Repository Section */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div 
            className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border shadow-xl max-w-4xl mx-auto text-center"
            style={{
              backgroundColor: themeConfig.colors.surface,
              borderColor: themeConfig.colors.border
            }}
          >
            <div 
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-6 shadow-lg"
              style={{ backgroundColor: '#24292e' }}
            >
              <Github className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6" style={{ color: themeConfig.colors.text }}>
              {language === 'pt-BR' ? 'Código Aberto no GitHub' : 'Open Source on GitHub'}
            </h2>
            
            <p className="text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto" style={{ color: themeConfig.colors.textSecondary }}>
              {language === 'pt-BR' 
                ? 'Studorama é completamente open source! Explore o código, contribua com melhorias, reporte bugs ou faça um fork para seu próprio uso.'
                : 'Studorama is completely open source! Explore the code, contribute improvements, report bugs, or fork it for your own use.'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <button
                onClick={handleGitHubVisit}
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#24292e', color: 'white' }}
              >
                <Github className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                <span className="text-base sm:text-lg">{t.viewOnGitHub}</span>
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </button>
              
              <div className="flex items-center space-x-4 text-sm sm:text-base" style={{ color: themeConfig.colors.textMuted }}>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>{language === 'pt-BR' ? 'Estrelas' : 'Stars'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Code className="w-4 h-4" />
                  <span>{language === 'pt-BR' ? 'Forks' : 'Forks'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{language === 'pt-BR' ? 'Contribuidores' : 'Contributors'}</span>
                </div>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm mt-4 sm:mt-6" style={{ color: themeConfig.colors.textMuted }}>
              github.com/oluiscabral/studorama
            </p>
          </div>
        </div>

        {/* Patreon Support Section */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div 
            className="rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 text-center max-w-4xl mx-auto"
            style={{ 
              background: themeConfig.gradients.primary,
              boxShadow: `0 25px 80px ${themeConfig.colors.primary}30`
            }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full mb-6 sm:mb-8 animate-pulse">
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            
            <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              {language === 'pt-BR' ? 'Apoie no Patreon' : 'Support on Patreon'}
            </h2>
            
            <p className="text-white/90 mb-6 sm:mb-8 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto">
              {language === 'pt-BR' 
                ? 'Junte-se à nossa comunidade no Patreon e ajude a manter o Studorama gratuito para todos. Escolha o nível de apoio que funciona para você!'
                : 'Join our community on Patreon and help keep Studorama free for everyone. Choose the support level that works for you!'
              }
            </p>
            
            <button
              onClick={handlePatreonSupport}
              className="inline-flex items-center bg-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold hover:bg-gray-50 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 text-base sm:text-lg lg:text-xl"
              style={{ color: themeConfig.colors.primary }}
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 mr-3 animate-pulse" />
              <span>
                {language === 'pt-BR' ? 'Apoiar no Patreon' : 'Support on Patreon'}
              </span>
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 ml-3" />
            </button>
            
            <p className="text-white/80 text-sm sm:text-base mt-4 sm:mt-6">
              patreon.com/studorama
            </p>
          </div>
        </div>

        {/* Alternative Support Options */}
        {/* <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" style={{ color: themeConfig.colors.text }}>
            {language === 'pt-BR' ? 'Outras Opções de Apoio' : 'Alternative Support Options'}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl max-w-2xl mx-auto" style={{ color: themeConfig.colors.textSecondary }}>
            {language === 'pt-BR' 
              ? 'Prefere outras formas de apoio? Confira nossas opções de apoio direto:'
              : 'Prefer other ways to support? Check out our direct support options:'
            }
          </p>
        </div> */}

        {/* Support Tiers */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto mb-12 sm:mb-16">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`rounded-2xl sm:rounded-3xl shadow-xl border p-6 sm:p-8 relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
                product.name === 'Standard' ? 'lg:scale-110 lg:z-10' : ''
              }`}
              style={{
                backgroundColor: themeConfig.colors.surface,
                borderColor: product.name === 'Standard' ? themeConfig.colors.primary : themeConfig.colors.border,
                animationDelay: `${index * 100}ms`
              }}
            >
              {product.name === 'Standard' && (
                <div 
                  className="absolute top-0 right-0 text-white px-4 py-2 text-sm font-bold rounded-bl-2xl"
                  style={{ background: themeConfig.gradients.primary }}
                >
                  {t.mostPopular}
                </div>
              )}

              <div className="text-center mb-6 sm:mb-8">
                <div 
                  className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-4 sm:mb-6 shadow-lg"
                  style={{ backgroundColor: themeConfig.colors.primary + '20' }}
                >
                  {getIcon(product.name)}
                </div>
                
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 leading-tight" style={{ color: themeConfig.colors.text }}>
                  {getSupportName(product.name)}
                </h3>
                
                <div className="mb-2 sm:mb-3">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{ color: themeConfig.colors.text }}>
                    ${product.price}
                  </span>
                  <span className="text-base sm:text-lg lg:text-xl font-normal ml-1" style={{ color: themeConfig.colors.textSecondary }}>
                    {language === 'pt-BR' ? '/mês' : '/month'}
                  </span>
                </div>
                
                <p className="text-sm sm:text-base" style={{ color: themeConfig.colors.textMuted }}>
                  {t.monthlySponsorship}
                </p>
              </div>

              <div className="mb-6 sm:mb-8">
                <p className="text-center leading-relaxed text-sm sm:text-base" style={{ color: themeConfig.colors.textSecondary }}>
                  {getSupportDescription(product.name)}
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {[
                  { icon: Heart, text: t.supportFreeEducation, color: themeConfig.colors.error },
                  { icon: Star, text: t.helpImprovePlatform, color: themeConfig.colors.warning },
                  { icon: Crown, text: t.recognitionAsSupporter, color: themeConfig.colors.primary },
                  { icon: Shield, text: t.helpKeepPlatformAccountless, color: themeConfig.colors.info }
                ].map(({ icon: Icon, text, color }, idx) => (
                  <div key={idx} className="flex items-start text-sm sm:text-base" style={{ color: themeConfig.colors.textSecondary }}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-3 flex-shrink-0 mt-0.5" style={{ color }} />
                    <span className="leading-relaxed">{text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSponsor(product.priceId, product.mode)}
                disabled={loading === product.priceId}
                className="w-full py-3 sm:py-4 px-6 rounded-full font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base sm:text-lg text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                style={{ background: getGradient(product.name) }}
              >
                {loading === product.priceId ? (
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                ) : (
                  <>
                    <Gift className="w-5 h-5 sm:w-6 sm:h-6 mr-2 flex-shrink-0" />
                    <span className="text-center leading-tight">
                      {t.becomeSupporter} {getSupportName(product.name)}
                    </span>
                  </>
                )}
              </button>

              <p className="text-center text-xs sm:text-sm mt-3 sm:mt-4 leading-relaxed" style={{ color: themeConfig.colors.textMuted }}>
                {t.externalCheckout}
              </p>
            </div>
          ))}
        </div> */}

        {/* Why Support Section */}
        <div 
          className="rounded-2xl sm:rounded-3xl shadow-xl border p-6 sm:p-8 lg:p-10 mb-12 sm:mb-16"
          style={{
            backgroundColor: themeConfig.colors.surface,
            borderColor: themeConfig.colors.border
          }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 px-2" style={{ color: themeConfig.colors.text }}>
            {t.whySponsorStudorama}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: Star, title: t.keepItFree, desc: t.keepItFreeDesc, color: themeConfig.colors.info },
              { icon: Zap, title: t.fundDevelopment, desc: t.fundDevelopmentDesc, color: themeConfig.colors.success },
              { icon: Globe, title: t.serverCosts, desc: t.serverCostsDesc, color: themeConfig.colors.primary },
              { icon: Shield, title: t.privacyFirst, desc: t.privacyFirstDesc, color: themeConfig.colors.warning }
            ].map(({ icon: Icon, title, desc, color }, index) => (
              <div key={index} className="text-center">
                <div 
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg"
                  style={{ backgroundColor: color + '20' }}
                >
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color }} />
                </div>
                <h3 className="font-bold mb-3 sm:mb-4 text-base sm:text-lg" style={{ color: themeConfig.colors.text }}>
                  {title}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: themeConfig.colors.textSecondary }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Transparency Section */}
        <div className="text-center max-w-4xl mx-auto">
          <div 
            className="border rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg"
            style={{
              backgroundColor: themeConfig.colors.info + '10',
              borderColor: themeConfig.colors.info + '30'
            }}
          >
            <div 
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-6 sm:mb-8"
              style={{ backgroundColor: themeConfig.colors.info + '20' }}
            >
              <Shield className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: themeConfig.colors.info }} />
            </div>
            
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6" style={{ color: themeConfig.colors.info }}>
              {t.transparencyTrust}
            </h3>
            
            <p className="text-sm sm:text-base lg:text-lg leading-relaxed" style={{ color: themeConfig.colors.info }}>
              {t.transparencyTrustDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
