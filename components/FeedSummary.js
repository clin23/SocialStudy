import React, { useState, useEffect } from 'react';
import { ListChecks, Clock, Brain } from 'lucide-react';
import Spinner from './Spinner';
import { db } from '../firebase/firebaseConfig';
import { studySessionsCollectionPath } from '../firebase/paths';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { formatDurationInMinutes } from '../utils/formatters';

const FeedSummary = ({ currentUser }) => {
    const [weeklySessionsCount, setWeeklySessionsCount] = useState(0);
    const [weeklyMinutes, setWeeklyMinutes] = useState(0);
    const [weeklyAverageFocusScore, setWeeklyAverageFocusScore] = useState('N/A');
    const [isLoadingSummary, setIsLoadingSummary] = useState(true);

    useEffect(() => {
        if (!currentUser || !currentUser.uid || !db) {
            setIsLoadingSummary(false);
            return;
        }

        setIsLoadingSummary(true);
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);

        const q = query(
            collection(db, studySessionsCollectionPath),
            where("userId", "==", currentUser.uid),
            where("createdAt", ">=", Timestamp.fromDate(oneWeekAgo))
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let sessionsThisWeek = 0;
            let durationThisWeekSeconds = 0;
            let totalFocusScore = 0;
            let sessionsWithFocusScore = 0;

            snapshot.forEach(doc => {
                const sessionData = doc.data();
                sessionsThisWeek++;
                durationThisWeekSeconds += (sessionData.duration || 0);
                if (typeof sessionData.focusScore === 'number') {
                    totalFocusScore += sessionData.focusScore;
                    sessionsWithFocusScore++;
                }
            });
            setWeeklySessionsCount(sessionsThisWeek);
            setWeeklyMinutes(formatDurationInMinutes(durationThisWeekSeconds));
            if (sessionsWithFocusScore > 0) {
                setWeeklyAverageFocusScore((totalFocusScore / sessionsWithFocusScore).toFixed(1));
            } else {
                setWeeklyAverageFocusScore('N/A');
            }
            setIsLoadingSummary(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    if (isLoadingSummary) {
        return (
            <div className="bg-gray-800 p-3 rounded-lg shadow-md mb-6 text-center">
                <Spinner />
                <p className="text-xs text-gray-400 mt-1">Loading weekly summary...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-3 rounded-lg shadow-md mb-6">
            <h3 className="text-md font-semibold text-indigo-400 mb-2">Your Week at a Glance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="text-center p-1">
                    <ListChecks className="mx-auto h-7 w-7 text-indigo-400 mb-1" />
                    <p className="text-xl font-bold text-gray-100">{weeklySessionsCount}</p>
                    <p className="text-xs text-gray-400">Sessions This Week</p>
                </div>
                <div className="text-center p-1">
                    <Clock className="mx-auto h-7 w-7 text-indigo-400 mb-1" />
                    <p className="text-xl font-bold text-gray-100">{weeklyMinutes}</p>
                    <p className="text-xs text-gray-400">Minutes Studied</p>
                </div>
                <div className="text-center p-1">
                    <Brain className="mx-auto h-7 w-7 text-indigo-400 mb-1" />
                    <p className="text-xl font-bold text-gray-100">{weeklyAverageFocusScore}</p>
                    <p className="text-xs text-gray-400">Avg. Focus Score</p>
                </div>
            </div>
        </div>
    );
};

export default FeedSummary;