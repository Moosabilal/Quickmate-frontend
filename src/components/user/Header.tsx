// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import ThemeToggle from '../ThemeToggle';
// import { useAppSelector } from '../../hooks/useAppSelector';
// import { logout, updateProfile } from '../../features/auth/authSlice';
// import { useAppDispatch } from '../../hooks/useAppDispatch';
// import { useLocation } from 'react-router-dom';
// import { authService } from '../../services/authService';
// import { Menu, X, ChevronDown } from 'lucide-react';
// import DeleteConfirmationModal from '../deleteConfirmationModel';
// import { DeleteConfirmationTypes } from '../../util/interface/IDeleteModelType';

// const Header = () => {
//     const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const navigate = useNavigate();
//     const dispatch = useAppDispatch();
//     const { user, isAuthenticated } = useAppSelector(state => state.auth);
//     const location = useLocation();

//     const isProfilePage = location.pathname.startsWith('/profile/*');

//     React.useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (isDropdownOpen && !(event.target as HTMLElement).closest('.relative')) {
//                 setIsDropdownOpen(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [isDropdownOpen]);


//     React.useEffect(() => {
//         const fetchUser = async () => {
//             try {
//                 const userData = await authService.getUser();
//                 dispatch(updateProfile({ user: userData }));
//             } catch (error) {
//                 console.error('Failed to fetch user data:', error);
//             }
//         };
//         if (isAuthenticated) {
//             fetchUser();
//         }
//     }, [isAuthenticated, dispatch]);

//     const handleLogout = async () => {
//         await authService.logout()
//         dispatch(logout());
//         setIsDropdownOpen(false);
//         setShowDeleteModal(false)
//         navigate('/login');
//     };

//     const navLinks = [
//         { to: '/', label: 'Home' },
//         { to: '/services', label: 'Services' },
//         { to: '/providers', label: 'Providers' },
//         { to: '/about', label: 'About Us' }
//     ];

//     const isLinkActive = (path: string) => {
//         if (path === '/') {
//             return location.pathname === '/';
//         }
//         return location.pathname.startsWith(path);
//     };

//     return (
//         <>
//             <header className="fixed top-0 w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg border-b border-gray-200/20 dark:border-gray-700/20">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="flex justify-between items-center h-20">
//                         <Link to="/" className="flex items-center space-x-3 group">
//                             <div className="relative">
//                                 <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
//                                     <span className="text-white font-bold text-lg">Q</span>
//                                 </div>
//                                 <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur"></div>
//                             </div>
//                             <div className="flex flex-col">
//                                 <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
//                                     QuickMate
//                                 </span>
//                                 <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
//                                     Professional Services
//                                 </span>
//                             </div>
//                         </Link>

//                         <nav className="hidden lg:flex space-x-1">
//                             {navLinks.map((link) => {
//                                 const active = isLinkActive(link.to);
//                                 return (
//                                     <Link
//                                         key={link.to}
//                                         to={link.to}
//                                         className={`relative px-6 py-3 font-medium transition-all duration-300 rounded-xl group
//                                             ${active 
//                                                 ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20' 
//                                                 : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
//                                             }`}
//                                     >
//                                         {link.label}
//                                         <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transform origin-center transition-transform duration-300 ease-out
//                                             ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}>
//                                         </span>
//                                     </Link>
//                                 );
//                             })}
//                         </nav>

//                         <div className="flex items-center space-x-4">
//                             <ThemeToggle />

//                             {isAuthenticated && !isProfilePage ? (
//                                 <div className="relative">
//                                     <button
//                                         onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                                         className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 group"
//                                     >
//                                         <img
//                                             src={user?.profilePicture || '/profileImage.png'}
//                                             alt="User Avatar"
//                                             className="w-10 h-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-500 transition-all duration-300"
//                                         />
//                                         <div className="hidden md:block text-left">
//                                             <p className="text-sm font-semibold">{user?.name || 'My Account'}</p>
//                                             <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back</p>
//                                         </div>
//                                         <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
//                                     </button>

//                                     {isDropdownOpen && (
//                                         <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl py-2 z-10 border border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
//                                             <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
//                                                 <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
//                                                 <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
//                                             </div>
//                                             <Link
//                                                 to="/profile"
//                                                 className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
//                                                 onClick={() => setIsDropdownOpen(false)}
//                                             >
//                                                 Profile Settings
//                                             </Link>
//                                             {user?.role === "ServiceProvider" && <Link
//                                                 to="/provider/providerDashboard"
//                                                 className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
//                                                 onClick={() => setIsDropdownOpen(false)}
//                                             >
//                                                 Service Dashboard
//                                             </Link>}
//                                             <button
//                                                 type='button'
//                                                 onClick={() => setShowDeleteModal(true)}
//                                                 className="w-full text-left flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
//                                             >
//                                                 Sign Out
//                                             </button>
//                                         </div>
//                                     )}
//                                 </div>
//                             ) : !isAuthenticated && !isProfilePage ? (
//                                 <div className="flex items-center space-x-3">
//                                     <Link to="/login">
//                                         <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
//                                             Login
//                                         </button>
//                                     </Link>
//                                     <Link to="/register">
//                                         <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
//                                             Get Started
//                                         </button>
//                                     </Link>
//                                 </div>
//                             ) : null}

//                             <button
//                                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                                 className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
//                             >
//                                 {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//                             </button>
//                         </div>
//                     </div>

