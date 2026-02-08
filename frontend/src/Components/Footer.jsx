export default function Footer() {
  return (
    <footer className="mt-10 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-gray-600 dark:text-gray-400 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-300">
        <div className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">DoodleSync</div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300">Privacy</a>
          <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300">Terms</a>
          <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-300">Contact</a>
        </div>
        <div>© {new Date().getFullYear()} DoodleSync. All rights reserved.</div>
      </div>
    </footer>
  )
}
