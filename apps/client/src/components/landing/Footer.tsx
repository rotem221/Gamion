export function Footer() {
  return (
    <footer className="py-8 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-lg font-bold bg-gradient-to-r from-gamion-primary to-gamion-secondary bg-clip-text text-transparent">
          Gamion
        </span>
        <p className="text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Gamion. Built with React, Socket.io
          &amp; Three.js.
        </p>
      </div>
    </footer>
  );
}
