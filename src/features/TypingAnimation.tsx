// import { motion } from "framer-motion";
// import { useEffect, useState } from "react";

// const roles = [
//   "IT Professional",
//   "Software Developer",
//   "Tech Enthusiast",
//   "Student Developer",
// ];

// export default function TypingAnimation() {
//   const [text, setText] = useState("");
//   const [roleIndex, setRoleIndex] = useState(0);
//   const [isDeleting, setIsDeleting] = useState(false);

//   useEffect(() => {
//     const current = roles[roleIndex];
//     const speed = isDeleting ? 40 : 80;

//     const timeout = setTimeout(() => {
//       if (!isDeleting) {
//         setText(current.substring(0, text.length + 1));

//         if (text === current) {
//           setTimeout(() => setIsDeleting(true), 1500);
//         }
//       } else {
//         setText(current.substring(0, text.length - 1));

//         if (text === "") {
//           setIsDeleting(false);
//           setRoleIndex((prev) => (prev + 1) % roles.length);
//         }
//       }
//     }, speed);

//     return () => clearTimeout(timeout);
//   }, [text, isDeleting, roleIndex]);

//   return (
//     <h2 className="text-lg md:text-1xl max-w-3xl font-light mb-4 text-base-300">
//       {text}

//       {/* Blinking cursor */}
//       {/* <motion.span
//         animate={{ opacity: [1, 0, 1] }}
//         transition={{ repeat: Infinity, duration: 1 }}
//       >
//         |
//       </motion.span> */}
//     </h2>
//   );
// }


import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const roles = [
  "IT Professional",
  "Software Developer",
  "Tech Enthusiast",
  "Student Developer",
];

export default function HeroTyping() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // return (
  //   <div className="relative h-8 mb-4">
  //     <h2 className="text-lg md:text-xl max-w-3xl font-light text-base-300 absolute w-full text-center tracking-wide">
  //       <AnimatePresence mode="wait">
  //         <motion.span
  //           key={roles[index]}
  //           className="absolute left-0 right-0"
  //           initial={{ opacity: 0, y: 10 }}
  //           animate={{ opacity: 1, y: 0 }}
  //           exit={{ opacity: 0, y: -10 }}
  //           transition={{ duration: 0.4 }}
  //         >
  //           {roles[index]}
  //         </motion.span>
  //       </AnimatePresence>
  //     </h2>
  //   </div>
  // );
  return (
  <div className="relative mb-4">
    {/* Invisible text keeps width & height stable */}
    <span className="invisible text-lg md:text-xl font-light tracking-wide">
      Software Developer
    </span>

    <h2 className="absolute inset-0 flex items-center justify-center text-lg md:text-xl max-w-3xl font-light text-base-300 tracking-wide">
      <AnimatePresence mode="wait">
        <motion.span
          key={roles[index]}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          {roles[index]}
        </motion.span>
      </AnimatePresence>
    </h2>
  </div>
);
}