import Image from "next/image";

export function HeroIllustration({ alt }: { alt: string }) {
  return (
    <div className="hero-art">
      <Image
        src="/images/fine-water-hero.webp"
        alt={alt}
        fill
        priority
        sizes="(max-width: 900px) 100vw, 48vw"
        quality={78}
      />
    </div>
  );
}
