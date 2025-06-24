import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/HomePage.tsx
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Calendar, Users, Ticket, Zap, Shield, CreditCard, Mail, QrCode, ArrowRight, Play, Star, Check, TrendingUp } from 'lucide-react';
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
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden", children: [_jsxs("div", { className: "fixed inset-0 opacity-30", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse" }), _jsx("div", { className: "absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-bounce" }), _jsx("div", { className: "absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-bounce", style: { animationDelay: '2s' } })] }), _jsx(Navigation, {}), _jsx("section", { className: "relative z-10 px-6 py-20 text-center", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full text-blue-300 text-sm mb-6", children: [_jsx(Star, { className: "w-4 h-4 mr-2" }), "Trusted by 10+ Event Organizers"] }), _jsxs("h1", { className: "text-5xl md:text-7xl font-bold mb-6 leading-tight", children: ["Create Unforgettable", _jsxs("span", { className: "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent", children: [" ", "Tech Events"] })] }), _jsx("p", { className: "text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed", children: "The all-in-one platform that eliminates the complexity of event management. From creation to check-in, we've got you covered." })] }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-4 mb-12", children: [_jsxs("button", { className: "px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center", children: [_jsx("span", { children: _jsx("a", { href: "events/create-event", children: "Start Free Trial" }) }), _jsx(ArrowRight, { className: "w-5 h-5 ml-2" })] }), _jsxs("button", { className: "px-8 py-4 bg-white/10 backdrop-blur-lg rounded-xl text-lg font-semibold hover:bg-white/20 transition-all flex items-center", children: [_jsx(Play, { className: "w-5 h-5 mr-2" }), "Watch Demo"] })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-8 mt-16", children: [
                                { number: "20+", label: "Events Created" },
                                { number: "10+", label: "Tickets Sold" },
                                { number: "99.9%", label: "Uptime" },
                                { number: "24/7", label: "Support" }
                            ].map((stat, index) => (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl md:text-4xl font-bold text-blue-400 mb-2", children: stat.number }), _jsx("div", { className: "text-slate-400", children: stat.label })] }, index))) })] }) }), _jsx("section", { id: "features", className: "relative z-10 px-6 py-20 bg-black/20", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("h2", { className: "text-4xl md:text-5xl font-bold mb-6", children: ["Everything You Need in", _jsx("span", { className: "text-blue-400", children: " One Platform" })] }), _jsx("p", { className: "text-xl text-slate-300 max-w-3xl mx-auto", children: "Stop juggling multiple tools. TechMeet.io brings together all the features you need to create, manage, and execute successful tech events." })] }), _jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-8", children: features.map((feature, index) => (_jsxs("div", { className: "p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:bg-white/10 transition-all transform hover:-translate-y-2 hover:scale-105", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6", children: _jsx(feature.icon, { className: "w-8 h-8" }) }), _jsx("h3", { className: "text-2xl font-bold mb-4", children: feature.title }), _jsx("p", { className: "text-slate-300 leading-relaxed", children: feature.description })] }, index))) })] }) }), _jsx("section", { className: "relative z-10 px-6 py-20", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("h2", { className: "text-4xl md:text-5xl font-bold mb-6", children: ["See TechMeet.io in ", _jsx("span", { className: "text-purple-400", children: "Action" })] }), _jsx("p", { className: "text-xl text-slate-300 max-w-3xl mx-auto", children: "Experience the intuitive interface that makes event management effortless" })] }), _jsxs("div", { className: "mb-12", children: [_jsx("div", { className: "flex justify-center mb-8", children: _jsx("div", { className: "bg-white/10 rounded-xl p-2 flex", children: [
                                            { id: 'create', label: 'Create Events', icon: Calendar },
                                            { id: 'manage', label: 'Manage Tickets', icon: Ticket },
                                            { id: 'analytics', label: 'View Analytics', icon: TrendingUp }
                                        ].map((tab) => (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center px-6 py-3 rounded-lg transition-all ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                                : 'text-slate-300 hover:text-white'}`, children: [_jsx(tab.icon, { className: "w-5 h-5 mr-2" }), tab.label] }, tab.id))) }) }), _jsx("div", { className: "bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 min-h-[400px] flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6", children: [activeTab === 'create' && _jsx(Calendar, { className: "w-16 h-16 text-blue-400" }), activeTab === 'manage' && _jsx(Ticket, { className: "w-16 h-16 text-purple-400" }), activeTab === 'analytics' && _jsx(TrendingUp, { className: "w-16 h-16 text-green-400" })] }), _jsxs("h3", { className: "text-2xl font-bold mb-4", children: [activeTab === 'create' && "Intuitive Event Creation", activeTab === 'manage' && "Smart Ticket Management", activeTab === 'analytics' && "Powerful Analytics Dashboard"] }), _jsxs("p", { className: "text-slate-300 max-w-md mx-auto", children: [activeTab === 'create' && "Create stunning events in minutes with our AI-powered form builder and smart scheduling suggestions.", activeTab === 'manage' && "Generate QR codes, customize tickets, and manage attendees with real-time check-in capabilities.", activeTab === 'analytics' && "Track engagement, measure success, and optimize future events with detailed insights and reports."] })] }) })] })] }) }), _jsx("section", { id: "testimonials", className: "relative z-10 px-6 py-20 bg-black/20", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("h2", { className: "text-4xl md:text-5xl font-bold mb-6", children: ["Loved by ", _jsx("span", { className: "text-green-400", children: "Event Organizers" })] }), _jsx("p", { className: "text-xl text-slate-300", children: "Join thousands of successful organizers who trust TechMeet.io" })] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 md:p-12", children: _jsxs("div", { className: "flex flex-col md:flex-row items-center gap-8", children: [_jsx("img", { src: testimonials[currentTestimonial].image, alt: testimonials[currentTestimonial].name, className: "w-20 h-20 rounded-full object-cover" }), _jsxs("div", { className: "flex-1 text-center md:text-left", children: [_jsxs("p", { className: "text-xl md:text-2xl mb-6 text-slate-200 leading-relaxed", children: ["\"", testimonials[currentTestimonial].content, "\""] }), _jsxs("div", { children: [_jsx("div", { className: "font-bold text-lg", children: testimonials[currentTestimonial].name }), _jsxs("div", { className: "text-slate-400", children: [testimonials[currentTestimonial].role, " at ", testimonials[currentTestimonial].company] })] })] })] }) }), _jsx("div", { className: "flex justify-center mt-8 space-x-2", children: testimonials.map((_, index) => (_jsx("button", { onClick: () => setCurrentTestimonial(index), className: `w-3 h-3 rounded-full transition-all ${index === currentTestimonial ? 'bg-blue-400' : 'bg-white/30'}` }, index))) })] })] }) }), _jsx("section", { id: "pricing", className: "relative z-10 px-6 py-20", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("h2", { className: "text-4xl md:text-5xl font-bold mb-6", children: ["Simple, ", _jsx("span", { className: "text-blue-400", children: "Transparent" }), " Pricing"] }), _jsx("p", { className: "text-xl text-slate-300 max-w-3xl mx-auto", children: "Choose the plan that fits your needs. All plans include our core features with no hidden fees." })] }), _jsx("div", { className: "grid md:grid-cols-3 gap-8", children: pricingPlans.map((plan, index) => (_jsxs("div", { className: `relative p-8 rounded-2xl border transition-all transform hover:-translate-y-2 ${plan.popular
                                    ? 'bg-gradient-to-b from-blue-500/20 to-purple-600/20 border-blue-400/50 scale-105'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'}`, children: [plan.popular && (_jsx("div", { className: "absolute -top-4 left-1/2 transform -translate-x-1/2", children: _jsx("div", { className: "bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold", children: "Most Popular" }) })), _jsxs("div", { className: "text-center mb-8", children: [_jsx("h3", { className: "text-2xl font-bold mb-2", children: plan.name }), _jsxs("div", { className: "text-4xl font-bold mb-2", children: [plan.price, plan.period && _jsx("span", { className: "text-lg text-slate-400", children: plan.period })] }), _jsx("p", { className: "text-slate-400", children: plan.description })] }), _jsx("ul", { className: "space-y-4 mb-8", children: plan.features.map((feature, featureIndex) => (_jsxs("li", { className: "flex items-center", children: [_jsx(Check, { className: "w-5 h-5 text-green-400 mr-3 flex-shrink-0" }), _jsx("span", { className: "text-slate-300", children: feature })] }, featureIndex))) }), _jsx("button", { className: `w-full py-3 rounded-lg font-semibold transition-all ${plan.popular
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                                            : 'bg-white/10 hover:bg-white/20'}`, children: "Get Started" })] }, index))) })] }) }), _jsx("section", { className: "relative z-10 px-6 py-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20", children: _jsxs("div", { className: "max-w-4xl mx-auto text-center", children: [_jsx("h2", { className: "text-4xl md:text-5xl font-bold mb-6", children: "Ready to Transform Your Events?" }), _jsx("p", { className: "text-xl text-slate-300 mb-8 max-w-2xl mx-auto", children: "Join thousands of organizers who have revolutionized their event management with TechMeet.io. Start your free trial today." }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-4", children: [_jsxs("button", { className: "px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center", children: ["Start Free Trial", _jsx(ArrowRight, { className: "w-5 h-5 ml-2" })] }), _jsx("button", { className: "px-8 py-4 bg-white/10 backdrop-blur-lg rounded-xl text-lg font-semibold hover:bg-white/20 transition-all", children: "Schedule Demo" })] })] }) }), _jsx("footer", { className: "relative z-10 px-6 py-12 bg-black/40 border-t border-white/10", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "grid md:grid-cols-4 gap-8 mb-8", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx("div", { className: "w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center", children: _jsx(Zap, { className: "w-5 h-5" }) }), _jsx("span", { className: "text-xl font-bold", children: "TechMeet.io" })] }), _jsx("p", { className: "text-slate-400 mb-4", children: "The future of tech event management is here." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-4", children: "Product" }), _jsxs("ul", { className: "space-y-2 text-slate-400", children: [_jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Features" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Pricing" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "API" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Integrations" }) })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-4", children: "Company" }), _jsxs("ul", { className: "space-y-2 text-slate-400", children: [_jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "About" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Blog" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Careers" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Contact" }) })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold mb-4", children: "Support" }), _jsxs("ul", { className: "space-y-2 text-slate-400", children: [_jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Help Center" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Documentation" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Community" }) }), _jsx("li", { children: _jsx("a", { href: "#", className: "hover:text-white transition-colors", children: "Status" }) })] })] })] }), _jsx("div", { className: "border-t border-white/10 pt-8 text-center text-slate-400", children: _jsx("p", { children: "\u00A9 2025 TechMeet.io. All rights reserved." }) })] }) })] }));
};
export default TechMeetLanding;
