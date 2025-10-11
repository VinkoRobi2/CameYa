import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowTo from "./components/HowTo";
import Footer from "./components/Footer";
import PageTransition from "../ui/PageTransition";
import Universities from "./components/Universities";

export default function LandingPage() {
  return (
    <PageTransition>
      <div className="bg-background-light text-foreground-light dark:bg-background-dark dark:text-foreground-dark font-body flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Hero />
          <Features />
          <HowTo />
          <Universities  />
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
