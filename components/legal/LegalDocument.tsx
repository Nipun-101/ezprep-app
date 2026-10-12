import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { brand } from '@/lib/brand';

export type LegalNavItem = {
  id: string;
  title: string;
};

const RELATED = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/user-policy', label: 'User Policy' },
  { href: '/delete-account', label: 'Delete account' },
];

const linkClass = 'text-teal-600 hover:text-teal-700 font-medium';

export function LegalDocument({
  title,
  lede,
  updated,
  currentPath,
  sections,
  children,
}: {
  title: string;
  lede: string;
  updated: string;
  currentPath: string;
  sections: LegalNavItem[];
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />

      <article className="flex-1 bg-gradient-to-b from-teal-50/80 via-white to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <Link href="/" className={`inline-flex text-sm ${linkClass} mb-6 transition-colors`}>
            ← Back to home
          </Link>

          <nav aria-label="Legal documents" className="flex flex-wrap gap-2">
            {RELATED.map((item) => {
              const active = item.href === currentPath;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-teal-500 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-700'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 lg:grid lg:grid-cols-[14.5rem_minmax(0,1fr)] lg:gap-12 xl:gap-16 items-start">
            <details className="lg:hidden group rounded-2xl border border-teal-100 bg-white shadow-sm">
              <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden px-4 py-3.5 text-sm font-semibold text-gray-800 flex items-center justify-between gap-3">
                On this page
                <span className="text-teal-600 text-xs font-medium group-open:hidden">Show</span>
                <span className="text-teal-600 text-xs font-medium hidden group-open:inline">Hide</span>
              </summary>
              <ul className="px-2 pb-3 space-y-0.5">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex items-start gap-2.5 rounded-lg px-2 py-2 text-sm text-gray-600 hover:bg-teal-50 hover:text-teal-800"
                    >
                      <span className="mt-0.5 text-xs font-semibold tabular-nums text-teal-600">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>{section.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </details>

            <nav aria-label="On this page" className="hidden lg:block sticky top-6">
              <p className="text-xs font-semibold tracking-widest text-teal-700 uppercase mb-3 px-2">
                On this page
              </p>
              <ul className="space-y-0.5 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-white hover:text-teal-800 transition-colors"
                    >
                      <span className="mt-0.5 text-xs font-semibold tabular-nums text-teal-600">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>{section.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="min-w-0 mt-8 lg:mt-0">
              <header className="mb-8 sm:mb-10">
                <p className="text-xs font-semibold tracking-widest text-teal-600 uppercase mb-3">
                  Legal
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">{title}</h1>
                <p className="mt-4 text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl">
                  {lede}
                </p>
                <p className="mt-3 text-sm text-gray-400">Last updated: {updated}</p>
              </header>
              {children}
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 mb-10 sm:mb-12">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalContact() {
  return (
    <section id="contact" className="scroll-mt-6 border-t border-gray-200 pt-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Contact</h2>
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-600 shadow-sm">
        <p className="font-semibold text-gray-800 mb-1">{brand.legalName}</p>
        <p>{brand.legalAddress}</p>
        <p className="mt-1">
          <a href={`mailto:${brand.supportEmail}`} className={linkClass}>
            {brand.supportEmail}
          </a>
        </p>
      </div>
    </section>
  );
}

export { linkClass as legalLinkClass };
