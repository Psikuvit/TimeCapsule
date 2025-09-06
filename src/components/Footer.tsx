export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center">
              <img src="/icon.svg" alt="TimeCapsule" className="w-8 h-8 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                TimeCapsule
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Send messages to your future self and reflect on your journey over time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Legal
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <a 
                  href="/terms" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="/privacy" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Support
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <a 
                  href="/contact" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Contact & FAQ
                </a>
              </li>
              <li>
                <a 
                  href="mailto:nacer.msi1@gmail.com" 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  nacer.msi1@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} TimeCapsule. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
