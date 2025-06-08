import React from 'react';
import { Clock, ThumbsUp, MessageSquare, Maximize2, Star } from 'lucide-react';
import { formatDuration, timeAgo } from '../utils/formatters';

const PostCard = ({ session, currentUser, onOpenPostModal }) => {
    if (!session || !session.id) return null;

    return (
        <div
            className="bg-gray-800 rounded-xl shadow-lg p-4 my-4 w-full cursor-pointer hover:bg-gray-700 transition-colors duration-150"
            onClick={() => onOpenPostModal(session)}
        >
            <div className="flex items-center mb-2">
                <img
                    src={session.userPhotoURL || `https://placehold.co/40x40/374151/E5E7EB?text=${session.userDisplayName?.charAt(0).toUpperCase() || 'U'}`}
                    alt={session.userDisplayName || 'User'}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/40x40/374151/E5E7EB?text=${session.userDisplayName?.charAt(0).toUpperCase() || 'U'}`}}
                />
                <div>
                    <p className="font-semibold text-gray-100">{session.userDisplayName || 'Anonymous User'}</p>
                    <p className="text-xs text-gray-400">{timeAgo(session.createdAt)}</p>
                </div>
            </div>

            <h3 className="text-lg font-semibold text-indigo-400 mb-0.5">{session.title}</h3>
            {session.sessionType && (
                <p className="text-xs text-purple-400 mb-1">{session.sessionType}</p>
            )}
            <div className="flex justify-between items-center text-xs text-gray-300 mb-1">
                <span>
                    <Clock className="inline h-3 w-3 mr-1 text-gray-400" /> Duration: {formatDuration(session.duration)}
                </span>
                {typeof session.focusScore === 'number' && (
                    <span className="flex items-center">
                        <Star className="inline h-3 w-3 mr-1 text-yellow-400" /> Focus: {session.focusScore}/10
                    </span>
                )}
            </div>

            {session.sessionPlan && (
                <p className="text-gray-200 text-sm whitespace-pre-wrap line-clamp-3 mb-2">
                    {session.sessionPlan}
                </p>
            )}

            {session.mediaName && (
                <div className="my-2 p-2 bg-gray-700 rounded-md flex items-center text-gray-300 text-sm">
                    {/* Add media icon logic here if needed */}
                    <span className="truncate">{session.mediaName}</span>
                </div>
            )}

            <div className="flex items-center justify-start space-x-4 border-t border-gray-700 pt-1.5 mt-1.5">
                <span className="flex items-center text-xs text-gray-400">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {session.likesCount || 0}
                </span>
                <span className="flex items-center text-xs text-gray-400">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {session.commentsCount || 0}
                </span>
                <span className="ml-auto text-xs text-indigo-400 flex items-center">
                    View Details <Maximize2 size={12} className="ml-1"/>
                </span>
            </div>
        </div>
    );
};

export default PostCard;