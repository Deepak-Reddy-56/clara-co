import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-white sticky top-0 z-50 border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-gray-900"
        >
          Clara&Co
        </Link>

        {/* Center Navigation */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex gap-12 text-gray-700 font-medium text-[15px] reminder tracking-wide">
          <Link href="/shop" className="hover:text-black transition">Shop</Link>
          <Link href="#new-arrivals" className="hover:text-black transition">New Arrivals</Link>
          <Link href="#top-selling" className="hover:text-black transition">Top Selling</Link>
          <Link href="#browse-style" className="hover:text-black transition">Styles</Link>
        </nav>

        {/* Right Side Icons */}
        <div className="flex items-center gap-6 text-gray-700">

          {/* Search Icon */}
          <button className="hover:text-black transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
            </svg>
          </button>

          {/* Cart Icon */}
          <button className="hover:text-black transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386a1.5 1.5 0 0 1 1.464 1.175l.383 1.533m0 0 1.5 6h11.25l1.5-6m-14.25 0h14.25M6 21a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm12 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
            </svg>
          </button>

          {/* User Icon */}
          <button className="hover:text-black transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />
            </svg>
          </button>

        </div>
      </div>
    </header>
  );
}
