import React, { useState } from "react";
import "./styles/main.css";

// Import components
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Feed from "./components/Feed";
import RecordSession from "./components/RecordSession";
import TodoList from "./components/TodoList";
import CalendarView from "./components/CalendarView";
import Profile from "./components/Profile";
import Users from "./components/Users";
import Groups from "./components/Groups";
import AuthComponent from "./components/AuthComponent";
import PostDetailModal from "./components/PostDetailModal";
import Spinner from "./components/Spinner";
import ErrorBoundary from "./components/ErrorBoundary";

// Import context and hooks
import { AuthProvider, useAuthContext } from "./context/AuthContext";

const AppContent = () => {
  const { user: currentUser, loading: isAuthReady } = useAuthContext();
  const [activeTab, setActiveTab] = useState("home");
  const [selectedSessionForModal, setSelectedSessionForModal] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [initialSessionData, setInitialSessionData] = useState(null);

  // Modal handlers
  const handleOpenPostModal = (session) => setSelectedSessionForModal(session);
  const handleClosePostModal = () => setSelectedSessionForModal(null);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <Feed
            currentUser={currentUser}
            onOpenPostModal={handleOpenPostModal}
            setActiveTab={setActiveTab}
            setInitialSessionData={setInitialSessionData}
          />
        );
      case "record":
        return (
          <RecordSession
            currentUser={currentUser}
            setActiveTab={setActiveTab}
            initialSessionData={initialSessionData}
            setInitialSessionData={setInitialSessionData}
          />
        );
      case "todos":
        return (
          <TodoList
            currentUser={currentUser}
            isFullPage={true}
            setActiveTab={setActiveTab}
            setInitialSessionData={setInitialSessionData}
          />
        );
      case "calendar":
        return (
          <CalendarView
            currentUser={currentUser}
            setActiveTab={setActiveTab}
            setInitialSessionData={setInitialSessionData}
          />
        );
      case "you":
        return <Profile currentUser={currentUser} />;
      case "users":
        return <Users currentUser={currentUser} />;
      case "groups":
        return <Groups currentUser={currentUser} />;
      default:
        return (
          <Feed
            currentUser={currentUser}
            onOpenPostModal={handleOpenPostModal}
            setActiveTab={setActiveTab}
            setInitialSessionData={setInitialSessionData}
          />
        );
    }
  };

  if (!isAuthReady) {
    return (
      <div className="loading-container">
        <Spinner />
        <p className="mt-3">Initializing...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthComponent />;
  }

  return (
    <div className="app-container">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebarDesktop={() => setIsSidebarOpen(!isSidebarOpen)}
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div
        className={`main-content ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <TopBar
          toggleSidebarMobile={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          activeTab={activeTab}
        />
        <main className="content-area">
          <div className="container">{renderTabContent()}</div>
        </main>
      </div>
      {selectedSessionForModal && (
        <PostDetailModal
          session={selectedSessionForModal}
          currentUser={currentUser}
          onClose={handleClosePostModal}
        />
      )}
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
