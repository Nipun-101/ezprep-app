/** @type {import('next').NextConfig} */

function apiOrigin() {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    return new URL(raw).origin;
  } catch {
    return 'http://localhost:4000';
  }
}

/**
 * Enforcing CSP with allowlists for OTP (MSG91 + hCaptcha + intl-tel-input),
 * Google OAuth, Razorpay, and the API.
 * 'unsafe-inline' / 'unsafe-eval' keep Next.js App Router working without a nonce pipeline.
 *
 * MSG91's otp-provider.js dynamically loads:
 * - pass.hostnsoft.com (widget runtime)
 * - js.hcaptcha.com / *.hcaptcha.com (bot check)
 * - cdnjs.cloudflare.com intl-tel-input
 */
function contentSecurityPolicy() {
  const api = apiOrigin();
  const directives = [
    "default-src 'self'",
    [
      'script-src',
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://verify.msg91.com',
      'https://control.msg91.com',
      'https://pass.hostnsoft.com',
      'https://cdnjs.cloudflare.com',
      'https://js.hcaptcha.com',
      'https://*.hcaptcha.com',
      'https://checkout.razorpay.com',
      'https://accounts.google.com',
      'https://apis.google.com',
      'https://va.vercel-scripts.com',
    ].join(' '),
    [
      'style-src',
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
      'https://cdnjs.cloudflare.com',
      'https://checkout.razorpay.com',
      'https://*.hcaptcha.com',
      'https://hcaptcha.com',
    ].join(' '),
    ['img-src', "'self'", 'data:', 'blob:', 'https:'].join(' '),
    [
      'font-src',
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
      'https://cdnjs.cloudflare.com',
    ].join(' '),
    [
      'connect-src',
      "'self'",
      api,
      'https://verify.msg91.com',
      'https://control.msg91.com',
      'https://api.msg91.com',
      'https://pass.hostnsoft.com',
      'https://*.hostnsoft.com',
      'https://hcaptcha.com',
      'https://*.hcaptcha.com',
      'https://accounts.google.com',
      'https://oauth2.googleapis.com',
      'https://www.googleapis.com',
      'https://api.razorpay.com',
      'https://lumberjack.razorpay.com',
      'https://va.vercel-scripts.com',
    ].join(' '),
    [
      'frame-src',
      "'self'",
      'https://verify.msg91.com',
      'https://control.msg91.com',
      'https://api.msg91.com',
      'https://pass.hostnsoft.com',
      'https://hcaptcha.com',
      'https://*.hcaptcha.com',
      'https://newassets.hcaptcha.com',
      'https://accounts.google.com',
      'https://api.razorpay.com',
      'https://checkout.razorpay.com',
    ].join(' '),
    ["worker-src", "'self'", 'blob:'].join(' '),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com https://checkout.razorpay.com https://api.razorpay.com https://hcaptcha.com https://*.hcaptcha.com",
    "frame-ancestors 'self'",
  ];
  return directives.join('; ');
}

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async redirects() {
    return [
      {
        source: '/terms-of-service',
        destination: '/terms',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy(),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
