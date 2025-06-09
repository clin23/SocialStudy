import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { getUsersPath } from "../firebase/paths";
import { ROLES, ROUTES } from "../constants";
import { Mail, Lock, User, AlertCircle } from "lucide-react";
import Spinner from "./Spinner";

/**
 * AuthComponent handles user authentication (login and registration)
 * @component
 */
const AuthComponent = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        // Fetch user profile from Firestore
        const userRef = doc(db, getUsersPath(), user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          setError("User profile not found in Firestore.");
          setLoading(false);
          return;
        }
        // Optionally, you could set user profile in context/state here
        navigate(ROUTES.HOME);
      } else {
        // Register
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        const displayName = username || email.split("@")[0];
        const photoURL =
          user.photoURL ||
          `https://placehold.co/100x100/374151/E5E7EB?text=${displayName.charAt(
            0
          )}`;
        // Create user document
        const userRef = doc(db, getUsersPath(), user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          username: username,
          displayName: displayName,
          photoURL: photoURL,
          followers: [],
          following: [],
          role: ROLES.USER,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        // Optionally, you could set user profile in context/state here
        navigate(ROUTES.HOME);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>
                <User size={16} />
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
              />
            </div>
          )}
          <div className="form-group">
            <label>
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>
              <Lock size={16} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? <Spinner /> : isLogin ? "Login" : "Register"}
          </button>
        </form>
        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthComponent;
