"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { world, SceneName } from "@/lib/world";

void gsap;

/**
 * Um ScrollTrigger por [data-scene] escreve (cena, t local) no world.
 * end "bottom top" — handoff perfeito entre seções, sem zona morta.
 * Espelha a cena ativa em <html data-scene> pro CSS reagir.
 */
export default function SceneTracker() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));

    const triggers = sections.map((el) => {
      const name = el.dataset.scene as SceneName;
      return ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          world.scene = name;
          world.t = self.progress;
          if (document.documentElement.dataset.scene !== name)
            document.documentElement.dataset.scene = name;
        },
      });
    });

    if (sections.length) {
      document.documentElement.dataset.scene = sections[0].dataset.scene!;
    }

    return () => {
      triggers.forEach((t) => t.kill());
      delete document.documentElement.dataset.scene;
    };
  }, []);

  return null;
}
