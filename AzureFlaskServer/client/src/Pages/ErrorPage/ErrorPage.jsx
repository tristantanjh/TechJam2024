import Particles from "@/Components/magicui/particles";
import "./ErrorPage.css";
import { useEffect, useState } from "react";
import { motion, useAnimate } from "framer-motion";
import { VelocityScroll } from "@/Components/magicui/scroll-based-velocity";
import { Button } from "@/Components/ui/button";
import { Link } from "react-router-dom";

export default function ErrorPage() {
  const [color, setColor] = useState("#00000");
  const [scope, animate] = useAnimate();

  function vwToPx(vw) {
    const viewportWidth = window.innerWidth;
    return (vw / 100) * viewportWidth;
  }

  const divHeight = vwToPx(50);

  const myAnimation = async () => {
    await animate(
      scope.current,
      { rotate: 0, bottom: `-${divHeight}px` },
      { duration: 1, ease: "easeInOut", delay: 0.3 }
    );
    animate(scope.current, { opacity: 0 });
  };

  useEffect(() => {
    myAnimation();
  }, []);

  return (
    <>
      <div className="relative flex h-screen w-full items-center justify-center overflow-hidden rounded-lg border bg-background p-4 md:shadow-xl">
        <motion.div
          initial={{ rotate: 90 }}
          animate={{ rotate: 0, top: "-50vw" }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
          style={{ originX: 0.66 }}
          className="w-[200vw] h-[50vw] absolute bg-slate-900"
        ></motion.div>
        <motion.div
          initial={{ rotate: 90 }}
          animate={{ rotate: 0, scale: 2.5, top: 5 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
          style={{ originX: 0.55 }}
          className="w-screen absolute cursor-none"
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
        <motion.div
          initial={{ rotate: 90, originX: 0.34 }}
          ref={scope}
          style={{ originX: 0.34 }}
          className="w-[200vw] h-[50vw] absolute bg-slate-900"
        ></motion.div>
        <Particles
          className="absolute inset-0"
          quantity={1000}
          ease={80}
          color={color}
          refresh
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.6 }}
          className="absolute z-[999] h-screen w-screen flex justify-center items-center"
        >
          <Button
            className="inline-flex h-12 animate-shimmer items-center justify-center rounded-full border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 hover:text-slate-500"
            asChild
          >
            <Link to="/app">Go Back</Link>
          </Button>
        </motion.div>
      </div>
    </>
  );
}
