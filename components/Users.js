import React, { useState, useEffect, useMemo } from 'react';
import Spinner from './Spinner';
import { db } from '../firebase/firebaseConfig';
import { usersCollectionPath } from '../firebase/paths';
import { collection, onSnapshot } from 'firebase/firestore';
import { Search as SearchIcon } from 'lucide-react';

const Users = ({ currentUser, onFollowToggle }) => {
    const [usersList, setUsersList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!currentUser || !currentUser.uid || !db) {
            setIsLoading(false);
            setUsersList([]);
            return;
        }
        setIsLoading(true);
        setError('');
        const usersRef = collection(db, usersCollectionPath);
        const unsubscribe = onSnapshot(usersRef, (snapshot) => {
            const usersData = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(user => user.id !== currentUser?.uid);
            setUsersList(usersData);
            setIsLoading(false);
        }, (err) => {
            setError("Could not load users. " + err.message);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return usersList;
        return usersList.filter(user =>
            user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [usersList, searchTerm]);

    if (isLoading) return <div className="min-h-full flex justify-center items-center"><Spinner /></div>;
    if (error) return <div className="text-red-400 p-4 text-center">{error}</div>;

    return (
        <div className="min-h-full">
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">Find Other Students</h2>
            <div className="mb-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                    />
                </div>
            </div>
            {filteredUsers.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                    {searchTerm ? "No users found matching your search." : "No other users to display yet."}
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map(user => {
                        const isFollowing = currentUser?.following?.includes(user.id);
                        return (
                            <div key={user.id} className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center text-center">
                                <img
                                    src={user.photoURL || `https://placehold.co/80x80/374151/E5E7EB?text=${user.displayName?.charAt(0).toUpperCase() || 'U'}`}
                                    alt={user.displayName || 'User'}
                                    className="w-16 h-16 rounded-full mb-2 object-cover border-2 border-gray-700"
                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/374151/E5E7EB?text=${user.displayName?.charAt(0).toUpperCase() || 'U'}`}}
                                />
                                <h3 className="text-md font-semibold text-gray-100">{user.displayName || 'User'}</h3>
                                <p className="text-xs text-gray-400 mb-2">{user.email}</p>
                                <button
                                    onClick={() => onFollowToggle(user.id)}
                                    disabled={!currentUser || !currentUser.uid}
                                    className={`w-full px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                        isFollowing
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    } disabled:opacity-50`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Users;