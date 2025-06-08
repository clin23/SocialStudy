import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageSquare, MoreVertical, XCircle, Maximize2, Zap, Star, Clock, Image as ImageIcon, Video as VideoIcon, Paperclip, Send } from 'lucide-react';
import Modal from './Modal';
import Spinner from './Spinner';
import { db } from '../firebase/firebaseConfig';
import { likesCollectionPath, commentsCollectionPath } from '../firebase/paths';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { formatDuration, timeAgo } from '../utils/formatters';

const PostDetailModal = ({ session, currentUser, onClose, onLike, onCommentSubmit, onFollowToggle, onOpenDeleteModal }) => {
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [likes, setLikes] = useState([]);
    const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isFollowingUser, setIsFollowingUser] = useState(false);
    const [showPostOptions, setShowPostOptions] = useState(false);

    useEffect(() => {
        if (!session || !session.id || !db) return;
        const likesQuery = query(collection(db, likesCollectionPath), where("sessionId", "==", session.id));
        const unsubscribeLikes = onSnapshot(likesQuery, (snapshot) => {
            const likesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLikes(likesData);
            if (currentUser && currentUser.uid) {
                setIsLikedByCurrentUser(likesData.some(like => like.userId === currentUser.uid));
            }
        });
        return () => unsubscribeLikes();
    }, [session, currentUser]);

    useEffect(() => {
        if (!session || !session.id || !db) {
            setComments([]);
            return;
        }
        setIsLoadingComments(true);
        const q = query(
            collection(db, commentsCollectionPath),
            where("sessionId", "==", session.id)
        );
        const unsubscribeComments = onSnapshot(q, (snapshot) => {
            let commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            commentsData.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
            setComments(commentsData);
            setIsLoadingComments(false);
        });
        return () => unsubscribeComments();
    }, [session?.id]);

    useEffect(() => {
        if (currentUser && currentUser.following && session && session.userId && currentUser.uid !== session.userId) {
            setIsFollowingUser(currentUser.following.includes(session.userId));
        } else {
            setIsFollowingUser(false);
        }
    }, [currentUser, session]);

    const handleInternalCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || !session || !session.id || !currentUser || !currentUser.uid) return;
        try {
            await onCommentSubmit(session.id, commentText);
            setCommentText('');
        } catch (error) {
            console.error("Error submitting comment from modal:", error);
        }
    };

    if (!session) return null;

    return (
        <Modal isOpen={!!session} onClose={onClose} title="Session Details" fullHeight={true}>
            <div className="space-y-3">
                <div className="flex items-start mb-2">
                    <img
                        src={session.userPhotoURL || `https://placehold.co/40x40/374151/E5E7EB?text=${session.userDisplayName?.charAt(0).toUpperCase() || 'U'}`}
                        alt={session.userDisplayName || 'User'}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/374151/E5E7EB?text=${session.userDisplayName?.charAt(0).toUpperCase() || 'U'}`}}
                    />
                    <div className="flex-grow">
                        <p className="font-semibold text-gray-100">{session.userDisplayName || 'Anonymous User'}</p>
                        <p className="text-xs text-gray-400">{timeAgo(session.createdAt)}</p>
                    </div>
                    {currentUser && session.userId === currentUser.uid && (
                        <div className="relative">
                            <button onClick={() => setShowPostOptions(!showPostOptions)} className="p-1 text-gray-400 hover:text-gray-200">
                                <MoreVertical size={20} />
                            </button>
                            {showPostOptions && (
                                <div className="absolute right-0 mt-1 w-36 bg-gray-700 rounded-md shadow-lg z-20 border border-gray-600">
                                    <button
                                        onClick={() => {
                                            if (onOpenDeleteModal) onOpenDeleteModal(session.id);
                                            setShowPostOptions(false);
                                        }}
                                        className="block w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-gray-600 hover:text-red-300 rounded-md"
                                    >
                                        Delete Post
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {currentUser && session.userId !== currentUser.uid && onFollowToggle && (
                        <button
                            onClick={() => onFollowToggle(session.userId)}
                            className={`ml-3 px-3 py-1 text-sm rounded-full transition-colors ${
                                isFollowingUser
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                            }`}
                        >
                            {isFollowingUser ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-semibold text-indigo-400">{session.title}</h3>
                    {session.sessionType && (
                        <span className="text-sm bg-gray-700 text-purple-300 px-2 py-0.5 rounded-full">
                            {session.sessionType}
                        </span>
                    )}
                    {session.isPomodoro && (
                        <span className="flex items-center text-xs bg-purple-600 text-purple-100 px-2 py-0.5 rounded-full">
                            <Zap size={12} className="mr-1" /> Pomodoro
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap justify-between items-center text-sm text-gray-300 mb-2 border-b border-gray-700 pb-2">
                    <span className="flex items-center mb-1 sm:mb-0 mr-3">
                        <Clock className="inline h-4 w-4 mr-1 text-gray-400" /> Duration: {formatDuration(session.duration)}
                    </span>
                    {typeof session.focusScore === 'number' && (
                        <span className="flex items-center mb-1 sm:mb-0">
                            <Star className="inline h-4 w-4 mr-1 text-yellow-400" /> Focus: {session.focusScore}/10
                        </span>
                    )}
                </div>

                {session.mediaName && (
                    <div className="my-3 p-3 bg-gray-700 rounded-lg">
                        <p className="text-sm font-medium text-indigo-300 mb-1">Attached Media:</p>
                        {session.mediaType?.startsWith('image/') && (
                            <div className="flex flex-col items-center">
                                <ImageIcon size={48} className="text-indigo-400 mb-2" />
                                <p className="text-xs text-gray-400">(Image: {session.mediaName})</p>
                                <p className="text-xs text-gray-500 mt-1">Full image display requires Firebase Storage integration and a valid URL.</p>
                            </div>
                        )}
                        {session.mediaType?.startsWith('video/') && (
                            <div className="flex flex-col items-center">
                                <VideoIcon size={48} className="text-indigo-400 mb-2" />
                                <p className="text-xs text-gray-400">(Video: {session.mediaName})</p>
                                <p className="text-xs text-gray-500 mt-1">Full video playback requires Firebase Storage integration and a valid URL.</p>
                            </div>
                        )}
                        {!session.mediaType?.startsWith('image/') && !session.mediaType?.startsWith('video/') && (
                            <p className="text-gray-300 text-sm">{session.mediaName} (Unsupported preview)</p>
                        )}
                    </div>
                )}

                {session.sessionPlan && (
                    <div className="mb-2">
                        <p className="text-md font-medium text-indigo-300 mb-1">Session Plan:</p>
                        <p className="text-gray-200 text-sm whitespace-pre-wrap bg-gray-700 p-2 rounded-md">{session.sessionPlan}</p>
                    </div>
                )}
                {session.sessionReflection && (
                    <div className="mb-2">
                        <p className="text-md font-medium text-indigo-300 mb-1">Session Reflection:</p>
                        <p className="text-gray-200 text-sm whitespace-pre-wrap bg-gray-700 p-2 rounded-md">{session.sessionReflection}</p>
                    </div>
                )}

                {session.distractions && session.distractions.length > 0 && (
                    <div className="mb-2">
                        <p className="text-md font-medium text-indigo-300 mb-1">Distractions:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {session.distractions.map((dist, index) => (
                                <span key={index} className="text-sm bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                                    {dist}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-start space-x-6 border-t border-gray-700 pt-2 mt-2">
                    <button
                        onClick={() => onLike(session.id, isLikedByCurrentUser)}
                        disabled={!currentUser || !currentUser.uid}
                        className={`flex items-center text-sm ${isLikedByCurrentUser ? 'text-red-400' : 'text-gray-400 hover:text-red-400'} disabled:opacity-50`}
                    >
                        <ThumbsUp className={`h-5 w-5 mr-1 ${isLikedByCurrentUser ? 'fill-current text-red-400' : ''}`} />
                        {likes.length} Like{likes.length !== 1 && 's'}
                    </button>
                    <span className="flex items-center text-sm text-gray-400">
                        <MessageSquare className="h-5 w-5 mr-1" />
                        {comments.length} Comment{comments.length !== 1 && 's'}
                    </span>
                </div>

                <div className="mt-3 border-t border-gray-700 pt-3">
                    <h4 className="text-md font-semibold text-gray-100 mb-2">Comments</h4>
                    {isLoadingComments ? <Spinner /> : (
                        comments.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {comments.map(comment => (
                                    <div key={comment.id} className="bg-gray-700 p-2 rounded-md">
                                        <div className="flex items-start">
                                            <img
                                                src={comment.userPhotoURL || `https://placehold.co/32x32/374151/E5E7EB?text=${comment.userDisplayName?.charAt(0).toUpperCase() || 'U'}`}
                                                alt={comment.userDisplayName || 'User'}
                                                className="w-8 h-8 rounded-full mr-2 object-cover"
                                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/32x32/374151/E5E7EB?text=${comment.userDisplayName?.charAt(0).toUpperCase() || 'U'}`}}
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-100">{comment.userDisplayName || 'User'}</p>
                                                <p className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-200 mt-1 ml-10">{comment.text}</p>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-gray-400">No comments yet.</p>
                    )}
                    <form onSubmit={handleInternalCommentSubmit} className="mt-3 flex">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            disabled={!currentUser || !currentUser.uid}
                            className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-l-md text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400 disabled:bg-gray-600"
                        />
                        <button
                            type="submit"
                            disabled={!currentUser || !currentUser.uid || !commentText.trim()}
                            className="bg-indigo-500 text-white px-4 py-2 rounded-r-md hover:bg-indigo-600 text-sm disabled:bg-indigo-400"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </div>
        </Modal>
    );
};

export default PostDetailModal;