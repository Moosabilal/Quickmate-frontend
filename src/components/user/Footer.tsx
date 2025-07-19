import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
            <footer className="bg-gray-800 dark:bg-gray-900 text-gray-300 dark:text-gray-400 py-8">
                <div className="container mx-auto px-4 text-center text-sm">
                    <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-8 mb-4">
                        <Link to="/contact" className="hover:text-white">Contact</Link>
                        <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white">Terms of Service</Link>
                    </div>
                    <p>&copy; {new Date().getFullYear()} QuickMate. All rights reserved.</p>
                </div>
            </footer>
    )
}

export default Footer
