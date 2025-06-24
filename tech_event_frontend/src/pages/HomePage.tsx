// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { 
  Calendar, 
  Users, 
  Ticket, 
  Zap, 
  Shield, 
  CreditCard,
  Mail,
  QrCode,
  Smartphone,
  Globe,
  ArrowRight,
  Play,
  Star,
  Check,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Clock,
  MapPin,
  TrendingUp,
  Award,
  Eye,
  MousePointer
} from 'lucide-react';

const TechMeetLanding = () => {
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Smart Event Creation",
      description: "AI-powered event planning with automated suggestions and intelligent scheduling"
    },
    {
      icon: QrCode,
      title: "Dynamic QR Ticketing",
      description: "Secure, customizable tickets with QR codes and photo verification"
    },
    {
      icon: CreditCard,
      title: "Seamless Payments",
      description: "Integrated Paystack processing with instant confirmations and receipts"
    },
    {
      icon: Users,
      title: "Attendee Management",
      description: "Real-time check-ins, networking tools, and engagement analytics"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "JWT authentication, OAuth integration, and data protection"
    },
    {
      icon: Mail,
      title: "Smart Notifications",
      description: "Automated email campaigns and personalized attendee communications"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Tech Conference Organizer",
      company: "DevSummit",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
      content: "TechMeet.io transformed how we manage our 5,000+ attendee conferences. The QR ticketing and real-time analytics are game-changers."
    },
    {
      name: "Marcus Johnson",
      role: "Community Manager",
      company: "StartupHub",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      content: "Finally, an all-in-one platform that handles everything from registration to post-event analytics. Our productivity increased by 300%."
    },
    {
      name: "Aisha Patel",
      role: "Event Director",
      company: "TechWomen Network",
      image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&fit=crop&crop=face",
      content: "The mobile-first design and seamless payment integration helped us increase ticket sales by 150% compared to our previous platform."
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for small meetups",
      features: [
        "Up to 50 attendees",
        "Basic QR ticketing",
        "Email notifications",
        "Standard support"
      ]
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      description: "For growing tech communities",
      features: [
        "Up to 500 attendees",
        "Custom ticket designs",
        "Analytics dashboard",
        "Priority support",
        "Payment processing",
        "Custom branding"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large-scale events",
      features: [
        "Unlimited attendees",
        "Advanced analytics",
        "API access",
        "White-label solution",
        "Dedicated support",
        "Custom integrations"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-bounce" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Navigation */}
      <Navigation/>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full text-blue-300 text-sm mb-6">
              <Star className="w-4 h-4 mr-2" />
              Trusted by 10+ Event Organizers
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Create Unforgettable
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}Tech Events
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              The all-in-one platform that eliminates the complexity of event management. 
              From creation to check-in, we've got you covered.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center">
              <span><a href="events/create-event">Start Free Trial</a></span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-lg rounded-xl text-lg font-semibold hover:bg-white/20 transition-all flex items-center">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {[
              { number: "20+", label: "Events Created" },
              { number: "10+", label: "Tickets Sold" },
              { number: "99.9%", label: "Uptime" },
              { number: "24/7", label: "Support" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">{stat.number}</div>
                <div className="text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need in 
              <span className="text-blue-400"> One Platform</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Stop juggling multiple tools. TechMeet.io brings together all the features 
              you need to create, manage, and execute successful tech events.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:bg-white/10 transition-all transform hover:-translate-y-2 hover:scale-105"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Preview */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              See TechMeet.io in <span className="text-purple-400">Action</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Experience the intuitive interface that makes event management effortless
            </p>
          </div>

          {/* Interactive Tabs */}
          <div className="mb-12">
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 rounded-xl p-2 flex">
                {[
                  { id: 'create', label: 'Create Events', icon: Calendar },
                  { id: 'manage', label: 'Manage Tickets', icon: Ticket },
                  { id: 'analytics', label: 'View Analytics', icon: TrendingUp }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-3 rounded-lg transition-all ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  {activeTab === 'create' && <Calendar className="w-16 h-16 text-blue-400" />}
                  {activeTab === 'manage' && <Ticket className="w-16 h-16 text-purple-400" />}
                  {activeTab === 'analytics' && <TrendingUp className="w-16 h-16 text-green-400" />}
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {activeTab === 'create' && "Intuitive Event Creation"}
                  {activeTab === 'manage' && "Smart Ticket Management"}
                  {activeTab === 'analytics' && "Powerful Analytics Dashboard"}
                </h3>
                <p className="text-slate-300 max-w-md mx-auto">
                  {activeTab === 'create' && "Create stunning events in minutes with our AI-powered form builder and smart scheduling suggestions."}
                  {activeTab === 'manage' && "Generate QR codes, customize tickets, and manage attendees with real-time check-in capabilities."}
                  {activeTab === 'analytics' && "Track engagement, measure success, and optimize future events with detailed insights and reports."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 px-6 py-20 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by <span className="text-green-400">Event Organizers</span>
            </h2>
            <p className="text-xl text-slate-300">
              Join thousands of successful organizers who trust TechMeet.io
            </p>
          </div>

          <div className="relative">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <img 
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="flex-1 text-center md:text-left">
                  <p className="text-xl md:text-2xl mb-6 text-slate-200 leading-relaxed">
                    "{testimonials[currentTestimonial].content}"
                  </p>
                  <div>
                    <div className="font-bold text-lg">{testimonials[currentTestimonial].name}</div>
                    <div className="text-slate-400">
                      {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial ? 'bg-blue-400' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, <span className="text-blue-400">Transparent</span> Pricing
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Choose the plan that fits your needs. All plans include our core features 
              with no hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`relative p-8 rounded-2xl border transition-all transform hover:-translate-y-2 ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-blue-500/20 to-purple-600/20 border-blue-400/50 scale-105' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-2">
                    {plan.price}
                    {plan.period && <span className="text-lg text-slate-400">{plan.period}</span>}
                  </div>
                  <p className="text-slate-400">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                    : 'bg-white/10 hover:bg-white/20'
                }`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Events?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of organizers who have revolutionized their event management 
            with TechMeet.io. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-lg rounded-xl text-lg font-semibold hover:bg-white/20 transition-all">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 bg-black/40 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold">TechMeet.io</span>
              </div>
              <p className="text-slate-400 mb-4">
                The future of tech event management is here.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-slate-400">
            <p>&copy; 2025 TechMeet.io. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TechMeetLanding;