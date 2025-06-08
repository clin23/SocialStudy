import React, { useState, useEffect, useMemo } from 'react';
import { addDoc, collection, doc, updateDoc, deleteDoc, onSnapshot, query, Timestamp } from 'firebase/firestore';
import { PlusCircle, Edit3, Trash2, CheckSquare, Square, FileText, XCircle, PlayCircle } from 'lucide-react';
import Modal from './Modal';
import Spinner from './Spinner';
import { db } from '../firebase/firebaseConfig';
import { getTodosCollectionPath } from '../firebase/paths';

const TodoList = ({ currentUser, isFullPage = false, setActiveTab, setInitialSessionData }) => {
    const [todos, setTodos] = useState([]);
    const [newTodoText, setNewTodoText] = useState('');
    const [isLoadingTodos, setIsLoadingTodos] = useState(true);
    const [error, setError] = useState('');

    const [editingTodoId, setEditingTodoId] = useState(null);
    const [currentDescription, setCurrentDescription] = useState('');
    const [currentDueDate, setCurrentDueDate] = useState('');
    const [currentDueTime, setCurrentDueTime] = useState('');
    const [currentLinksInput, setCurrentLinksInput] = useState('');
    const [currentLinks, setCurrentLinks] = useState([]);

    const todosCollectionRef = useMemo(() => {
        if (currentUser && currentUser.uid && db) {
            return collection(db, getTodosCollectionPath(currentUser.uid));
        }
        return null;
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser || !currentUser.uid || !db || !todosCollectionRef) {
            setTodos([]);
            setIsLoadingTodos(false);
            return;
        }

        setIsLoadingTodos(true);
        const q = query(todosCollectionRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let fetchedTodos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            fetchedTodos.sort((a,b) => (a.createdAt?.toDate() || 0) - (b.createdAt?.toDate() || 0));
            setTodos(fetchedTodos);
            setIsLoadingTodos(false);
            setError('');
        }, (err) => {
            console.error("Error fetching todos:", err);
            setError("Could not load to-do list.");
            setIsLoadingTodos(false);
        });

        return () => unsubscribe();
    }, [currentUser, todosCollectionRef]);

    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!newTodoText.trim() || !todosCollectionRef) return;
        try {
            await addDoc(todosCollectionRef, {
                text: newTodoText.trim(),
                description: "",
                completed: false,
                createdAt: Timestamp.now(),
                userId: currentUser.uid,
                dueDate: null,
                dueTime: "",
                links: []
            });
            setNewTodoText('');
        } catch (err) {
            console.error("Error adding todo:", err);
            setError("Failed to add task.");
        }
    };

    const handleToggleComplete = async (todoId, currentStatus) => {
        if (!todosCollectionRef) return;
        const todoDocRef = doc(db, getTodosCollectionPath(currentUser.uid), todoId);
        try {
            await updateDoc(todoDocRef, { completed: !currentStatus });
        } catch (err) {
            console.error("Error updating todo:", err);
            setError("Failed to update task status.");
        }
    };

    const handleDeleteTodo = async (todoId) => {
        if (!todosCollectionRef) return;
        const todoDocRef = doc(db, getTodosCollectionPath(currentUser.uid), todoId);
        try {
            await deleteDoc(todoDocRef);
            if (editingTodoId === todoId) {
                setEditingTodoId(null);
            }
        } catch (err) {
            console.error("Error deleting todo:", err);
            setError("Failed to delete task.");
        }
    };

    const handleOpenEditModal = (todo) => {
        setEditingTodoId(todo.id);
        setCurrentDescription(todo.description || '');
        setCurrentDueDate(todo.dueDate ? todo.dueDate.toDate().toISOString().split('T')[0] : '');
        setCurrentDueTime(todo.dueTime || '');
        setCurrentLinks(todo.links || []);
        setCurrentLinksInput('');
    };

    const handleSaveTaskDetails = async () => {
        if (!editingTodoId || !todosCollectionRef) return;
        const todoDocRef = doc(db, getTodosCollectionPath(currentUser.uid), editingTodoId);

        let newLinks = [...currentLinks];
        if (currentLinksInput.trim() && !newLinks.includes(currentLinksInput.trim())) {
            newLinks.push(currentLinksInput.trim());
        }

        try {
            await updateDoc(todoDocRef, {
                description: currentDescription.trim(),
                dueDate: currentDueDate ? Timestamp.fromDate(new Date(currentDueDate + "T00:00:00")) : null,
                dueTime: currentDueTime.trim(),
                links: newLinks
            });
        } catch (err) {
            console.error("Error saving task details:", err);
            setError("Failed to save task details.");
        }
    };

    const handleCloseAndSaveEditModal = async () => {
        if (editingTodoId) {
            await handleSaveTaskDetails();
        }
        setEditingTodoId(null);
        setCurrentDescription('');
        setCurrentDueDate('');
        setCurrentDueTime('');
        setCurrentLinksInput('');
        setCurrentLinks([]);
    };

    const handleStartSessionForTodo = (todo) => {
        if (setInitialSessionData && setActiveTab) {
            setInitialSessionData({
                title: todo.text,
                relatedTodoId: todo.id,
                recordingMode: 'todo',
            });
            setActiveTab('record');
            handleCloseAndSaveEditModal();
        }
    };

    const handleAddLinkToModal = () => {
        if (currentLinksInput.trim() && !currentLinks.includes(currentLinksInput.trim())) {
            setCurrentLinks(prev => [...prev, currentLinksInput.trim()]);
            setCurrentLinksInput('');
        }
    };

    const handleRemoveLinkFromModal = (linkToRemove) => {
        setCurrentLinks(prev => prev.filter(link => link !== linkToRemove));
    };

    return (
        <div className={`p-4 rounded-lg shadow-md h-full flex flex-col ${isFullPage ? 'bg-gray-800' : 'bg-gray-800'}`}>
            <h3 className={`text-xl font-semibold text-indigo-400 mb-3 ${isFullPage ? 'text-center text-2xl' : ''}`}>
                {isFullPage ? "To-Do" : "My Study To-Do List"}
            </h3>
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            <form onSubmit={handleAddTodo} className="flex mb-3">
                <input
                    type="text"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md shadow-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                    disabled={!newTodoText.trim()}
                >
                    <PlusCircle size={20} />
                </button>
            </form>

            {isLoadingTodos ? (
                <Spinner />
            ) : todos.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No tasks yet. Add some to get started!</p>
            ) : (
                <ul className="space-y-2 overflow-y-auto flex-grow pr-1">
                    {todos.map(todo => (
                        <li
                            key={todo.id}
                            className={`p-2.5 rounded-md transition-colors duration-150 ${todo.completed ? 'bg-gray-700' : 'bg-gray-600 hover:bg-gray-500'} cursor-pointer`}
                            onClick={(e) => {
                                if (!e.target.closest('.checkbox-area') && !e.target.closest('.action-buttons-container')) {
                                    handleOpenEditModal(todo);
                                }
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center flex-grow mr-2">
                                    <div
                                        className="checkbox-area p-1 mr-2 flex-shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleComplete(todo.id, todo.completed);
                                        }}
                                    >
                                        {todo.completed ? <CheckSquare size={20} className="text-green-400" /> : <Square size={20} className="text-gray-400" />}
                                    </div>
                                    <span className={`text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-gray-100'}`}>
                                        {todo.text}
                                    </span>
                                    {todo.description && (
                                        <FileText
                                            size={14}
                                            className="ml-2 text-gray-500 flex-shrink-0"
                                            title="Has description"
                                        />
                                    )}
                                </div>
                                <div
                                    className="action-buttons-container flex items-center flex-shrink-0 space-x-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => handleOpenEditModal(todo)}
                                        className="p-1 text-gray-400 hover:text-indigo-300"
                                        title={todo.description ? "Edit/View details" : "Add details"}
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTodo(todo.id)}
                                        className="p-1 text-red-500 hover:text-red-400"
                                        title="Delete task"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <Modal isOpen={!!editingTodoId} onClose={handleCloseAndSaveEditModal} title="Task Details">
                {editingTodoId && todos.find(t => t.id === editingTodoId) && (
                    <div className="space-y-4">
                        <h4 className="text-lg font-medium text-indigo-300">{todos.find(t => t.id === editingTodoId)?.text}</h4>
                        <div>
                            <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                            <textarea
                                id="taskDescription"
                                value={currentDescription}
                                onChange={(e) => setCurrentDescription(e.target.value)}
                                placeholder="Add a description..."
                                rows="3"
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="taskDueDate" className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    id="taskDueDate"
                                    value={currentDueDate}
                                    onChange={(e) => setCurrentDueDate(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="taskDueTime" className="block text-sm font-medium text-gray-300 mb-1">Due Time</label>
                                <input
                                    type="time"
                                    id="taskDueTime"
                                    value={currentDueTime}
                                    onChange={(e) => setCurrentDueTime(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="taskLinks" className="block text-sm font-medium text-gray-300 mb-1">Add Link</label>
                            <div className="flex">
                                <input
                                    type="url"
                                    id="taskLinks"
                                    value={currentLinksInput}
                                    onChange={(e) => setCurrentLinksInput(e.target.value)}
                                    placeholder="https://example.com"
                                    className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-md shadow-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                                />
                                <button type="button" onClick={handleAddLinkToModal} className="px-3 py-2 bg-indigo-500 text-white rounded-r-md hover:bg-indigo-600 text-sm"><PlusCircle size={18}/></button>
                            </div>
                            {currentLinks.length > 0 && (
                                <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
                                    <p className="text-xs text-gray-400">Attached links:</p>
                                    {currentLinks.map((link, index) => (
                                        <div key={index} className="flex items-center justify-between text-xs text-indigo-300 bg-gray-700 px-2 py-1 rounded">
                                            <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline truncate mr-2">{link}</a>
                                            <button onClick={() => handleRemoveLinkFromModal(link)} className="text-red-400 hover:text-red-300 flex-shrink-0"><XCircle size={14}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                            <button
                                onClick={() => handleStartSessionForTodo(todos.find(t => t.id === editingTodoId))}
                                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                            >
                                <PlayCircle size={16} className="mr-2"/> Start Session for this Task
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TodoList;