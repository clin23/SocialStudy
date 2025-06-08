import React from 'react';
import { Home as HomeIcon, PlayCircle, ListChecks, Calendar as CalendarIcon, Search as SearchIcon, Users as PeopleIcon, UserCircle2, LogOut, ChevronsLeft, ChevronsRight, Menu, X as CloseIcon } from 'lucide-react';
import AppLogo from './AppLogo';

const Sidebar = ({ isOpen, toggleSidebarDesktop, currentUser, handleLogout, activeTab, setActiveTab }) => {
    const navItems = [
        { name: 'home', label: 'Home', icon: <HomeIcon size={20} /> },
        { name: 'record', label: 'Record Session', icon: <PlayCircle size={20} /> },
        { name: 'todos', label: 'To-Do List', icon: <ListChecks size={20} /> },
        { name: 'calendar', label: 'Calendar', icon: <CalendarIcon size={20} /> },
        { name: 'users', label: 'Find Users', icon: <SearchIcon size={20} /> },
        { name: 'groups', label: 'Study Groups', icon: <PeopleIcon size={20} /> },
        { name: 'you', label: 'My Profile', icon: <UserCircle2 size={20} /> },
    ];

    return (
        <div className={`fixed top-0 left-0 h-screen bg-gray-800 text-indigo-100 flex flex-col transition-all duration-300 ease-in-out z-40 shadow-lg ${isOpen ? 'w-48' : 'w-20'}`}>
            <div className="pt-3 pb-1 flex justify-center">
                <AppLogo className={`h-10 w-10 text-indigo-400`} />
            </div>
            <div className={`flex ${isOpen ? 'justify-end pr-3' : 'justify-center'} mb-2`}>
                <button
                    onClick={toggleSidebarDesktop}
                    className="hidden md:inline-flex items-center justify-center p-1.5 rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none"
                    title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                    {isOpen ? <ChevronsLeft size={22} /> : <ChevronsRight size={22} />}
                </button>
            </div>
            <nav className="flex-grow space-y-1 px-2">
                {navItems.map((item) => (
                    <button
                        key={item.name}
                        onClick={() => setActiveTab(item.name)}
                        title={item.label}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                            ${activeTab === item.name
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }
                            ${!isOpen ? 'justify-center' : ''}
                        `}
                    >
                        {item.icon}
                        {isOpen && <span className="truncate">{item.label}</span>}
                    </button>
                ))}
            </nav>
            {currentUser && (
                <div className={`p-3 border-t border-gray-700 ${!isOpen ? 'flex flex-col items-center' : ''}`}>
                    {isOpen && currentUser.photoURL && (
                        <img
                            src={currentUser.photoURL}
                            alt={currentUser.displayName || "User"}
                            className="w-10 h-10 rounded-full mb-2 object-cover mx-auto"
                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/374151/E5E7EB?text=${currentUser.displayName?.charAt(0).toUpperCase() || 'U'}`}}
                        />
                    )}
                    {isOpen && <p className="text-sm font-medium text-center truncate mb-1">{currentUser.displayName}</p>}
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-red-400 hover:bg-red-700 hover:text-red-200 ${!isOpen ? 'justify-center' : ''}`}
                        title="Logout"
                    >
                        <LogOut size={20} />
                        {isOpen && <span className="truncate">Logout</span>}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Sidebar;