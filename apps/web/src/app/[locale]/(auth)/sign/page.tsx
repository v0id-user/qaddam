'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAuthActions } from '@convex-dev/auth/react';

const GoogleIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 268.1522 273.8827"
    overflow="hidden"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="a">
        <stop offset="0" stopColor="#0fbc5c" />
        <stop offset="1" stopColor="#0cba65" />
      </linearGradient>
      <linearGradient id="g">
        <stop offset=".2312727" stopColor="#0fbc5f" />
        <stop offset=".3115468" stopColor="#0fbc5f" />
        <stop offset=".3660131" stopColor="#0fbc5e" />
        <stop offset=".4575163" stopColor="#0fbc5d" />
        <stop offset=".540305" stopColor="#12bc58" />
        <stop offset=".6993464" stopColor="#28bf3c" />
        <stop offset=".7712418" stopColor="#38c02b" />
        <stop offset=".8605665" stopColor="#52c218" />
        <stop offset=".9150327" stopColor="#67c30f" />
        <stop offset="1" stopColor="#86c504" />
      </linearGradient>
      <linearGradient id="h">
        <stop offset=".1416122" stopColor="#1abd4d" />
        <stop offset=".2475151" stopColor="#6ec30d" />
        <stop offset=".3115468" stopColor="#8ac502" />
        <stop offset=".3660131" stopColor="#a2c600" />
        <stop offset=".4456735" stopColor="#c8c903" />
        <stop offset=".540305" stopColor="#ebcb03" />
        <stop offset=".6156363" stopColor="#f7cd07" />
        <stop offset=".6993454" stopColor="#fdcd04" />
        <stop offset=".7712418" stopColor="#fdce05" />
        <stop offset=".8605661" stopColor="#ffce0a" />
      </linearGradient>
      <linearGradient id="f">
        <stop offset=".3159041" stopColor="#ff4c3c" />
        <stop offset=".6038179" stopColor="#ff692c" />
        <stop offset=".7268366" stopColor="#ff7825" />
        <stop offset=".884534" stopColor="#ff8d1b" />
        <stop offset="1" stopColor="#ff9f13" />
      </linearGradient>
      <linearGradient id="b">
        <stop offset=".2312727" stopColor="#ff4541" />
        <stop offset=".3115468" stopColor="#ff4540" />
        <stop offset=".4575163" stopColor="#ff4640" />
        <stop offset=".540305" stopColor="#ff473f" />
        <stop offset=".6993464" stopColor="#ff5138" />
        <stop offset=".7712418" stopColor="#ff5b33" />
        <stop offset=".8605665" stopColor="#ff6c29" />
        <stop offset="1" stopColor="#ff8c18" />
      </linearGradient>
      <linearGradient id="d">
        <stop offset=".4084578" stopColor="#fb4e5a" />
        <stop offset="1" stopColor="#ff4540" />
      </linearGradient>
      <linearGradient id="c">
        <stop offset=".1315461" stopColor="#0cba65" />
        <stop offset=".2097843" stopColor="#0bb86d" />
        <stop offset=".2972969" stopColor="#09b479" />
        <stop offset=".3962575" stopColor="#08ad93" />
        <stop offset=".4771242" stopColor="#0aa6a9" />
        <stop offset=".5684245" stopColor="#0d9cc6" />
        <stop offset=".667385" stopColor="#1893dd" />
        <stop offset=".7687273" stopColor="#258bf1" />
        <stop offset=".8585063" stopColor="#3086ff" />
      </linearGradient>
      <linearGradient id="e">
        <stop offset=".3660131" stopColor="#ff4e3a" />
        <stop offset=".4575163" stopColor="#ff8a1b" />
        <stop offset=".540305" stopColor="#ffa312" />
        <stop offset=".6156363" stopColor="#ffb60c" />
        <stop offset=".7712418" stopColor="#ffcd0a" />
        <stop offset=".8605665" stopColor="#fecf0a" />
        <stop offset=".9150327" stopColor="#fecf08" />
        <stop offset="1" stopColor="#fdcd01" />
      </linearGradient>
      <radialGradient id="m" cx="109.6267" cy="135.8619" r="71.46001">
        <stop offset=".2312727" stopColor="#ff4541" />
        <stop offset=".3115468" stopColor="#ff4540" />
        <stop offset=".4575163" stopColor="#ff4640" />
        <stop offset=".540305" stopColor="#ff473f" />
        <stop offset=".6993464" stopColor="#ff5138" />
        <stop offset=".7712418" stopColor="#ff5b33" />
        <stop offset=".8605665" stopColor="#ff6c29" />
        <stop offset="1" stopColor="#ff8c18" />
      </radialGradient>
      <radialGradient id="n" cx="45.25866" cy="279.2738" r="71.46001">
        <stop offset=".1315461" stopColor="#0cba65" />
        <stop offset=".2097843" stopColor="#0bb86d" />
        <stop offset=".2972969" stopColor="#09b479" />
        <stop offset=".3962575" stopColor="#08ad93" />
        <stop offset=".4771242" stopColor="#0aa6a9" />
        <stop offset=".5684245" stopColor="#0d9cc6" />
        <stop offset=".667385" stopColor="#1893dd" />
        <stop offset=".7687273" stopColor="#258bf1" />
        <stop offset=".8585063" stopColor="#3086ff" />
      </radialGradient>
      <clipPath id="i">
        <path d="M371.3784 193.2406H237.0825v53.4375h77.167c-1.2405 7.5627-4.0259 15.0024-8.1049 21.7862-4.6734 7.7723-10.4511 13.6895-16.373 18.1957-17.7389 13.4983-38.42 16.2584-52.7828 16.2584-36.2824 0-67.2833-23.2865-79.2844-54.9287-.4843-1.1482-.8059-2.3344-1.1975-3.5068-2.652-8.0533-4.101-16.5825-4.101-25.4474 0-9.226 1.5691-18.0575 4.4301-26.3985 11.2851-32.8967 42.9849-57.4674 80.1789-57.4674 7.4811 0 14.6854.8843 21.5173 2.6481 15.6135 4.0309 26.6578 11.9698 33.4252 18.2494l40.834-39.7111c-24.839-22.616-57.2194-36.3201-95.8444-36.3201-30.8782-.00066-59.3863 9.55308-82.7477 25.6992-18.9454 13.0941-34.4833 30.6254-44.9695 50.9861-9.75366 18.8785-15.09441 39.7994-15.09441 62.2934 0 22.495 5.34891 43.6334 15.10261 62.3374v.126c10.3023 19.8567 25.3678 36.9537 43.6783 49.9878 15.9962 11.3866 44.6789 26.5516 84.0307 26.5516 22.6301 0 42.6867-4.0517 60.3748-11.6447 12.76-5.4775 24.0655-12.6217 34.3012-21.8036 13.5247-12.1323 24.1168-27.1388 31.3465-44.4041 7.2297-17.2654 11.097-36.7895 11.097-57.957 0-9.858-.9971-19.8694-2.6881-28.9684Z" />
      </clipPath>
    </defs>
    <g transform="matrix(0.957922,0,0,0.985255,-90.17436,-78.85577)" clipPath="url(#i)">
      <path
        d="M92.07563 219.9585c.14844 22.14 6.5014 44.983 16.11767 63.4234v.1269c6.9482 13.3919 16.4444 23.9704 27.2604 34.4518l65.326-23.67c-12.3593-6.2344-14.2452-10.0546-23.1048-17.0253-9.0537-9.0658-15.8015-19.4735-20.0038-31.677h-.1693l.1693-.1269c-2.7646-8.0587-3.0373-16.6129-3.1393-25.5029Z"
        fill="url(#g)"
      />
      <path
        d="M237.0835 79.02491c-6.4568 22.52569-3.988 44.42139 0 57.16129 7.4561.0055 14.6388.8881 21.4494 2.6464 15.6135 4.0309 26.6566 11.97 33.424 18.2496l41.8794-40.7256c-24.8094-22.58904-54.6663-37.2961-96.7528-37.33169Z"
        fill="url(#d)"
      />
      <path
        d="M236.9434 78.84678c-31.6709-.00068-60.9107 9.79833-84.8718 26.35902-8.8968 6.149-17.0612 13.2521-24.3311 21.1509-1.9045 17.7429 14.2569 39.5507 46.2615 39.3702 15.5284-17.9373 38.4946-29.5427 64.0561-29.5427.0233 0 .046.0019.0693.002l-1.0439-57.33536c-.0472-.00003-.0929-.00406-.1401-.00406Z"
        fill="url(#m)"
      />
      <path
        d="m341.4751 226.3788-28.2685 19.2848c-1.2405 7.5627-4.0278 15.0023-8.1068 21.7861-4.6734 7.7723-10.4506 13.6898-16.3725 18.196-17.7022 13.4704-38.3286 16.2439-52.6877 16.2553-14.8415 25.1018-17.4435 37.6749 1.0439 57.9342 22.8762-.0167 43.157-4.1174 61.0458-11.7965 12.9312-5.551 24.3879-12.7913 34.7609-22.0964 13.7061-12.295 24.4421-27.5034 31.7688-45.0003 7.3267-17.497 11.2446-37.2822 11.2446-58.7336Z"
        fill="url(#n)"
      />
      <path
        d="M234.9956 191.2104v57.4981h136.0062c1.1962-7.8745 5.1523-18.0644 5.1523-26.5001 0-9.858-.9963-21.899-2.6873-30.998Z"
        fill="#3086ff"
      />
    </g>
  </svg>
);

