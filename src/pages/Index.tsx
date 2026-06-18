
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const services = [
  {
    title: "Pitch Design",
    body: "A recommendation engine that analyzes situational data to optimize pitch selection and maximize effectiveness against specific batters.",
  },
  {
    title: "Biomechanical Analysis",
    body: "Comprehensive motion analysis and mechanical optimization to improve performance while reducing injury risk through data-driven insight.",
  },
  {
    title: "Performance Analytics",
    body: "Real-time tracking and trend analysis that surfaces actionable insight for continuous improvement and strategic planning.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-[#F5F4EE]">
      <Navbar />

      {/* Hero */}
      <section className="max-w-[1000px] mx-auto px-7 pt-24 pb-[72px] text-center">
        <h1 className="font-display text-[44px] md:text-[62px] leading-[1.04] font-medium tracking-[-0.02em] text-[#1A1915] mb-6 text-balance">
          Data-driven development for the{" "}
          <span className="text-[#C26F4F]">modern athlete</span>
        </h1>
        <p className="text-xl leading-[1.6] text-[#57544B] max-w-[660px] mx-auto mb-[38px]">
          Advanced analytics, biomechanical insight, and personalized pitch-design
          strategy — the competitive edge for players and coaches who let the data lead.
        </p>
        <div className="flex gap-3.5 justify-center flex-wrap">
          <Button
            asChild
            className="bg-[#C26F4F] hover:bg-[#A85638] text-white rounded-[9px] px-[26px] py-3.5 text-base font-semibold h-auto"
          >
            <Link to="/login">
              Access analytics platform
              <span className="ml-2 text-[17px] leading-none">&rarr;</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            className="bg-transparent text-[#3A382F] border border-[#D8D2C4] hover:bg-[#EFEDE4] rounded-[9px] px-[26px] py-3.5 text-base font-medium h-auto"
          >
            Learn more
          </Button>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-[1160px] mx-auto px-7 pt-10 pb-20">
        <h2 className="font-display text-[40px] font-medium tracking-[-0.015em] text-center text-[#1A1915] mb-3">
          Elite performance solutions
        </h2>
        <p className="text-center text-[#6E6B61] text-[17px] max-w-[560px] mx-auto mb-14 leading-[1.55]">
          A focused suite of tools that turns raw tracking data into decisions you can use on the mound.
        </p>
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          {services.map((svc) => (
            <div
              key={svc.title}
              className="bg-white border border-[#E7E2D6] rounded-[14px] px-[30px] py-[34px] transition-all hover:border-[#D8CFBD] hover:shadow-[0_6px_22px_rgba(40,38,30,0.06)]"
            >
              <h3 className="text-[21px] font-semibold mb-3 text-[#1A1915] tracking-[-0.01em]">
                {svc.title}
              </h3>
              <p className="text-[#57544B] text-[15px] leading-[1.62]">{svc.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="bg-[#EFEDE4] border-y border-[#E3DDD0]">
        <div className="max-w-[760px] mx-auto px-7 py-20 text-center">
          <h2 className="font-display text-[38px] font-medium tracking-[-0.015em] mb-7 text-[#1A1915]">
            About Push Performance AZ
          </h2>
          <p className="text-[19px] leading-[1.65] text-[#3A382F] mb-[22px]">
            We believe the future of baseball lies in the intelligent application of
            data science and biomechanical research. Our mission is to bridge raw data
            and actionable insight, helping players and coaches make decisions that hold
            up on the field.
          </p>
          <p className="text-base leading-[1.7] text-[#6E6B61]">
            Founded by experts in sports science and data analytics, we pair
            cutting-edge technology with deep baseball knowledge to deliver solutions
            that are both scientifically sound and practical in competitive environments.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-[1160px] mx-auto px-7 pt-16 pb-12">
        <div className="grid gap-10 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <div>
            <h3 className="font-display text-2xl font-medium mb-3.5 text-[#1A1915]">
              Get in touch
            </h3>
            <p className="text-[#3A382F] mb-1 text-[15px]">Ready to elevate your game?</p>
            <p className="text-[#6E6B61] text-[15px]">Contact us for a consultation.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.06em] text-[#97948A] mb-3.5">
              Contact
            </h4>
            <p className="text-[#3A382F] mb-1.5 text-[15px]">Tempe, AZ</p>
            <p className="text-[#3A382F] mb-1.5 text-[15px]">pushperformanceaz9@gmail.com</p>
            <p className="text-[#3A382F] text-[15px]">(480) 645-5650</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.06em] text-[#97948A] mb-3.5">
              Follow
            </h4>
            <div className="flex gap-2.5">
              <a
                href="https://x.com/PUSHbsbl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-[38px] h-[38px] border border-[#D8D2C4] rounded-lg text-[#3A382F] text-sm font-semibold no-underline"
              >
                X
              </a>
              <a
                href="https://www.instagram.com/pushperformanceaz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-[38px] px-3.5 border border-[#D8D2C4] rounded-lg text-[#3A382F] text-sm font-semibold no-underline"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-[#E3DDD0] mt-11 pt-[26px] text-center">
          <p className="text-[#97948A] text-sm">
            © 2024 Push Performance Analytics. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
