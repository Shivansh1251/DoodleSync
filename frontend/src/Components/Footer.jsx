export default function Footer() {
  return (
    <footer className="mt-10 border-t border-gray-200">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-gray-600 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="font-semibold">DoodleSync</div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-gray-800">Privacy</a>
          <a href="#" className="hover:text-gray-800">Terms</a>
          <a href="#" className="hover:text-gray-800">Contact</a>
        </div>
        <div>© {new Date().getFullYear()} DoodleSync. All rights reserved.</div>
      </div>
    </footer>
  )
}
