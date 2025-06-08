import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as Tone from 'tone';
import { addDoc, collection, doc, updateDoc, Timestamp, onSnapshot, query, where, setDoc } from 'firebase/firestore';
import { PlusCircle, XCircle, Trash2, Edit3, PlayCircle, PauseCircle, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import Modal from './Modal';
import Spinner from './Spinner';
import AnalogClock from './AnalogClock';
import { db } from '../firebase/firebaseConfig';
import { getTodosCollectionPath, studySessionsCollectionPath } from '../firebase/paths';
import { formatDuration } from '../utils/formatters';

const PREDEFINED_DISTRACTIONS = [
    { id: 'social_media', label: 'Social Media' },
    { id: 'messaging', label: 'Messaging' },
    { id: 'emails', label: 'Emails' },
    { id: 'loud_noises', label: 'Loud Noises' },
    { id: 'people', label: 'People' },
];

const RecordSession = ({ currentUser, setActiveTab, initialSessionData, setInitialSessionData }) => {
    // State variables
    const [sessionStage, setSessionStage] = useState('idle');
    const [recordingMode, setRecordingMode] = useState('custom');
    const DEFAULT_SUBJECT_CATEGORIES = [
        'Maths', 'English', 'Physics', 'History', 'Biology', 'Economics', 'Business Studies', 'Music'
    ];
    const [title, setTitle] = useState('');
    const [subjectCategories, setSubjectCategories] = useState(DEFAULT_SUBJECT_CATEGORIES);
    const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
    const [customCategoryValue, setCustomCategoryValue] = useState('');
    const [showDeleteCategoryConfirmModal, setShowDeleteCategoryConfirmModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const DEFAULT_SESSION_TYPES = [
        'Exam Practice', 'Reading', 'Writing', 'Reviewing', 'Free Session', 'Quiz', 'Task Work'
    ];
    const [sessionType, setSessionType] = useState('');
    const [availableSessionTypes, setAvailableSessionTypes] = useState(DEFAULT_SESSION_TYPES);
    const [showCustomSessionTypeInput, setShowCustomSessionTypeInput] = useState(false);
    const [customSessionTypeValue, setCustomSessionTypeValue] = useState('');
    const [showDeleteSessionTypeConfirmModal, setShowDeleteSessionTypeConfirmModal] = useState(false);
    const [sessionTypeToDelete, setSessionTypeToDelete] = useState(null);

    const [userTodos, setUserTodos] = useState([]);
    const [isLoadingTodos, setIsLoadingTodos] = useState(false);
    const [selectedTodoId, setSelectedTodoId] = useState(null);

    const [sessionPlan, setSessionPlan] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timerIntervalId, setTimerIntervalId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [focusScore, setFocusScore] = useState(5);
    const [selectedDistractions, setSelectedDistractions] = useState([]);
    const [customDistractionInput, setCustomDistractionInput] = useState('');
    const [showDistractionsDropdown, setShowDistractionsDropdown] = useState(false);

    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmSessionType, setConfirmSessionType] = useState('');
    const [confirmSessionPlan, setConfirmSessionPlan] = useState('');
    const [sessionReflection, setSessionReflection] = useState('');
    const [isSessionPlanEditable, setIsSessionPlanEditable] = useState(false);
    const [showEditPlanConfirmModal, setShowEditPlanConfirmModal] = useState(false);

    const [showPomodoroModal, setShowPomodoroModal] = useState(false);
    const [isPomodoroActive, setIsPomodoroActive] = useState(false);
    const [pomodoroMode, setPomodoroMode] = useState('work');
    const [pomodoroWorkDuration, setPomodoroWorkDuration] = useState(25 * 60);
    const [pomodoroBreakDuration, setPomodoroBreakDuration] = useState(5 * 60);
    const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(25 * 60);
    const [pomodoroTimerIntervalId, setPomodoroTimerIntervalId] = useState(null);
    const [customWorkMinutes, setCustomWorkMinutes] = useState(25);
    const [customBreakMinutes, setCustomBreakMinutes] = useState(5);
    const [sessionWasPomodoro, setSessionWasPomodoro] = useState(false);

    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);

    const synth = useRef(null);

    useEffect(() => {
        if (initialSessionData) {
            setRecordingMode(initialSessionData.recordingMode || 'custom');
            setTitle(initialSessionData.title || '');
            setSelectedTodoId(initialSessionData.relatedTodoId || null);
            setMessage(`Ready to start session for task: ${initialSessionData.title}`);
            setInitialSessionData(null); // Clear after using
        }
    }, [initialSessionData, setInitialSessionData]);

    useEffect(() => {
        if (typeof Tone !== 'undefined' && !synth.current) {
            synth.current = new Tone.Synth({
                oscillator: { type: 'sine' },
                envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
            }).toDestination();
        }
    }, []);

    useEffect(() => {
        if (recordingMode === 'todo' && currentUser && currentUser.uid && db) {
            setIsLoadingTodos(true);
            const todosPath = getTodosCollectionPath(currentUser.uid);
            const q = query(collection(db, todosPath), where("completed", "==", false));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedTodos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                fetchedTodos.sort((a,b) => (a.createdAt?.toDate() || 0) - (b.createdAt?.toDate() || 0));
                setUserTodos(fetchedTodos);
                setIsLoadingTodos(false);
            }, (error) => {
                console.error("Error fetching user todos:", error);
                setMessage("Error fetching to-do list.");
                setIsLoadingTodos(false);
            });
            return () => unsubscribe();
        } else {
            setUserTodos([]);
        }
    }, [recordingMode, currentUser]);

    const playSound = useCallback(() => {
        if (synth.current && Tone.context.state === 'running') {
            try {
                synth.current.triggerAttackRelease("C5", "8n", Tone.now());
                synth.current.triggerAttackRelease("G5", "8n", Tone.now() + 0.2);
            } catch (e) {
                console.warn("Error playing sound:", e);
            }
        } else {
            console.warn("Tone.js audio context not running or synth not initialized. Sound not played.");
        }
    }, []);

    useEffect(() => {
        let intervalId = null;
        if (sessionStage === 'recording' && startTime) {
            intervalId = setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000);
            setTimerIntervalId(intervalId);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
            setTimerIntervalId(null);
        };
    }, [sessionStage, startTime]);

    useEffect(() => {
        let intervalId = null;
        if (isPomodoroActive && sessionStage === 'recording') {
            intervalId = setInterval(() => {
                setPomodoroTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        playSound();
                        if (pomodoroMode === 'work') {
                            setPomodoroMode('break');
                            return pomodoroBreakDuration;
                        } else {
                            setPomodoroMode('work');
                            return pomodoroWorkDuration;
                        }
                    }
                    return prevTime - 1;
                });
            }, 1000);
            setPomodoroTimerIntervalId(intervalId);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
            setPomodoroTimerIntervalId(null);
        };
    }, [isPomodoroActive, sessionStage, pomodoroMode, pomodoroWorkDuration, pomodoroBreakDuration, playSound]);

    // --- Handler Functions ---

    const handleCategoryChange = (e) => {
        const selectedValue = e.target.value;
        if (selectedValue === "__add_new__") {
            setShowCustomCategoryInput(true);
            setTitle('');
        } else {
            setTitle(selectedValue);
            setShowCustomCategoryInput(false);
            setCustomCategoryValue('');
        }
        setMessage('');
    };

    const handleAddCustomCategory = () => {
        const trimmedValue = customCategoryValue.trim();
        if (!trimmedValue) {
            setMessage("Custom subject name cannot be empty.");
            return;
        }
        if (!subjectCategories.some(category => category.toLowerCase() === trimmedValue.toLowerCase())) {
            setSubjectCategories(prevCategories => [...prevCategories, trimmedValue]);
        }
        setTitle(trimmedValue);
        setShowCustomCategoryInput(false);
        setCustomCategoryValue('');
        setMessage('');
    };

    const handleCancelCustomCategory = () => {
        setShowCustomCategoryInput(false);
        setCustomCategoryValue('');
        setMessage('');
    };

    const handleDeleteCategoryClick = () => {
        if (!title || title === "__add_new__") {
            setMessage("Please select a subject to delete.");
            return;
        }
        setCategoryToDelete(title);
        setShowDeleteCategoryConfirmModal(true);
    };

    const handleConfirmDeleteCategory = () => {
        if (!categoryToDelete) return;
        setSubjectCategories(prevCategories => prevCategories.filter(cat => cat !== categoryToDelete));
        if (title === categoryToDelete) {
            setTitle('');
        }
        setCategoryToDelete(null);
        setShowDeleteCategoryConfirmModal(false);
        setMessage(`Subject "${categoryToDelete}" deleted.`);
    };

    const handleSessionTypeChange = (e) => {
        const selectedValue = e.target.value;
        if (selectedValue === "__add_new_session_type__") {
            setShowCustomSessionTypeInput(true);
            setSessionType('');
        } else {
            setSessionType(selectedValue);
            setShowCustomSessionTypeInput(false);
            setCustomSessionTypeValue('');
        }
        setMessage('');
    };

    const handleAddCustomSessionType = () => {
        const trimmedValue = customSessionTypeValue.trim();
        if (!trimmedValue) {
            setMessage("Custom session type name cannot be empty.");
            return;
        }
        if (!availableSessionTypes.some(type => type.toLowerCase() === trimmedValue.toLowerCase())) {
            setAvailableSessionTypes(prevTypes => [...prevTypes, trimmedValue]);
        }
        setSessionType(trimmedValue);
        setShowCustomSessionTypeInput(false);
        setCustomSessionTypeValue('');
        setMessage('');
    };

    const handleCancelCustomSessionType = () => {
        setShowCustomSessionTypeInput(false);
        setCustomSessionTypeValue('');
        setMessage('');
    };

    const handleDeleteSessionTypeClick = () => {
        if (!sessionType || sessionType === "__add_new_session_type__") {
            setMessage("Please select a session type to delete.");
            return;
        }
        setSessionTypeToDelete(sessionType);
        setShowDeleteSessionTypeConfirmModal(true);
    };

    const handleConfirmDeleteSessionType = () => {
        if (!sessionTypeToDelete) return;
        setAvailableSessionTypes(prevTypes => prevTypes.filter(type => type !== sessionTypeToDelete));
        if (sessionType === sessionTypeToDelete) {
            setSessionType('');
        }
        setSessionTypeToDelete(null);
        setShowDeleteSessionTypeConfirmModal(false);
        setMessage(`Session type "${sessionTypeToDelete}" deleted.`);
    };

    const handleSelectTodo = (todo) => {
        setTitle(todo.text);
        setSelectedTodoId(todo.id);
        setMessage(`Selected task: ${todo.text}`);
    };

    const handleStartRecording = (isPomodoro = false, workDur, breakDur) => {
        if (!title.trim()) {
            setMessage("Please select a subject or a to-do task.");
            return;
        }
        if (!sessionType.trim()) {
            setMessage("Please select or add a session type.");
            return;
        }

        if (typeof Tone !== 'undefined' && Tone.context.state !== 'running') {
            Tone.start().then(() => {
                playSound();
            }).catch(e => console.error("Error starting AudioContext:", e));
        } else if (typeof Tone !== 'undefined') {
            playSound();
        }

        setStartTime(Date.now());
        setSessionStage('recording');
        setElapsedTime(0);
        setSessionWasPomodoro(isPomodoro);

        if (isPomodoro) {
            setIsPomodoroActive(true);
            setPomodoroMode('work');
            setPomodoroWorkDuration(workDur);
            setPomodoroBreakDuration(breakDur);
            setPomodoroTimeLeft(workDur);
        } else {
            setIsPomodoroActive(false);
        }
    };

    const handleStopRecording = () => {
        setSessionStage('confirming');
        setConfirmTitle(title);
        setConfirmSessionType(sessionType);
        setConfirmSessionPlan(sessionPlan);
        setIsSessionPlanEditable(false);
        setSessionReflection('');
        setIsPomodoroActive(false);
        if (pomodoroTimerIntervalId) clearInterval(pomodoroTimerIntervalId);
    };

    const handleStartPomodoroFromModal = () => {
        if (!title.trim()) {
            setMessage("Please set a session subject or select a to-do task before starting Pomodoro.");
            setShowPomodoroModal(false);
            return;
        }
        if (!sessionType.trim()) {
            setMessage("Please set a session type before starting Pomodoro.");
            setShowPomodoroModal(false);
            return;
        }
        const workSecs = customWorkMinutes * 60;
        const breakSecs = customBreakMinutes * 60;
        handleStartRecording(true, workSecs, breakSecs);
        setShowPomodoroModal(false);
    };

    const handleSetDefaultPomodoro = () => {
        setCustomWorkMinutes(25);
        setCustomBreakMinutes(5);
    };

    const handleSaveSession = async () => {
        setIsLoading(true);
        setMessage('');

        if (!currentUser || !currentUser.uid) {
            setMessage("Error: User not identified. Cannot save session.");
            setIsLoading(false);
            return;
        }
        if (!confirmTitle.trim()) {
            setMessage("Subject cannot be empty.");
            setIsLoading(false);
            return;
        }
        if (!confirmSessionType.trim()) {
            setMessage("Session Type cannot be empty.");
            setIsLoading(false);
            return;
        }
        if (!db) {
            setMessage("Error: Database connection not available.");
            setIsLoading(false);
            return;
        }

        let mediaData = {};
        if (mediaFile) {
            mediaData = {
                mediaName: mediaFile.name,
                mediaType: mediaFile.type,
            };
        }

        const sessionData = {
            userId: currentUser.uid,
            userDisplayName: currentUser.displayName || "Anonymous User",
            userPhotoURL: currentUser.photoURL || `https://placehold.co/40x40/374151/E5E7EB?text=${(currentUser.displayName || "A").charAt(0).toUpperCase()}`,
            title: confirmTitle,
            sessionType: confirmSessionType,
            sessionPlan: confirmSessionPlan,
            sessionReflection: sessionReflection,
            startTime: Timestamp.fromDate(new Date(startTime)),
            endTime: Timestamp.now(),
            duration: elapsedTime,
            focusScore: parseInt(focusScore, 10),
            distractions: selectedDistractions,
            isPomodoro: sessionWasPomodoro,
            relatedTodoId: recordingMode === 'todo' ? selectedTodoId : null,
            ...mediaData,
            createdAt: Timestamp.now(),
            likesCount: 0,
            commentsCount: 0,
        };

        try {
            await addDoc(collection(db, studySessionsCollectionPath), sessionData);

            if (recordingMode === 'todo' && selectedTodoId) {
                const todoDocRef = doc(db, getTodosCollectionPath(currentUser.uid), selectedTodoId);
                await updateDoc(todoDocRef, { completed: true });
            }

            setMessage("Study session posted successfully!");
            setTitle('');
            setSessionType('');
            setShowCustomCategoryInput(false);
            setCustomCategoryValue('');
            setShowCustomSessionTypeInput(false);
            setCustomSessionTypeValue('');
            setSessionPlan('');
            setConfirmTitle('');
            setConfirmSessionType('');
            setConfirmSessionPlan('');
            setSessionReflection('');
            setElapsedTime(0);
            setStartTime(null);
            setFocusScore(5);
            setSelectedDistractions([]);
            setCustomDistractionInput('');
            setShowDistractionsDropdown(false);
            setIsSessionPlanEditable(false);
            setSessionWasPomodoro(false);
            setMediaFile(null);
            setMediaPreviewUrl(null);
            setSessionStage('idle');
            setSelectedTodoId(null);
            setRecordingMode('custom');
            if (setActiveTab) {
                setActiveTab('you');
            }
        } catch (error) {
            console.error("Error saving session:", error);
            setMessage(`Error saving session: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDiscardSession = () => {
        setTitle('');
        setSessionType('');
        setShowCustomCategoryInput(false);
        setCustomCategoryValue('');
        setShowCustomSessionTypeInput(false);
        setCustomSessionTypeValue('');
        setSessionPlan('');
        setConfirmTitle('');
        setConfirmSessionType('');
        setConfirmSessionPlan('');
        setSessionReflection('');
        setElapsedTime(0);
        setStartTime(null);
        setFocusScore(5);
        setSelectedDistractions([]);
        setCustomDistractionInput('');
        setShowDistractionsDropdown(false);
        setIsSessionPlanEditable(false);
        setSessionWasPomodoro(false);
        setMediaFile(null);
        setMediaPreviewUrl(null);
        setSessionStage('idle');
        setMessage('');
        setIsPomodoroActive(false);
        setSelectedTodoId(null);
        if (pomodoroTimerIntervalId) clearInterval(pomodoroTimerIntervalId);
        if (timerIntervalId) clearInterval(timerIntervalId);
    };

    const togglePredefinedDistraction = (distractionLabel) => {
        setSelectedDistractions(prev =>
            prev.includes(distractionLabel)
                ? prev.filter(d => d !== distractionLabel)
                : [...prev, distractionLabel]
        );
    };

    const handleAddCustomDistraction = () => {
        const trimmedCustom = customDistractionInput.trim();
        if (trimmedCustom && !selectedDistractions.includes(trimmedCustom)) {
            setSelectedDistractions(prev => [...prev, trimmedCustom]);
        }
        setCustomDistractionInput('');
    };

    const removeDistraction = (distractionToRemove) => {
        setSelectedDistractions(prev => prev.filter(d => d !== distractionToRemove));
    };

    const openEditPlanModal = () => setShowEditPlanConfirmModal(true);
    const closeEditPlanModal = () => setShowEditPlanConfirmModal(false);
    const confirmEditPlan = () => {
        setIsSessionPlanEditable(true);
        closeEditPlanModal();
    };

    const handleMediaChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setMediaFile(file);
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                setMediaPreviewUrl(URL.createObjectURL(file));
            } else {
                setMediaPreviewUrl(null);
            }
        } else {
            setMediaFile(null);
            setMediaPreviewUrl(null);
        }
    };

    if (sessionStage === 'confirming') {
        // ... (keep the confirming stage code from previous message) ...
        // (You can keep the confirming stage code from the previous message here)
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-gray-100">Record Study Session</h2>
            {message && <p className={`p-3 rounded-md ${message.startsWith("Error") ? 'bg-red-700 text-red-100' : message.includes("deleted") || message.includes("Selected task:") ? 'bg-blue-700 text-blue-100' : 'bg-green-700 text-green-100'}`}>{message}</p>}

            <div className="md:flex md:space-x-6 space-y-6 md:space-y-0">
                <div className="bg-gray-800 p-4 rounded-lg shadow-md space-y-4 md:w-1/2">
                    <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg">
                        <button
                            onClick={() => { setRecordingMode('custom'); setTitle(''); setSelectedTodoId(null); setMessage(''); }}
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${recordingMode === 'custom' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                        >
                            Custom Setup
                        </button>
                        <button
                            onClick={() => { setRecordingMode('todo'); setTitle(''); setSelectedTodoId(null); setMessage(''); }}
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${recordingMode === 'todo' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                        >
                            From To-Do
                        </button>
                    </div>

                    {recordingMode === 'custom' && (
                        <>
                            <div>
                                <label htmlFor="sessionSubjectDropdown" className="block text-sm font-medium text-gray-300">
                                    Subject
                                </label>
                                <div className="flex items-center space-x-2 mt-1">
                                    <select
                                        id="sessionSubjectDropdown"
                                        value={showCustomCategoryInput ? "__add_new__" : title}
                                        onChange={handleCategoryChange}
                                        className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        disabled={sessionStage === 'recording' || isLoading}
                                    >
                                        <option value="" disabled>
                                            Select a subject
                                        </option>
                                        {subjectCategories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                        <option value="__add_new__" className="text-indigo-400 font-semibold">
                                            + Add New Subject...
                                        </option>
                                    </select>
                                    {title && title !== "__add_new__" && !showCustomCategoryInput && (
                                        <button
                                            type="button"
                                            onClick={handleDeleteCategoryClick}
                                            className="p-2 text-red-400 hover:text-red-300"
                                            title={`Delete subject: ${title}`}
                                            disabled={sessionStage === 'recording' || isLoading}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                {showCustomCategoryInput && (
                                    <div className="mt-3 space-y-2">
                                        <input
                                            type="text"
                                            value={customCategoryValue}
                                            onChange={(e) => setCustomCategoryValue(e.target.value)}
                                            placeholder="Enter new subject name"
                                            className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                                            disabled={isLoading}
                                        />
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={handleAddCustomCategory}
                                                className="px-3 py-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 text-xs font-medium"
                                                disabled={isLoading || !customCategoryValue.trim()}
                                            >
                                                Add Subject
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancelCustomCategory}
                                                className="px-3 py-1.5 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 text-xs font-medium"
                                                disabled={isLoading}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {recordingMode === 'todo' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Select a To-Do Task</label>
                            {isLoadingTodos ? <Spinner/> : userTodos.length === 0 ? (
                                <p className="text-xs text-gray-400">No incomplete tasks. Add some in the "To-Do List" tab!</p>
                            ) : (
                                <div className="max-h-32 overflow-y-auto space-y-1 pr-1 border border-gray-700 rounded-md">
                                    {userTodos.map(todo => (
                                        <button
                                            key={todo.id}
                                            onClick={() => handleSelectTodo(todo)}
                                            className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${selectedTodoId === todo.id ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-gray-200 hover:bg-gray-500'}`}
                                        >
                                            {todo.text}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-4">
                        <label htmlFor="sessionTypeDropdown" className="block text-sm font-medium text-gray-300">
                            Session Type
                        </label>
                        <div className="flex items-center space-x-2 mt-1">
                            <select
                                id="sessionTypeDropdown"
                                value={showCustomSessionTypeInput ? "__add_new_session_type__" : sessionType}
                                onChange={handleSessionTypeChange}
                                className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                disabled={sessionStage === 'recording' || isLoading}
                            >
                                <option value="" disabled>
                                    Select a session type
                                </option>
                                {availableSessionTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                                <option value="__add_new_session_type__" className="text-indigo-400 font-semibold">
                                    + Add New Session Type...
                                </option>
                            </select>
                            {sessionType && sessionType !== "__add_new_session_type__" && !showCustomSessionTypeInput && (
                                <button
                                    type="button"
                                    onClick={handleDeleteSessionTypeClick}
                                    className="p-2 text-red-400 hover:text-red-300"
                                    title={`Delete session type: ${sessionType}`}
                                    disabled={sessionStage === 'recording' || isLoading}
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>

                        {showCustomSessionTypeInput && (
                            <div className="mt-3 space-y-2">
                                <input
                                    type="text"
                                    value={customSessionTypeValue}
                                    onChange={(e) => setCustomSessionTypeValue(e.target.value)}
                                    placeholder="Enter new session type"
                                    className="block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                                    disabled={isLoading}
                                />
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={handleAddCustomSessionType}
                                        className="px-3 py-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 text-xs font-medium"
                                        disabled={isLoading || !customSessionTypeValue.trim()}
                                    >
                                        Add Type
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelCustomSessionType}
                                        className="px-3 py-1.5 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 text-xs font-medium"
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="sessionPlan" className="block text-sm font-medium text-gray-300">Session Plan</label>
                        <textarea
                            id="sessionPlan"
                            value={sessionPlan}
                            onChange={(e) => setSessionPlan(e.target.value)}
                            rows="5"
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                            placeholder="What do you plan to achieve in this session? (e.g., specific topics, exercises)"
                            disabled={sessionStage === 'recording' || isLoading}
                        />
                    </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg shadow-md text-center space-y-3 md:w-1/2 flex flex-col justify-center items-center">
                    <AnalogClock
                        timeInSeconds={isPomodoroActive ? pomodoroTimeLeft : elapsedTime}
                        isPomodoroCountdown={isPomodoroActive}
                        pomodoroSegmentTotalSeconds={isPomodoroActive ? (pomodoroMode === 'work' ? pomodoroWorkDuration : pomodoroBreakDuration) : 60*60}
                    />
                    <div className="text-5xl font-bold text-indigo-400">
                        {isPomodoroActive ? `${pomodoroMode === 'work' ? 'Focus:' : 'Break:'} ${formatDuration(pomodoroTimeLeft)}` : formatDuration(elapsedTime)}
                    </div>
                    {isPomodoroActive && sessionStage === 'recording' && <p className="text-xs text-gray-400 -mt-2">Overall: {formatDuration(elapsedTime)}</p>}

                    {sessionStage === 'idle' && (
                        <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full pt-2">
                            <button
                                onClick={() => handleStartRecording()}
                                disabled={isLoading || !title.trim() || !sessionType.trim()}
                                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 disabled:bg-gray-500"
                            >
                                <PlayCircle className="mr-2 h-5 w-5" /> Start
                            </button>
                            <button
                                onClick={() => setShowPomodoroModal(true)}
                                disabled={isLoading || !title.trim() || !sessionType.trim()}
                                className="w-full sm:w-auto inline-flex items-center justify-center p-2.5 border border-indigo-500 text-base font-medium rounded-md shadow-sm text-indigo-400 hover:bg-indigo-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50"
                                title="Pomodoro Timer"
                            >
                                <Zap className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                    {sessionStage === 'recording' && (
                        <button
                            onClick={handleStopRecording}
                            disabled={isLoading}
                            className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 disabled:bg-gray-500"
                        >
                            {isLoading ? <Spinner /> : <><PauseCircle className="mr-2 h-5 w-5" /> Stop Recording</>}
                        </button>
                    )}
                </div>
            </div>
            <Modal isOpen={showPomodoroModal} onClose={() => setShowPomodoroModal(false)} title="Setup Pomodoro Timer" noOverlayClose={true}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="workDuration" className="block text-sm font-medium text-gray-300">Work Duration (minutes)</label>
                        <input
                            type="number"
                            id="workDuration"
                            value={customWorkMinutes}
                            onChange={(e) => setCustomWorkMinutes(parseInt(e.target.value, 10))}
                            min="1"
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="breakDuration" className="block text-sm font-medium text-gray-300">Break Duration (minutes)</label>
                        <input
                            type="number"
                            id="breakDuration"
                            value={customBreakMinutes}
                            onChange={(e) => setCustomBreakMinutes(parseInt(e.target.value, 10))}
                            min="1"
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <button
                        onClick={handleSetDefaultPomodoro}
                        className="w-full text-sm text-indigo-400 hover:text-indigo-300 py-1"
                    >
                        Use Default (25 work / 5 break)
                    </button>
                    {message && (!title.trim() || !sessionType.trim()) && <p className="text-red-400 text-sm">{message}</p>}
                    <button
                        onClick={handleStartPomodoroFromModal}
                        disabled={!title.trim() || !sessionType.trim()}
                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-indigo-400"
                    >
                        <PlayCircle className="mr-2 h-5 w-5" /> Start Pomodoro Session
                    </button>
                </div>
            </Modal>
            <Modal
                isOpen={showDeleteCategoryConfirmModal}
                onClose={() => setShowDeleteCategoryConfirmModal(false)}
                title="Delete Subject?"
            >
                <p className="text-sm text-gray-300 mb-4">
                    Are you sure you want to delete the subject: <strong className="text-indigo-400">{categoryToDelete}</strong>?
                    This action cannot be undone for the current session.
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={() => setShowDeleteCategoryConfirmModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-600 rounded-md hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmDeleteCategory}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                        Yes, Delete
                    </button>
                </div>
            </Modal>
            <Modal
                isOpen={showDeleteSessionTypeConfirmModal}
                onClose={() => setShowDeleteSessionTypeConfirmModal(false)}
                title="Delete Session Type?"
            >
                <p className="text-sm text-gray-300 mb-4">
                    Are you sure you want to delete the session type: <strong className="text-indigo-400">{sessionTypeToDelete}</strong>?
                    This action cannot be undone for the current session.
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={() => setShowDeleteSessionTypeConfirmModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-600 rounded-md hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmDeleteSessionType}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                        Yes, Delete
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default RecordSession;
