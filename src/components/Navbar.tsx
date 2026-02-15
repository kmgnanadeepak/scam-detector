import { Shield } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="glass-strong rounded-3xl px-6 py-3 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Shield
              className="w-7 h-7 text-primary"
              style={{ filter: "drop-shadow(0 0 6px hsl(187 70% 48% / 0.4))" }}
            />
            <span className="font-display font-bold text-xl text-foreground">
              Trust<span className="neon-text-cyan">Verify</span>
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
