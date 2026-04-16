import { Code2 } from 'lucide-react'
import React from 'react'

function footer() {
  const currentYear = new Date().getFullYear();
  return (
          <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <Code2 size={20} />
            <span>CogniCode Academy</span>
          </div>
          <p className="footer-copy">© {currentYear} CogniCode Academy. Built for inclusive education.</p>
        </div>
      </footer>
  )
}

export default footer