import { Mail, Linkedin, Github, Facebook } from "lucide-react";
import logo from '../../public/logo.svg';

export default function NavigationBar() {
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-neutral/60 backdrop-blur-md max-h-fit">
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">

        {/* Left Links */}
        <div className="flex gap-8 text-2xl text-base-300" >
          <a href="#works" className="hover:text-primary transition font-medium">
            Works
          </a>
          <a href="#about" className="hover:text-primary transition font-medium">
            About
          </a>
        </div>

        {/* Center Logo */}
        {/* <div className="absolute left-1/2 transform -translate-x-1/2 text-center"> */}
        <div className="text-center">
            <img src={logo} alt="Logo" className=" w-12 h-12 mx-auto" />
            <div className="text-2xl tracking-widest font-extralight text-base-300">Justin Ramas</div>
        </div>

        {/* Right Icons */}
        <div className="flex gap-6 items-center text-base-300">
          <a href="#" className="hover:text-primary transition">
            <Mail size={24} />
          </a>

          <a href="#" className="hover:text-primary transition">
            <Linkedin size={24} />
          </a>

          <a href="#" className="hover:text-primary transition">
            <Github size={24} />
          </a>

          <a href="#" className="hover:text-primary transition">
            <Facebook size={24} />
          </a>
        </div>
      </div>
    </div>
  );
}