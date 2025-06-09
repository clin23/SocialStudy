import React, { useState, useEffect } from "react";
import Spinner from "./Spinner";
import { db } from "../firebase/firebaseConfig";
import { getUsersPath } from "../firebase/paths";
import { collection, onSnapshot } from "firebase/firestore";
import { Search, UserPlus } from "lucide-react";
import PropTypes from "prop-types";

const Users = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setError("");
    const usersRef = collection(db, getUsersPath());

    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const usersList = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.id !== currentUser?.uid);

        setUsers(usersList);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again later.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const filteredUsers = () => {
    return users.filter((user) =>
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="users-container">
      <h2 className="text-2xl font-semibold text-gray-100 mb-4">
        Find Other Students
      </h2>

      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-grid">
        {filteredUsers().length === 0 ? (
          <div className="no-results">
            {searchTerm
              ? "No users found matching your search."
              : "No users found."}
          </div>
        ) : (
          filteredUsers().map((user) => (
            <div key={user.id} className="user-card">
              <img
                src={
                  user.photoURL ||
                  `https://placehold.co/80x80/374151/E5E7EB?text=${
                    user.displayName?.charAt(0).toUpperCase() || "U"
                  }`
                }
                alt={user.displayName || "User"}
                className="user-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/80x80/374151/E5E7EB?text=${
                    user.displayName?.charAt(0).toUpperCase() || "U"
                  }`;
                }}
              />
              <h3 className="user-name">{user.displayName || "User"}</h3>
              <button
                className={`follow-button ${
                  user.isFollowing
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                <UserPlus size={16} className="mr-2" />
                {user.isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

Users.propTypes = {
  currentUser: PropTypes.shape({
    uid: PropTypes.string,
    // add other properties if needed
  }),
};

export default Users;
