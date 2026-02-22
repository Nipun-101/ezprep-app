import { BookOpen, Youtube, Twitter, Linkedin, Send, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  Exams: [
    { label: 'UPSC CSE', href: '#' },
    { label: 'SSC CGL', href: '#' },
    { label: 'IBPS PO', href: '#' },
    { label: 'RRB NTPC', href: '#' },
    { label: 'SBI PO', href: '#' },
  ],
  Resources: [
    { label: 'Mock Tests', href: '#' },
    { label: 'Question Bank', href: '#' },
    { label: 'Current Affairs', href: '#' },
    { label: 'Concept Videos', href: '#' },
    { label: 'Study Material', href: '#' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Success Stories', href: '#' },
    { label: 'Press Kit', href: '#' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Report Issue', href: '#' },
    { label: 'Refund Policy', href: '#' },
    { label: 'Accessibility', href: '#' },
  ],
};

const socials = [
  { icon: Youtube, label: 'YouTube', href: '#', hoverColor: 'hover:text-red-400' },
  { icon: Send, label: 'Telegram', href: '#', hoverColor: 'hover:text-sky-400' },
  { icon: Twitter, label: 'Twitter / X', href: '#', hoverColor: 'hover:text-slate-300' },
  { icon: Linkedin, label: 'LinkedIn', href: '#', hoverColor: 'hover:text-blue-400' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-10 pb-8 md:pt-16 md:pb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 md:gap-10 border-b border-white/10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-900/30">
                <BookOpen className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <span className="text-white font-extrabold text-xl tracking-tight">EzPrep</span>
            </div>

            <p className="text-sm leading-relaxed text-gray-400 mb-6 max-w-xs">
              India's smartest exam prep platform — AI-powered mock tests, expert mentors, and everything you need to crack government exams.
            </p>

            <div className="flex gap-3 mb-8">
              {socials.map(({ icon: Icon, label, href, hoverColor }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 ${hoverColor}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5 text-gray-500">
                <Mail className="w-4 h-4 shrink-0 text-teal-500" />
                <span>support@ezprep.in</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-500">
                <Phone className="w-4 h-4 shrink-0 text-teal-500" />
                <span>+91 9633853218</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-500">
                <MapPin className="w-4 h-4 shrink-0 text-teal-500" />
                <span>Kochi, India</span>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-1 lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-white font-semibold text-sm mb-4 tracking-wide">{category}</h4>
                <ul className="space-y-2.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="text-sm text-gray-500 hover:text-teal-400 transition-colors duration-200 hover:translate-x-0.5 inline-block"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span>© {new Date().getFullYear()} EzPrep Technologies Pvt. Ltd. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <span className="w-px h-3 bg-white/10" />
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
            <span className="w-px h-3 bg-white/10" />
            <a href="#" className="hover:text-gray-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
