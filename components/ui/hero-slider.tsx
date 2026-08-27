"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Variants, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SlideProps {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;
  stats?: {
    value: string;
    label: string;
  }[];
}

interface HeroSliderProps {
  slides: SlideProps[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  showStats?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
  onSlideChange?: (index: number) => void;
}

export function HeroSlider({
  slides,
  autoPlay = true,
  interval = 5000,
  className,
  showStats = true,
  showControls = true,
  showIndicators = true,
  onSlideChange,
}: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const slideCount = slides.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);

  // Auto-play logic
  useEffect(() => {
    if (!autoPlay || isHovering || isPaused) return;

    const timer = setTimeout(() => {
      setDirection(1);
      setCurrentSlide((prevIndex) => (prevIndex + 1) % slideCount);
      onSlideChange?.((currentSlide + 1) % slideCount);
    }, interval);

    return () => clearTimeout(timer);
  }, [autoPlay, currentSlide, interval, slideCount, isHovering, isPaused, onSlideChange]);

  // Navigation handlers
  const handlePrevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prevIndex) => (prevIndex - 1 + slideCount) % slideCount);
    onSlideChange?.((currentSlide - 1 + slideCount) % slideCount);
  }, [slideCount, onSlideChange, currentSlide]);

  const handleNextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prevIndex) => (prevIndex + 1) % slideCount);
    onSlideChange?.((currentSlide + 1) % slideCount);
  }, [slideCount, onSlideChange, currentSlide]);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      handleNextSlide();
    }
    if (touchStart - touchEnd < -75) {
      handlePrevSlide();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevSlide();
      } else if (e.key === "ArrowRight") {
        handleNextSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevSlide, handleNextSlide]);

  // Drag handlers
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      handlePrevSlide();
    } else if (info.offset.x < -threshold) {
      handleNextSlide();
    }
    dragX.set(0);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95,
    }),
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.215, 0.61, 0.355, 1],
      },
    }),
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.2,
        duration: 0.4,
        type: "spring",
        stiffness: 200,
      },
    },
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[600px] md:h-[750px] lg:h-[850px] overflow-hidden",
        "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image with Parallax Effect */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
          }}
          className="absolute inset-0 w-full h-full"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ x: dragX }}
        >
          {/* Image Container */}
          <div className="relative w-full h-full">
            <Image
              src={currentSlideData.image}
              alt={currentSlideData.title}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
              quality={90}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20" />

            {/* Animated Gradient Orbs */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-mint-teal/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-startup-amber/20 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="absolute inset-0 flex items-center z-10">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-4xl"
          >
            {/* Badges */}
            <motion.div
              variants={badgeVariants}
              className="flex flex-wrap items-center gap-3 mb-8"
            >
              <div className="bg-brand-mint-teal/20 backdrop-blur-md border border-brand-mint-teal/30 px-4 py-1.5 rounded-full flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-brand-mint-teal animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-mint-teal">
                  National Digital Infrastructure
                </span>
              </div>
              <div className="bg-slate-800/40 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                <div className="relative h-4 w-4 overflow-hidden rounded-sm">
                  <Image
                    src="/Mint_Logo.png"
                    alt="MinT Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">
                  MinT Ethiopia
                </span>
              </div>
            </motion.div>

            {/* Subtitle with Animated Line */}
            <motion.div
              custom={0}
              variants={textVariants}
              className="flex items-center gap-3 mb-6"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "3rem" }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="h-0.5 bg-brand-startup-amber"
              />
              <p className="text-sm md:text-base font-black uppercase tracking-[0.3em] text-brand-startup-amber">
                {currentSlideData.subtitle}
              </p>
            </motion.div>

            {/* Title with Split Text Animation */}
            <motion.h2
              custom={1}
              variants={textVariants}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.1] tracking-tighter"
            >
              {currentSlideData.title.split(' ').map((word, i, arr) => (
                <React.Fragment key={i}>
                  <motion.span
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (i * 0.05), duration: 0.6 }}
                    className={cn(
                      "inline-block",
                      i % 2 === 1 && "text-brand-mint-teal italic font-light"
                    )}
                  >
                    {word}
                  </motion.span>
                  {i < arr.length - 1 && " "}
                </React.Fragment>
              ))}
            </motion.h2>

            {/* Description */}
            <motion.p
              custom={2}
              variants={textVariants}
              className="text-base sm:text-lg md:text-xl text-white/80 mb-8 max-w-2xl font-medium leading-relaxed"
            >
              {currentSlideData.description}
            </motion.p>

            {/* Stats Cards */}
            {showStats && currentSlideData.stats && (
              <motion.div
                custom={2.5}
                variants={textVariants}
                className="flex flex-wrap gap-6 mb-8"
              >
                {currentSlideData.stats.map((stat, idx) => (
                  <div key={idx} className="group">
                    <div className="text-2xl md:text-3xl font-black text-brand-mint-teal group-hover:scale-110 transition-transform duration-300">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-white/60 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* CTA Buttons */}
            <motion.div
              custom={3}
              variants={textVariants}
              className="flex flex-wrap gap-4 md:gap-6"
            >
              <a
                href={currentSlideData.ctaLink}
                className="group relative inline-flex h-12 md:h-14 items-center justify-center rounded-xl bg-gradient-to-r from-brand-mint-teal to-brand-mint-teal/80 px-6 md:px-10 text-base md:text-lg font-black text-white shadow-xl shadow-brand-mint-teal/20 transition-all hover:scale-105 hover:shadow-2xl active:scale-95 overflow-hidden"
              >
                <span className="relative z-10">{currentSlideData.ctaText}</span>
                <ChevronRight className="relative z-10 ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              </a>

              {currentSlideData.ctaSecondaryText && (
                <a
                  href={currentSlideData.ctaSecondaryLink}
                  className="inline-flex h-12 md:h-14 items-center justify-center rounded-xl border-2 border-white/20 bg-white/5 backdrop-blur-md px-6 md:px-10 text-base md:text-lg font-black text-white transition-all hover:bg-white/10 hover:border-white/30 hover:scale-105 active:scale-95"
                >
                  {currentSlideData.ctaSecondaryText}
                </a>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && (
        <>
          <button
            onClick={handlePrevSlide}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 z-20 hover:scale-110 active:scale-95 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={handleNextSlide}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 z-20 hover:scale-110 active:scale-95 group"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Auto-play Toggle */}
          {autoPlay && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="absolute bottom-6 right-6 md:bottom-8 md:right-8 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 z-20"
              aria-label={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? (
                <Play className="h-4 w-4 md:h-5 md:w-5" />
              ) : (
                <Pause className="h-4 w-4 md:h-5 md:w-5" />
              )}
            </button>
          )}
        </>
      )}

      {/* Progress Bar */}
      {autoPlay && !isPaused && (
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: interval / 1000, ease: "linear" }}
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-brand-mint-teal to-brand-startup-amber z-30"
        />
      )}

      {/* Dots Indicator */}
      {showIndicators && (
        <div className="absolute bottom-6 md:bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentSlide ? 1 : -1);
                setCurrentSlide(index);
                onSlideChange?.(index);
              }}
              className={cn(
                "transition-all duration-300 rounded-full",
                currentSlide === index
                  ? "w-6 md:w-8 h-2 bg-white"
                  : "w-2 h-2 bg-white/40 hover:bg-white/60"
              )}
              aria-label={`Go to slide ${index + 1}`}
            >
              <span className="sr-only">Slide {index + 1}</span>
            </button>
          ))}
        </div>
      )}

      {/* Slide Counter */}
      <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 text-xs md:text-sm text-white/60 font-mono z-20">
        {String(currentSlide + 1).padStart(2, '0')} / {String(slideCount).padStart(2, '0')}
      </div>
    </div>
  );
}