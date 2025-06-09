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
    <header className="top-bar">
      <div className="flex items-center">
        <button
          type="button"
          onClick={toggleSidebarMobile}
          className="mobile-menu-button"
        >
          <Menu size={24} />
        </button>
        <AppLogo />
        <h1 className="page-title">{getPageTitle(activeTab)}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button type="button" className="icon-button">
          <Bell size={24} />
        </button>
        <button type="button" className="icon-button">
          <User size={24} />
        </button>
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
