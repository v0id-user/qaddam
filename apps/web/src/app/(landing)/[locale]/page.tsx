"use client"

import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Pricing from "@/components/landing/Pricing";
import Screenshot from "@/components/landing/Screenshot";

export default function Landing() {
    return (
      <div className="min-h-screen bg-white">
        <Hero />
        <Features />
        <Screenshot />
        <Pricing />
        <Footer />
      </div>
    );
  };