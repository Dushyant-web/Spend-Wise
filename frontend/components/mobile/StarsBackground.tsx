"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  z: number;
  r: number;
  twinkle: number;
};

export default function StarsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let stars: Star[] = [];
    let shooters: { x: number; y: number; vx: number; vy: number; life: number }[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.floor((window.innerWidth * window.innerHeight) / 6000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        z: Math.random(),
        r: Math.random() * 1.4 + 0.3,
        twinkle: Math.random() * Math.PI * 2,
      }));
    };

    const spawnShooter = () => {
      const fromTop = Math.random() > 0.5;
      const x = Math.random() * window.innerWidth;
      const y = fromTop ? -20 : Math.random() * (window.innerHeight * 0.4);
      shooters.push({
        x,
        y,
        vx: (Math.random() - 0.3) * 6 + 3,
        vy: 4 + Math.random() * 3,
        life: 1,
      });
    };

    let lastShooter = 0;
    const tick = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Stars
      for (const s of stars) {
        s.twinkle += 0.02 + s.z * 0.04;
        const alpha = 0.4 + Math.sin(s.twinkle) * 0.3 * s.z + s.z * 0.3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * (0.6 + s.z * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 230, 255, ${alpha})`;
        ctx.fill();

        if (s.z > 0.85) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180, 160, 255, ${alpha * 0.18})`;
          ctx.fill();
        }
      }

      // Shooting stars
      if (t - lastShooter > 3500 + Math.random() * 4000) {
        spawnShooter();
        lastShooter = t;
      }
      shooters = shooters.filter((sh) => {
        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.life -= 0.012;
        if (sh.life <= 0) return false;
        const tailX = sh.x - sh.vx * 12;
        const tailY = sh.y - sh.vy * 12;
        const grad = ctx.createLinearGradient(tailX, tailY, sh.x, sh.y);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(1, `rgba(255,255,255,${sh.life})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(sh.x, sh.y);
        ctx.stroke();
        return true;
      });

      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
