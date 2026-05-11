import React from "react";
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";


const Footer = () => {
  return (
    <footer className="bg-[#e0e5ec] py-10 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand */}
          <div className="p-6 rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#bec3c9,-8px_-8px_16px_#ffffff]">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">
              Ai Resume Analyzer
            </h2>

            <p className="text-gray-600 leading-7">
              Creating elegant and modern user experiences with soft UI and
              scalable technologies.
            </p>
          </div>

          {/* Links */}
          <div className="p-6 rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#bec3c9,-8px_-8px_16px_#ffffff]">
            <h3 className="text-xl font-semibold text-gray-700 mb-5">
              Quick Links
            </h3>

            <ul className="space-y-4">
              {["Home", "About", "Projects", "Contact"].map((item) => (
                <li key={item}>
                  <a
                    href={`/${item.toLowerCase()}`}
                    className="text-gray-600 hover:text-gray-800 transition duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="p-6 rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#bec3c9,-8px_-8px_16px_#ffffff]">
            <h3 className="text-xl font-semibold text-gray-700 mb-5">
              Connect
            </h3>

            <div className="flex gap-5">
              {[
                { icon: <FaGithub />, link: "#" },
                { icon: <FaLinkedin />, link: "#" },
                { icon: <FaTwitter />, link: "#" },
                { icon: <FaInstagram />, link: "#" },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.link}
                  className="
                    w-14 h-14 flex items-center justify-center
                    rounded-2xl text-gray-700 text-xl
                    bg-[#e0e5ec]
                    shadow-[6px_6px_12px_#bec3c9,-6px_-6px_12px_#ffffff]
                    hover:shadow-[inset_4px_4px_8px_#bec3c9,inset_-4px_-4px_8px_#ffffff]
                    transition-all duration-300
                  "
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 YourProject. Crafted with Soft UI Design.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;