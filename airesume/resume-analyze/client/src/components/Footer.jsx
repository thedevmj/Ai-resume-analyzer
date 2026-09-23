import {
  FaGithub,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa";
import Reveal from "./Reveal";


const Footer = () => {
  return (
    <footer className="bg-[#1b120f] py-10 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Brand */}
          <Reveal delay={0}>
            <div className="h-full p-6 rounded-3xl bg-[#241814] border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/40">
              <h2 className="text-2xl font-bold text-amber-50 mb-4">
                Ai Resume Analyzer
              </h2>

              <p className="text-stone-400 leading-7">
                Creating elegant and modern user experiences with AI-powered
                resume analysis and scalable technologies.
              </p>
            </div>
          </Reveal>

          {/* Social */}
          <Reveal delay={120}>
            <div className="h-full p-6 rounded-3xl bg-[#241814] border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/40">
              <h3 className="text-xl font-semibold text-amber-50 mb-5">
                Connect
              </h3>

              <div className="flex gap-4">
                {[
                  { icon: <FaGithub />, link: "https://github.com/thedevmj" },
                  { icon: <FaLinkedin />, link: "https://www.linkedin.com/in/junaid-mansuri-devmj" },
                  {icon : <FaWhatsapp/>, link:"https://wa.me/919649354858?text=Hello%20I%20want%20to%20know%20more" }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      w-12 h-12 flex items-center justify-center
                      rounded-xl text-stone-400 text-lg
                      bg-white/5
                      border border-white/10
                      hover:border-rose-500/50 hover:text-amber-200
                      hover:bg-rose-500/10
                      hover:-translate-y-1
                      transition-all duration-300
                    "
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-stone-500 text-sm">
            © 2026 Ai Resume Analyzer. Crafted with professional care.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;