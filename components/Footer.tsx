import { MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-16 pt-16 pb-8 text-gray-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <h3 className="text-2xl font-bold mb-4">Clara&Co</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Premium fashion curated for modern lifestyles. Timeless style,
            everyday comfort.
          </p>
        </div>

        {/* Store Address */}
        <div>
          <h4 className="font-semibold mb-4">Our Store</h4>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex gap-2.5">
              <MapPin size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-900 leading-tight">CLARA & CO</p>
                <p className="text-xs text-gray-500 mt-1">
                  beside DPS School, Opp to Marluce Bakery
                </p>
                <p className="text-xs text-gray-500">
                  Warangal, Telangana 506004, India
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone size={15} className="text-emerald-500 flex-shrink-0" />
              <span className="text-gray-700 font-semibold text-xs">+91 8374994838</span>
            </div>

            <div className="pt-1">
              <a 
                href="https://maps.app.goo.gl/GqrYLPmLuUaT9CUS6?g_st=ac" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <span>Navigate on Google Maps</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="font-semibold mb-4">Customer Care</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Shipping & Delivery</li>
            <li>Returns & Exchanges</li>
            <li>Track Your Order</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="font-semibold mb-4">Follow Us</h4>
          <div className="flex gap-4 text-gray-600">

            {/* Instagram */}
            <a href="https://www.instagram.com/clara_and_co_?igsh=a3B0MnI2Y3V1YWtz" target="_blank" className="hover:text-black transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7.75 2C4.686 2 2 4.686 2 7.75v8.5C2 19.314 4.686 22 7.75 22h8.5C19.314 22 22 19.314 22 16.25v-8.5C22 4.686 19.314 2 16.25 2h-8.5zM12 7.25a4.75 4.75 0 110 9.5 4.75 4.75 0 010-9.5zm0 1.5a3.25 3.25 0 100 6.5 3.25 3.25 0 000-6.5zm4.875-.625a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0z" />
              </svg>
            </a>

            {/* Facebook */}
            <a href="#" className="hover:text-black transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.5 22v-8h2.5l.375-3h-2.875V9.25c0-.87.243-1.463 1.5-1.463H16.5V5.125C16.223 5.088 15.333 5 14.297 5c-2.168 0-3.652 1.323-3.652 3.75V11H8v3h2.645v8H13.5z" />
              </svg>
            </a>

            {/* Twitter / X */}
            <a href="#" className="hover:text-black transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2H21l-6.5 7.43L22.5 22h-6.9l-5.4-6.92L4.4 22H1.64l7-8.01L1.5 2h7.02l4.88 6.27L18.244 2z" />
              </svg>
            </a>

          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t mt-12 pt-6 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} Clara&Co. All rights reserved.
      </div>
    </footer>
  );
}
