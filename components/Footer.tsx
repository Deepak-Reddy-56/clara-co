export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-16 pt-16 pb-8 text-gray-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10">
        
        {/* Brand Info */}
        <div>
          <h3 className="text-2xl font-bold mb-4">SHOP.CO</h3>
          <p className="text-gray-600 text-sm">
            We have clothes that suits your style and which you're proud to wear. From women to men.
          </p>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold mb-4">COMPANY</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>About</li>
            <li>Features</li>
            <li>Works</li>
            <li>Career</li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <h4 className="font-semibold mb-4">HELP</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Customer Support</li>
            <li>Delivery Details</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* FAQ */}
        <div>
          <h4 className="font-semibold mb-4">FAQ</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Account</li>
            <li>Manage Deliveries</li>
            <li>Orders</li>
            <li>Payments</li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="font-semibold mb-4">RESOURCES</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Free eBooks</li>
            <li>Development Tutorial</li>
            <li>How to - Blog</li>
            <li>YouTube Playlist</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t mt-12 pt-6 text-center text-sm text-gray-600">
        Shop.co © 2000-2023, All Rights Reserved
      </div>
    </footer>
  );
}
