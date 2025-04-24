
import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-border py-6 mt-10">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Data provided by the{" "}
          <a
            href="https://exoplanetarchive.ipac.caltech.edu/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            NASA Exoplanet Archive
          </a>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          © {new Date().getFullYear()} exo!
        </p>
      </div>
    </footer>
  );
};

export default Footer;
