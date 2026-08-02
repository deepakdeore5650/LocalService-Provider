import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="app-bg border-t border-white/10 text-white">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-6 py-12 md:grid-cols-3">

        {/* Company Info */}
        <div>
          <h3 className="font-display text-2xl font-bold">Local Guardian</h3>
          <p className="mt-2 text-gray-400">Connecting you with trusted professionals for your service needs.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-display text-lg font-semibold text-white">Quick Links</h4>
          <ul className="mt-3 space-y-2">
            <li><a href="/" className="text-gray-400 transition-colors hover:text-accent-400">Home</a></li>
            <li><a href="/services" className="text-gray-400 transition-colors hover:text-accent-400">Services</a></li>
            <li><a href="/faq" className="text-gray-400 transition-colors hover:text-accent-400">FAQs</a></li>
            <li><a href="/privacy" className="text-gray-400 transition-colors hover:text-accent-400">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h4 className="font-display text-lg font-semibold text-white">Contact Us</h4>
          <p className="mt-3 text-gray-400">Email: support@localguardian.example</p>
          <p className="text-gray-400">Phone: +91-8767833212</p>
          <div className="mt-4 flex space-x-4">
            <a href="#" className="text-gray-400 transition-colors hover:text-primary-500"><FaFacebook size={22} /></a>
            <a href="#" className="text-gray-400 transition-colors hover:text-primary-500"><FaTwitter size={22} /></a>
            <a href="#" className="text-gray-400 transition-colors hover:text-accent-400"><FaInstagram size={22} /></a>
          </div>
        </div>

      </div>

      {/* Footer Bottom */}
      <div className="border-t border-white/10 py-4 text-center text-sm text-gray-500">
        &copy; 2026 Local Guardian. All Rights Reserved.
      </div>
    </footer>
  )
}
