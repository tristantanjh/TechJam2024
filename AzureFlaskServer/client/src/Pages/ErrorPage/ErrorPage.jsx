import Particles from "@/Components/magicui/particles";
import "./ErrorPage.css";
import { useState } from "react";
import { motion } from "framer-motion";
import { VelocityScroll } from "@/Components/magicui/scroll-based-velocity";

export default function ErrorPage() {
  const [color, setColor] = useState("#00000");

  return (
    <>
      <div className="relative flex h-screen w-full items-center justify-center overflow-hidden rounded-lg border bg-background p-4 md:shadow-xl">
        <motion.div
          initial={{ rotate: 90 }}
          animate={{ rotate: 0, scale: 2.5, top: "-90vw" }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
          style={{ originX: 0.66 }}
          className="w-[200vw] h-[50vw] absolute bg-slate-900"
        ></motion.div>
        <motion.div
          initial={{ rotate: 90 }}
          animate={{ rotate: 0, scale: 2.5, top: 5 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
          style={{ originX: 0.55 }}
          className="w-screen absolute"
        >
          <VelocityScroll
            text="STAY OUT 404"
            default_velocity={5}
            className="cursor-none font-display p-2 text-center text-4xl font-bold tracking-[-0.02em] text-black drop-shadow-sm dark:text-white md:text-7xl md:leading-[5rem]"
            left={false}
          />
        </motion.div>
        <motion.div
          initial={{ rotate: 90 }}
          animate={{ rotate: 0, scale: 2.5, bottom: 15 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
          style={{ originX: 0.45 }}
          className="w-screen absolute"
        >
          <VelocityScroll
            text="STAY OUT 404"
            default_velocity={5}
            className="cursor-none font-display p-2 text-center text-4xl font-bold tracking-[-0.02em] text-black drop-shadow-sm dark:text-white md:text-7xl md:leading-[5rem]"
          />
        </motion.div>
        <Particles
          className="absolute inset-0"
          quantity={300}
          ease={80}
          color={color}
          refresh
        />
      </div>
    </>
  );
}
