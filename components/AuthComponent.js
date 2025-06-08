import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { UserPlus, LogIn } from 'lucide-react';
import Spinner from './Spinner';
import { auth, db } from '../firebase/firebaseConfig';
import { usersCollectionPath } from '../firebase/paths';
import { getAuth } from 'firebase/auth';
import { useAuthContext } from '../context/AuthContext';

/**
 * AuthComponent handles user authentication (login and registration)
 * @component
 */
const AuthComponent = ({ setCurrentUser, setAppInitializationError }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = getAuth();

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        if (!auth || !db) {
            setError("Firebase is not initialized. Please try again later.");
            setLoading(false);
            if (setAppInitializationError) setAppInitializationError("Firebase not initialized during auth.");
            return;
        }
        try {
            let userCredential;
            if (isSignUp) {
                if (!displayName.trim()) {
                    setError("Display name is required for sign up.");
                    setLoading(false);
                    return;
                }
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await updateProfile(user, { displayName: displayName });
                const userDocRef = doc(db, usersCollectionPath, user.uid);
                const userPhoto = user.photoURL || `https://placehold.co/100x100/374151/E5E7EB?text=${displayName.charAt(0).toUpperCase()}`;
                await setDoc(userDocRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: displayName,
                    photoURL: userPhoto,
                    followers: [],
                    following: [],
                    createdAt: Timestamp.now(),
                });
                setCurrentUser({ uid: user.uid, email: user.email, displayName: displayName, photoURL: userPhoto, isAnonymous: false });
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const userDocSnap = await getDoc(doc(db, usersCollectionPath, user.uid));
                if (userDocSnap.exists()) {
                    setCurrentUser({ uid: user.uid, isAnonymous: false, ...userDocSnap.data() });
                } else {
                    const userPhoto = user.photoURL || `https://placehold.co/100x100/374151/E5E7EB?text=${(user.displayName || "U").charAt(0).toUpperCase()}`;
                    await setDoc(doc(db, usersCollectionPath, user.uid), {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || 'User',
                        photoURL: userPhoto,
                        followers: [],
                        following: [],
                        createdAt: Timestamp.now(),
                    });
                    setCurrentUser({ uid: user.uid, email: user.email, displayName: user.displayName || 'User', photoURL: userPhoto, isAnonymous: false });
                }
            }
        } catch (err) {
            console.error("Auth error:", err);
            setError(err.message || "Authentication failed. Please try again.");
            if (setAppInitializationError) setAppInitializationError("Auth Error: " + (err.message || "Unknown auth error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-4">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h1 className="text-4xl font-bold text-center text-indigo-400 mb-2">SocialStudy</h1>
                <p className="text-center text-gray-400 mb-8">Track your learning journey.</p>

                <form onSubmit={handleAuth} className="space-y-6">
                    {isSignUp && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Display Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                                placeholder="Your Name"
                                required={isSignUp}
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-indigo-400 transition duration-150"
                    >
                        {loading ? <Spinner /> : (isSignUp ? 'Sign Up' : 'Log In')}
                        {isSignUp ? <UserPlus className="ml-2 h-5 w-5" /> : <LogIn className="ml-2 h-5 w-5" />}
                    </button>
                </form>
                <p className="mt-8 text-center text-sm text-gray-400">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="font-medium text-indigo-400 hover:text-indigo-300 ml-1">
                        {isSignUp ? 'Log In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    );
};

AuthComponent.propTypes = {
    setCurrentUser: PropTypes.func.isRequired,
    setAppInitializationError: PropTypes.func.isRequired,
};

export default AuthComponent;