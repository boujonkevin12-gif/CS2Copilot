"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number; vx: number; vy: number; size: number; alpha: number; life: number; maxLife: number; hue: number; brightness: number;
}

export function ParticleBackground({ count = 80, connect = false }: { count?: number; connect?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => { mouse.current.x = e.clientX; mouse.current.y = e.clientY; });

    const particles: Particle[] = Array.from({ length: count }, () => createParticle(canvas.width, canvas.height));
    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = p.life < 20 ? p.life / 20 : p.life > p.maxLife - 20 ? (p.maxLife - p.life) / 20 : 1;

        if (p.life >= p.maxLife || p.x < -50 || p.x > canvas.width + 50 || p.y < -50 || p.y > canvas.height + 50) {
          particles[i] = createParticle(canvas.width, canvas.height);
          continue;
        }

        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          p.vx += dx / dist * 0.02;
          p.vy += dy / dist * 0.02;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, ${p.brightness}%, ${p.alpha * 0.8})`;
        ctx.fill();

        if (p.size > 1.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 60%, ${p.brightness + 20}%, ${p.alpha * 0.3})`;
          ctx.fill();
        }
      }

      if (connect) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `hsla(270, 60%, 70%, ${(1 - dist / 120) * 0.12})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, [count, connect]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

function createParticle(w: number, h: number): Particle {
  const hues = [270, 260, 240, 280, 300, 220];
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3 - 0.1,
    size: Math.random() * 3 + 1,
    alpha: 0,
    life: 0,
    maxLife: 300 + Math.random() * 400,
    hue: hues[Math.floor(Math.random() * hues.length)],
    brightness: 60 + Math.random() * 30,
  };
}
