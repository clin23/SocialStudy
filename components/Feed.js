import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';
import FeedSummary from './FeedSummary';
import TodoList from './TodoList';
import PostCard from './PostCard';
import { db } from '../firebase/firebaseConfig';
import { studySessionsCollectionPath } from '../firebase/paths';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { BookOpen } from 'lucide-react';

const Feed = ({ currentUser, onLike, onCommentSubmit, onFollowToggle, onOpenPostModal, setActiveTab, setInitialSessionData }) => {
    const [feedSessions, setFeedSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentUser || !currentUser.uid || !db) {
            setIsLoading(false);
            setFeedSessions([]);
            return;
        }
        setIsLoading(true);
        setError('');
        let q;

        if (!currentUser.following || currentUser.following.length === 0) {
            q = query(
                collection(db, studySessionsCollectionPath)
            );
        } else {
            const followingList = currentUser.following.length > 30 ? currentUser.following.slice(0, 30) : currentUser.following;
            if (currentUser.following.length > 30) {
                console.warn("Feed query: 'following' array has more than 30 UIDs. Firestore 'in' query is limited to 30. Truncating list for query.");
            }
            q = query(
                collection(db, studySessionsCollectionPath),
                where("userId", "in", followingList)
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            sessions.sort((a,b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
            setFeedSessions(sessions);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching feed:", err);
            setError("Could not load feed. " + err.message);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    if (isLoading && feedSessions.length === 0) return <div className="min-h-full flex justify-center items-center"><Spinner /></div>;
    if (error) return <div className="text-red-400 p-4 text-center">{error}</div>;

    return (
        <div className="min-h-full">
            {currentUser && <FeedSummary currentUser={currentUser} />}

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-semibold text-gray-100 mb-4">
                        {currentUser && currentUser.following && currentUser.following.length > 0 ? "Your Feed" : "Discover Posts"}
                    </h2>
                    {isLoading && feedSessions.length === 0 && <Spinner />}
                    {!isLoading && feedSessions.length === 0 ? (
                        <div className="text-center py-10">
                            <BookOpen className="mx-auto h-16 w-16 text-gray-500 mb-4" />
                            <p className="text-gray-400 text-lg">
                                {currentUser && currentUser.following && currentUser.following.length > 0
                                    ? "No new posts from people you follow."
                                    : "No posts to display yet. Record a session or find users to follow!"}
                            </p>
                            {(!currentUser || !currentUser.following || currentUser.following.length === 0) && (
                                <p className="text-sm text-gray-500 mt-2">Find users to follow in the 'Users' tab to personalize your feed.</p>
                            )}
                        </div>
                    ) : (
                        feedSessions.map(session => (
                            <PostCard
                                key={session.id}
                                session={session}
                                currentUser={currentUser}
                                onOpenPostModal={onOpenPostModal}
                            />
                        ))
                    )}
                </div>
                <div className="hidden lg:block lg:col-span-1">
                    {currentUser && <TodoList currentUser={currentUser} setActiveTab={setActiveTab} setInitialSessionData={setInitialSessionData} />}
                </div>
            </div>
        </div>
    );
};

export default Feed;