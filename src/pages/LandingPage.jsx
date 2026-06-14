import { Link } from 'react-router-dom';
import { ChefHat, TrendingUp, Smartphone, ArrowRight, Star, Users, UtensilsCrossed } from 'lucide-react';

const logoSrc = `${import.meta.env.BASE_URL}logo.png`;
const logoTextSrc = `${import.meta.env.BASE_URL}logo-text.png`;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent font-sans">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoSrc} alt="RestoDash Logo" className="h-12 w-12 object-contain drop-shadow-md" />
          <img src={logoTextSrc} alt="RestoDash" className="h-7 object-contain drop-shadow-sm" />
        </div>
        <div className="hidden md:flex items-center gap-8 font-bold text-slate-700">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a>
          <a href="#testimonials" className="hover:text-indigo-600 transition-colors">Testimonials</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="font-bold text-slate-700 hover:text-indigo-600 transition-colors">Sign In</Link>
          <Link to="/login" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-32 px-6 max-w-7xl mx-auto text-center relative">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-md">
          The operating system for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">modern restaurants</span>
        </h1>
        <p className="mt-8 text-xl md:text-2xl text-slate-800 max-w-3xl mx-auto leading-relaxed font-bold drop-shadow-md">
          Digitize your entire restaurant workflow. From the kitchen display to the waiter's tablet, manage everything seamlessly.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/login" className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-1 flex items-center justify-center gap-2">
            Start Free Trial <ArrowRight className="w-6 h-6" />
          </Link>
          <Link to="/login" className="w-full sm:w-auto px-10 py-4 bg-white/90 backdrop-blur-md text-slate-900 border-2 border-white/50 rounded-2xl font-bold text-lg hover:bg-white transition-all shadow-lg hover:-translate-y-1">
            View Live Demo
          </Link>
        </div>

        {/* Mock UI Preview */}
        <div className="mt-24 relative rounded-[2rem] border border-white/60 bg-white/40 p-4 shadow-2xl mx-auto max-w-5xl overflow-hidden aspect-video backdrop-blur-md group cursor-pointer hover:shadow-indigo-500/20 transition-all">
          <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="Restaurant interior" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-[1px] group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-6 bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl flex flex-col items-center justify-center p-8">
            <img src={logoSrc} alt="RestoDash Logo" className="w-24 h-24 object-contain drop-shadow-md mb-6" />
            <img src={logoTextSrc} alt="RestoDash" className="h-10 object-contain drop-shadow-sm mb-4" />
            <p className="text-slate-600 font-bold text-xl">Interactive Dashboard Preview</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-indigo-600/90 backdrop-blur-xl shadow-2xl border-y border-indigo-500/40 text-white relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-indigo-500/40">
          <div>
            <p className="text-4xl font-black mb-1">500+</p>
            <p className="text-indigo-200 font-bold tracking-wide">Restaurants</p>
          </div>
          <div>
            <p className="text-4xl font-black mb-1">1M+</p>
            <p className="text-indigo-200 font-bold tracking-wide">Orders Processed</p>
          </div>
          <div>
            <p className="text-4xl font-black mb-1">99.9%</p>
            <p className="text-indigo-200 font-bold tracking-wide">Uptime</p>
          </div>
          <div>
            <p className="text-4xl font-black mb-1">24/7</p>
            <p className="text-indigo-200 font-bold tracking-wide">Support</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 drop-shadow-md">Everything you need to run your business</h2>
            <p className="mt-6 text-xl text-slate-800 drop-shadow-md font-bold">Built specifically for high-volume restaurants that need reliable, fast, and easy-to-use software.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl border border-white/60 shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/30">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Waiter App</h3>
              <p className="text-slate-600 leading-relaxed text-lg font-bold">Take orders right at the table. Instantly send tickets to the kitchen, split bills, and process payments without making a trip to the POS.</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl border border-white/60 shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-amber-500/30">
                <ChefHat className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Kitchen Display</h3>
              <p className="text-slate-600 leading-relaxed text-lg font-bold">Streamline your back of house with digital tickets, intelligent routing, prep timers, and real-time syncing so dishes never get left behind.</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl border border-white/60 shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/30">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Analytics Dashboard</h3>
              <p className="text-slate-600 leading-relaxed text-lg font-bold">Make data-driven decisions with real-time reporting on peak sales, staff performance, table turnover rates, and dynamic inventory.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-900/90 backdrop-blur-2xl text-white shadow-2xl relative z-20 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black flex flex-col items-center gap-6">
              How
              <div className="flex items-center">
                <img src={logoSrc} alt="" className="w-13 h-10 brightness-0 invert drop-shadow-md" />
                <img src={logoTextSrc} alt="RestoDash" className="h-7 ml-2 brightness-0 invert drop-shadow-sm" />
              </div>
              Works
            </h2>
            <p className="mt-8 text-xl text-slate-300 font-bold">A seamless flow from the moment your customer steps in until they pay the bill.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center relative">
              <div className="w-20 h-20 mx-auto bg-slate-800 rounded-full border-2 border-indigo-500 flex items-center justify-center mb-6 z-10 relative">
                <Users className="w-10 h-10 text-indigo-400" />
              </div>
              <div className="hidden md:block absolute top-10 left-[60%] w-full h-[2px] bg-slate-800"></div>
              <h3 className="text-xl font-bold mb-3">1. Guest Seated</h3>
              <p className="text-slate-400 font-medium">Host assigns a table in the dashboard, updating the live floor plan.</p>
            </div>
            <div className="text-center relative">
              <div className="w-20 h-20 mx-auto bg-slate-800 rounded-full border-2 border-amber-500 flex items-center justify-center mb-6 z-10 relative">
                <Smartphone className="w-10 h-10 text-amber-400" />
              </div>
              <div className="hidden md:block absolute top-10 left-[60%] w-full h-[2px] bg-slate-800"></div>
              <h3 className="text-xl font-bold mb-3">2. Order Taken</h3>
              <p className="text-slate-400 font-medium">Waiter takes the order on a tablet, instantly firing tickets.</p>
            </div>
            <div className="text-center relative">
              <div className="w-20 h-20 mx-auto bg-slate-800 rounded-full border-2 border-rose-500 flex items-center justify-center mb-6 z-10 relative">
                <ChefHat className="w-10 h-10 text-rose-400" />
              </div>
              <div className="hidden md:block absolute top-10 left-[60%] w-full h-[2px] bg-slate-800"></div>
              <h3 className="text-xl font-bold mb-3">3. Food Prepped</h3>
              <p className="text-slate-400 font-medium">Kitchen receives the order on the KDS and starts cooking.</p>
            </div>
            <div className="text-center relative">
              <div className="w-20 h-20 mx-auto bg-slate-800 rounded-full border-2 border-emerald-500 flex items-center justify-center mb-6 z-10 relative">
                <UtensilsCrossed className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">4. Customer Served</h3>
              <p className="text-slate-400 font-medium">Waiter is notified when food is ready. Bill is paid effortlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/20 px-6 bg-slate-900/95 backdrop-blur-2xl text-white shadow-inner relative z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt="RestoDash Logo" className="w-10 h-10 object-contain brightness-0 invert" />
            <img src={logoTextSrc} alt="RestoDash" className="h-6 object-contain brightness-0 invert" />
          </div>
          <p className="text-slate-400 font-bold text-sm tracking-wide">© 2026 RestoDash Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
