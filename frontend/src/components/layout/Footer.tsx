export function Footer() {
  return (
    <footer className="bg-[#0f0e0d] text-[#6c6a64] border-t border-[#252320]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#cc785c]">
              <span className="text-xs font-bold text-white">O</span>
            </div>
          </div>
          <p className="text-xs">&copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  )
}
