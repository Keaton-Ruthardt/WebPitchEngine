
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Target, TrendingUp, Users, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Data-Driven Development for the{" "}
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Modern Athlete
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing baseball performance through advanced analytics, biomechanical insights, 
            and personalized pitch design strategies that give players the competitive edge they need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
              <Link to="/login">
                Access Analytics Platform
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-slate-400 text-slate-300 hover:bg-slate-800 px-8 py-4 text-lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Elite Performance Solutions
          </h2>
          <p className="text-slate-300 text-center mb-16 text-lg max-w-2xl mx-auto">
            Our comprehensive suite of analytics tools empowers players and coaches with actionable insights
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="bg-blue-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600/30 transition-colors">
                  <Target className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Pitch Design</h3>
                <p className="text-slate-300 leading-relaxed">
                  Advanced pitch recommendation engine that analyzes situational data to optimize pitch selection and maximize effectiveness against specific batters.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="bg-emerald-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-600/30 transition-colors">
                  <BarChart3 className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Biomechanical Analysis</h3>
                <p className="text-slate-300 leading-relaxed">
                  Comprehensive motion analysis and mechanical optimization to improve performance while reducing injury risk through data-driven insights.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="bg-purple-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600/30 transition-colors">
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">Performance Analytics</h3>
                <p className="text-slate-300 leading-relaxed">
                  Real-time performance tracking and trend analysis that provides actionable insights for continuous improvement and strategic planning.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-emerald-600 w-20 h-20 rounded-full flex items-center justify-center">
              <Users className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-8">About Push Performance AZ</h2>
          <p className="text-xl text-slate-300 leading-relaxed mb-8">
            At Push Performance Analytics, we believe that the future of baseball lies in the intelligent 
            application of data science and biomechanical research. Our mission is to bridge the gap between 
            raw data and actionable performance insights, empowering players and coaches to make informed 
            decisions that drive results on the field.
          </p>
          <p className="text-lg text-slate-400 leading-relaxed">
            Founded by experts in sports science and data analytics, we combine cutting-edge technology 
            with deep baseball knowledge to deliver solutions that are both scientifically sound and 
            practically applicable in real-world competitive environments.
          </p>
        </div>
      </section>

      {/* Contact Footer */}
      <footer className="py-16 px-4 border-t border-slate-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Get in Touch</h3>
              <p className="text-slate-300 mb-2">Ready to elevate your game?</p>
              <p className="text-slate-400">Contact us for a consultation</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contact Info</h4>
              <p className="text-slate-300 mb-2">Phoenix, Arizona</p>
              <p className="text-slate-300 mb-2">info@pushperformanceaz.com</p>
              <p className="text-slate-300">(555) 123-4567</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
              <div className="flex space-x-4 justify-center md:justify-start">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  Twitter
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  LinkedIn
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  Instagram
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-12 pt-8 text-center">
            <p className="text-slate-400">
              © 2024 Push Performance Analytics. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
