import React from 'react';
import { Menu, X as CloseIcon } from 'lucide-react';

const TopBar = ({ toggleSidebarMobile, isSidebarOpen, activeTab }) => {
    const getPageTitle = (tab) => {
        switch(tab) {
            case 'home': return 'Home Feed';
            case 'record': return 'Record New Session';
            case 'todos': return 'To-Do List';
            case 'calendar': return 'My Calendar';
            case 'users': return 'Find Other Students';
            case 'groups': return 'Study Groups';
            case 'you': return 'My Profile & Analytics';
            default: return 'SocialStudy';
        }
    };

    return (
        <div className="h-16 bg-gradient-to-r from-gray-800 via-indigo-700/70 via-[85%] to-indigo-600 shadow-md flex items-center justify-between px-4 sticky top-0 z-30 rounded-tl-lg">
            <div className="flex items-center">
                <button
                    onClick={toggleSidebarMobile}
                    className="md:hidden text-indigo-100 p-2 rounded-md hover:bg-indigo-500 hover:bg-opacity-50 focus:outline-none mr-2"
                    aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                    {isSidebarOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
                </button>
                <h1 className="text-xl font-bold text-indigo-100 truncate">
                    {getPageTitle(activeTab)}
                </h1>
            </div>
            <div className="flex items-center">
                {/* Placeholder for future elements like notifications or user menu in top bar */}
            </div>
        </div>
    );
};

export default TopBar;