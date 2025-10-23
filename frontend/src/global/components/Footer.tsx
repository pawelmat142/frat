const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">

        <div className="footer-container">
          <p>2025 FRAT - High-Altitude Work Professional Network Platform</p>

          <div className="flex items-end gap-2">
            <span className="text-xs opacity-40">by</span>
            <a href="https://drawit-pawel-malek.netlify.app/" title="drawit Pawel Malek" rel="noopener noreferrer" target="_blank">
              <img className="h-5 opacity-40" src="https://drawit-pawel-malek.netlify.app/assets/drawit-logo-name-white.png" alt="DrawIt Logo" />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;