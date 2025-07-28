import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react'

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        company: [
            { name: 'About Us', href: '/about' },
            { name: 'Our Services', href: '/services' },
            { name: 'Careers', href: '/careers' },
            { name: 'Blog', href: '/blog' }
        ],
        support: [
            { name: 'Help Center', href: '/help' },
            { name: 'Contact Us', href: '/contact' },
            { name: 'FAQ', href: '/faq' },
            { name: 'Live Chat', href: '/chat' }
        ],
        legal: [
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Terms of Service', href: '/terms' },
            { name: 'Cookie Policy', href: '/cookies' },
            { name: 'GDPR', href: '/gdpr' }
        ]
    };

    const socialLinks = [
        { icon: <Facebook className="w-5 h-5" />, href: '#', name: 'Facebook' },
        { icon: <Twitter className="w-5 h-5" />, href: '#', name: 'Twitter' },
        { icon: <Instagram className="w-5 h-5" />, href: '#', name: 'Instagram' },
        { icon: <Linkedin className="w-5 h-5" />, href: '#', name: 'LinkedIn' }
    ];

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black dark:from-black dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />
            </div>

            <div className="relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center space-x-3 group">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl">
                                        <span className="text-white font-bold text-lg">Q</span>
                                    </div>
                                    <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl opacity-20 blur"></div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">QuickMaker</h3>
                                    <p className="text-gray-400 text-sm">Professional Services Platform</p>
                                </div>
                            </div>
                            
                            <p className="text-gray-300 leading-relaxed max-w-md">
                                Connecting you with trusted service providers for all your needs. 
                                From home repairs to professional consultations, we make it quick and easy.
                            </p>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors duration-300">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">hello@quickmaker.com</span>
                                </div>
                                <div className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors duration-300">
                                    <Phone className="w-4 h-4" />
                                    <span className="text-sm">+1 (555) 123-4567</span>
                                </div>
                                <div className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors duration-300">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm">123 Business Street, City, State</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-white font-semibold text-lg relative">
                                Company
                                <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"></span>
                            </h4>
                            <ul className="space-y-3">
                                {footerLinks.company.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.href}
                                            className="text-gray-400 hover:text-white transition-all duration-300 text-sm flex items-center group"
                                        >
                                            <span className="group-hover:translate-x-1 transition-transform duration-300">
                                                {link.name}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* <div className="space-y-6">
                            <h4 className="text-white font-semibold text-lg relative">
                                Support
                                <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"></span>
                            </h4>
                            <ul className="space-y-3">
                                {footerLinks.support.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.href}
                                            className="text-gray-400 hover:text-white transition-all duration-300 text-sm flex items-center group"
                                        >
                                            <span className="group-hover:translate-x-1 transition-transform duration-300">
                                                {link.name}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-white font-semibold text-lg relative">
                                Legal
                                <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"></span>
                            </h4>
                            <ul className="space-y-3">
                                {footerLinks.legal.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.href}
                                            className="text-gray-400 hover:text-white transition-all duration-300 text-sm flex items-center group"
                                        >
                                            <span className="group-hover:translate-x-1 transition-transform duration-300">
                                                {link.name}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div> */}
                    </div>

                    {/* <div className="mt-12 pt-8 border-t border-gray-700">
                        <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
                            <div className="text-center lg:text-left">
                                <h4 className="text-white font-semibold text-lg mb-2">Stay Updated</h4>
                                <p className="text-gray-400 text-sm">Get the latest updates and offers delivered to your inbox.</p>
                            </div>
                            <div className="flex w-full lg:w-auto max-w-md">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-l-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                />
                                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-r-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div> */}
                </div>

                <div className="border-t border-gray-700 bg-gray-900/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                            <div className="flex items-center space-x-2 text-gray-400 text-sm">
                                <span>&copy; {currentYear} QuickMaker. All rights reserved.</span>
                                <span className="hidden md:inline">|</span>
                                <span className="flex items-center space-x-1">
                                    <span>Made with</span>
                                    <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                                    <span>for better service</span>
                                </span>
                            </div>

                            {/* <div className="flex items-center space-x-4">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                                        aria-label={social.name}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;