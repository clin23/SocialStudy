import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';
import { db } from '../firebase/firebaseConfig';
import { usersCollectionPath, studySessionsCollectionPath } from '../firebase/paths';
import { doc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { BookOpen, ListChecks, CalendarDays, Brain, Star, Clock } from 'lucide-react';
import { formatDuration } from '../utils/formatters';

const Profile = ({ currentUser }) => {
    const [profileData, setProfileData] = useState(null);
    const [userSessions, setUserSessions] = useState([]);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    useEffect(() => {
        if (!currentUser || !currentUser.uid || !db) {
            setIsLoadingProfile(false);
            setProfileData(null);
            setUserSessions([]);
            return;
        }

        setIsLoadingProfile(true);

        const userDocRef = doc(db, usersCollectionPath, currentUser.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setProfileData(docSnap.data());
            } else {
                setProfileData(null);
            }
            setIsLoadingProfile(false);
        });

        const sessionsQuery = query(
            collection(db, studySessionsCollectionPath),
            where("userId", "==", currentUser.uid)
        );
        const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
            let sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            sessions.sort((a,b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
            setUserSessions(sessions);
        });

        return () => {
            unsubscribeProfile();
            unsubscribeSessions();
        };
    }, [currentUser]);

    if (isLoadingProfile) return <div className="min-h-full flex justify-center items-center"><Spinner /></div>;
    if (!profileData) return <div className="text-gray-400 p-4 text-center">Profile data not available or user not found.</div>;

    return (
        <div className="min-h-full space-y-6">
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row items-center">
                    <img
                        src={profileData.photoURL || `https://placehold.co/128x128/374151/E5E7EB?text=${profileData.displayName?.charAt(0).toUpperCase() || 'U'}`}
                        alt={profileData.displayName || 'User'}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full mr-0 sm:mr-4 mb-3 sm:mb-0 object-cover border-4 border-indigo-500"
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/128x128/374151/E5E7EB?text=${profileData.displayName?.charAt(0).toUpperCase() || 'U'}`}}
                    />
                    <div className="text-center sm:text-left">
                        <h2 className="text-2xl font-bold text-gray-100">{profileData.displayName}</h2>
                        <p className="text-sm text-gray-400">{profileData.email}</p>
                        <p className="text-xs text-gray-500 mt-0.5">User ID: <span className="font-mono">{profileData.uid}</span></p>
                        <div className="mt-2 flex justify-center sm:justify-start space-x-3">
                            <p className="text-xs text-gray-300"><strong className="font-medium">{profileData.followers?.length || 0}</strong> Followers</p>
                            <p className="text-xs text-gray-300"><strong className="font-medium">{profileData.following?.length || 0}</strong> Following</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-100 mb-3">My Study Sessions</h3>
                {userSessions.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">You haven't posted any study sessions yet. Go record one!</p>
                ) : (
                    <ul className="space-y-2">
                        {userSessions.map(session => (
                            <li key={session.id} className="bg-gray-700 p-3 rounded-md">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-indigo-300">{session.title}</span>
                                    <span className="text-xs text-gray-400">{formatDuration(session.duration)}</span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs text-purple-300">{session.sessionType}</span>
                                    {typeof session.focusScore === 'number' && (
                                        <span className="flex items-center text-xs text-yellow-400">
                                            <Star className="inline h-3 w-3 mr-1" /> {session.focusScore}/10
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Profile;