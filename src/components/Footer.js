import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer__author">© {new Date().getFullYear()} Mesto Russia</p>
    </footer>
  );
}
