import React from "react";
import { Menu, Bell, User } from "lucide-react";
import AppLogo from "./AppLogo";
import PropTypes from "prop-types";

const getPageTitle = (activeTab) => {
  switch (activeTab) {
    case "home":
      return "Home Feed";
    case "record":
      return "Record New Session";
    case "todos":
      return "To-Do List";
    case "calendar":
      return "My Calendar";
    case "users":
      return "Find Other Students";
    case "groups":
      return "Study Groups";
    case "you":
      return "My Profile & Analytics";
    default:
      return "SocialStudy";
  }
};

const TopBar = ({ toggleSidebarMobile, isSidebarOpen, activeTab }) => {
  return (
    <header className="top-bar h-16 bg-gradient-to-r from-gray-800 via-indigo-700/70 via-[85%] to-indigo-600 shadow-md flex items-center justify-between px-4 sticky top-0 z-30 rounded-tl-lg">
      <div className="flex items-center">
        <button
          type="button"
          onClick={toggleSidebarMobile}
          className="md:hidden text-indigo-100 p-2 rounded-md hover:bg-indigo-500 hover:bg-opacity-50 focus:outline-none mr-2"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <Menu size={24} /> : <Menu size={24} />}
        </button>
        <AppLogo />
        <h1 className="text-xl font-bold text-indigo-100 truncate ml-2">
          {getPageTitle(activeTab)}
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        {/* Placeholder for future elements like notifications or user menu in top bar */}
      </div>
    </header>
  );
};

TopBar.propTypes = {
  toggleSidebarMobile: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool,
  activeTab: PropTypes.string,
};

export default TopBar;
