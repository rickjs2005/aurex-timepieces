import dynamic from "next/dynamic";
import SmoothScroll from "@/components/smooth-scroll";
import SceneTracker from "@/components/scene-tracker";
import Cursor from "@/components/cursor";
import Loader from "@/components/loader";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Hero from "@/components/sections/hero";
import Film from "@/components/sections/film";
import Specs from "@/components/sections/specs";
import Configurator from "@/components/sections/configurator";
import Finale from "@/components/sections/finale";

// os bundles 3D são pesados — fora do first paint
const CanvasRoot = dynamic(() => import("@/components/scene/canvas-root"));
const Gallery = dynamic(() => import("@/components/sections/gallery"));

export default function Home() {
  return (
    <>
      <Loader />
      <SmoothScroll />
      <SceneTracker />
      <Cursor />
      <Nav />

      <CanvasRoot />

      <main className="relative z-10">
        <Hero />
        <Film />
        <Specs />
        <Configurator />
        <Gallery />
        <Finale />
      </main>

      <Footer />
    </>
  );
}