//                     {isMobileMenuOpen && (
//                         <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg">
//                             <nav className="py-4 space-y-2">
//                                 {navLinks.map((link) => {
//                                     const active = isLinkActive(link.to);
//                                     return (
//                                         <Link
//                                             key={link.to}
//                                             to={link.to}
//                                             className={`block px-4 py-3 font-medium transition-all duration-300 rounded-lg mx-2
//                                                 ${active
//                                                     ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
//                                                     : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
//                                                 }`}
//                                             onClick={() => setIsMobileMenuOpen(false)}
//                                         >
//                                             {link.label}
//                                         </Link>
//                                     );
//                                 })}
//                             </nav>
//                         </div>
//                     )}
//                 </div>
//             </header>
//             <DeleteConfirmationModal
//                 isOpen={showDeleteModal}
//                 onClose={() => setShowDeleteModal(false)}
//                 onConfirm={handleLogout}
//                 itemType={DeleteConfirmationTypes.LOGOUT}
//             />
//         </>
//     );
// };

// export default Header;


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';
import { useAppSelector } from '../../hooks/useAppSelector';
import { logout, updateProfile } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Menu, X, ChevronDown, User, LayoutDashboard, LogOut } from 'lucide-react';
import DeleteConfirmationModal from '../deleteConfirmationModel';
import { DeleteConfirmationTypes } from '../../util/interface/IDeleteModelType';

const Header = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector(state => state.auth);
    const location = useLocation();

    const isProfilePage = location.pathname.startsWith('/profile/*');

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isDropdownOpen && !(event.target as HTMLElement).closest('.user-menu-container')) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await authService.getUser();
                dispatch(updateProfile({ user: userData }));
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };
        if (isAuthenticated) {
            fetchUser();
        }
    }, [isAuthenticated, dispatch]);

    const handleLogout = async () => {
        await authService.logout()
        dispatch(logout());
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        setShowDeleteModal(false)
        navigate('/login');
    };

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/services', label: 'Services' },
        { to: '/providers', label: 'Providers' },
        { to: '/about', label: 'About Us' }
    ];

    const isLinkActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <header className="fixed top-0 w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg border-b border-gray-200/20 dark:border-gray-700/20">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 md:h-20">

                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group shrink-0">
                            <div className="relative">
                                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-300">
                                    <span className="text-white font-bold text-base sm:text-lg">Q</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight">
                                    QuickMate
                                </span>
                                <span className="hidden xs:block text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                    Professional Services
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex space-x-1">
                            {navLinks.map((link) => {
                                const active = isLinkActive(link.to);
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`relative px-4 py-2 font-medium transition-all duration-300 rounded-xl group
                                            ${active
                                                ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                                                : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                                            }`}
                                    >
                                        {link.label}
                                        <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transform origin-center transition-transform duration-300 ease-out
                                            ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}>
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Actions Section */}
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            
                            {/* ThemeToggle - Desktop Only (Hidden on mobile top bar) */}
                            <div className="hidden sm:flex items-center">
                                <ThemeToggle />
                            </div>

                            {/* Auth Section - Desktop */}
                            {isAuthenticated && !isProfilePage ? (
                                <div className="relative user-menu-container hidden sm:block">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center space-x-2 px-2 py-1.5 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 group"
                                    >
                                        <img
                                            src={user?.profilePicture || '/profileImage.png'}
                                            alt="User Avatar"
                                            className="w-8 h-8 md:w-10 md:h-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-500 transition-all duration-300"
                                        />
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-semibold truncate max-w-[100px]">{user?.name || 'My Account'}</p>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl py-2 z-10 border border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
                                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                            </div>
                                            <Link to="/profile" className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => setIsDropdownOpen(false)}>
                                                Profile Settings
                                            </Link>
                                            {user?.role === "ServiceProvider" && (
                                                <Link to="/provider/providerDashboard" className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => setIsDropdownOpen(false)}>
                                                    Service Dashboard
                                                </Link>
                                            )}
                                            <button type='button' onClick={() => setShowDeleteModal(true)} className="w-full text-left flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : !isAuthenticated && !isProfilePage ? (
                                <div className="hidden sm:flex items-center space-x-2">
                                    <Link to="/login" className="text-gray-700 dark:text-gray-300 font-medium px-3 py-2 text-sm hover:text-blue-600 transition-colors">Login</Link>
                                    <Link to="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-xl text-sm shadow-md">
                                        Get Started
                                    </Link>
                                </div>
                            ) : null}

                            {/* Mobile Hamburger Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation Menu */}
                    <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="border-t border-gray-100 dark:border-gray-800 pb-6 pt-2 space-y-1">
                            
                            {/* Mobile Theme Toggle - Only visible when menu is open on small screens */}
                            <div className="sm:hidden px-4 py-3 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-xl mx-2 mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Appearance</span>
                                <ThemeToggle />
                            </div>

                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`block px-4 py-3.5 text-base font-medium rounded-xl mx-2 ${isLinkActive(link.to)
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 px-4">
                                {isAuthenticated ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-3 mb-4 p-2">
                                            <img src={user?.profilePicture || '/profileImage.png'} alt="User" className="w-12 h-12 rounded-full ring-2 ring-blue-500" />
                                            <div className="overflow-hidden">
                                                <p className="font-bold dark:text-white truncate">{user?.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                            </div>
                                        </div>
                                        <Link to="/profile" className="flex items-center space-x-3 w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                                            <User size={18} /> <span>Profile Settings</span>
                                        </Link>
                                        <button onClick={() => setShowDeleteModal(true)} className="flex items-center space-x-3 w-full p-4 rounded-xl text-red-600 bg-red-50 dark:bg-red-900/10">
                                            <LogOut size={18} /> <span>Sign Out</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col space-y-3">
                                        <Link to="/login" className="w-full text-center py-3.5 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 dark:text-white">
                                            Login
                                        </Link>
                                        <Link to="/register" className="w-full text-center py-3.5 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                            Get Started
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleLogout}
                itemType={DeleteConfirmationTypes.LOGOUT}
            />
            <div className="h-16 md:h-20"></div>
        </>
    );
};

export default Header;