const TaglineBubble = ({ text, className = '' }: { text: string; className?: string }) => (
  <div
    className={`absolute hidden rounded-full border border-gray-200 bg-white/80 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm backdrop-blur-sm md:block ${className}`}
  >
    {text}
  </div>
);

const SignPage = () => {
  const t = useTranslations('auth');
  const { signIn } = useAuthActions();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 h-72 w-72 rounded-full bg-indigo-100 opacity-30 blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-purple-100 opacity-20 blur-3xl"></div>
      </div>

      {/* Tagline Bubbles */}
      <TaglineBubble text={t('taglines.intelligence_precision')} className="top-20 left-20" />
      <TaglineBubble text={t('taglines.apply_right')} className="top-32 right-32" />
      <TaglineBubble text={t('taglines.smart_resume')} className="top-1/2 left-10" />
      <TaglineBubble text={t('taglines.ai_smart')} className="top-1/2 right-16" />
      <TaglineBubble text={t('taglines.forget_random')} className="bottom-40 left-24" />
      <TaglineBubble text={t('taglines.no_search')} className="right-28 bottom-32" />
      <TaglineBubble
        text={t('taglines.profile_ready')}
        className="bottom-20 left-1/2 -translate-x-1/2 transform"
      />

      {/* Main Content */}
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">{t('sign_in')}</h1>
            <p className="text-gray-600">{t('welcome')}</p>
          </div>

          {/* Google Sign In Button */}
          <div className="space-y-4">
            <Button
              onClick={() => {
                signIn('google', { redirectTo: '/dashboard' });
              }}
              className="w-full rounded-xl border border-gray-300 bg-white py-3 text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
              size="lg"
            >
              <GoogleIcon />
              <span className="mr-3">{t('continue_with_google')}</span>
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              {t('terms_text')}{' '}
              <a href="#" className="text-primary hover:underline">
                {t('terms_of_service')}
              </a>{' '}
              {t('and')}{' '}
              <a href="#" className="text-primary hover:underline">
                {t('privacy_policy')}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Legal Footer */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform text-center text-xs text-gray-400">
        <p>{t('copyright')}</p>
      </div>
    </div>
  );
};

export default SignPage;
