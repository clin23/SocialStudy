import React, { useState, useEffect, useMemo } from 'react';
import Spinner from './Spinner';
import { db } from '../firebase/firebaseConfig';
import { getTodosCollectionPath } from '../firebase/paths';
import { collection, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from './Modal';

const CalendarView = ({ currentUser, setActiveTab, setInitialSessionData }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [todos, setTodos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [newTaskText, setNewTaskText] = useState("");

    const todosCollectionRef = useMemo(() => {
        if (currentUser && currentUser.uid && db) {
            return collection(db, getTodosCollectionPath(currentUser.uid));
        }
        return null;
    }, [currentUser]);

    useEffect(() => {
        if (!todosCollectionRef) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const unsubscribe = onSnapshot(todosCollectionRef, (snapshot) => {
            const fetchedTodos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                dueDate: doc.data().dueDate?.toDate()
            }));
            setTodos(fetchedTodos);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [todosCollectionRef]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDayClick = (day) => {
        setSelectedDate(day);
        setShowAddModal(true);
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskText.trim() || !selectedDate || !todosCollectionRef) return;
        try {
            await addDoc(todosCollectionRef, {
                text: newTaskText.trim(),
                description: "",
                completed: false,
                createdAt: Timestamp.now(),
                userId: currentUser.uid,
                dueDate: Timestamp.fromDate(selectedDate),
                dueTime: "",
                links: []
            });
            setNewTaskText('');
            setShowAddModal(false);
            setSelectedDate(null);
        } catch (err) {
            // handle error
        }
    };

    const renderHeader = () => {
        const dateFormat = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' });
        return (
            <div className="flex items-center justify-between py-2 px-4 bg-gray-700 rounded-t-lg">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-600">
                    <ChevronLeft className="h-6 w-6 text-gray-300" />
                </button>
                <h2 className="text-xl font-semibold text-indigo-300">
                    {dateFormat.format(currentDate)}
                </h2>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-600">
                    <ChevronRight className="h-6 w-6 text-gray-300" />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-400 border-b border-gray-600">
                {days.map(day => (
                    <div key={day} className="py-2">{day}</div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDate = new Date(monthStart);
        startDate.setDate(startDate.getDate() - monthStart.getDay());
        const endDate = new Date(monthEnd);
        endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

        const rows = [];
        let days = [];
        let day = new Date(startDate);
        const today = new Date();
        today.setHours(0,0,0,0);

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = new Date(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = day.getTime() === today.getTime();

                const tasksForDay = todos.filter(todo =>
                    todo.dueDate &&
                    todo.dueDate.getFullYear() === cloneDay.getFullYear() &&
                    todo.dueDate.getMonth() === cloneDay.getMonth() &&
                    todo.dueDate.getDate() === cloneDay.getDate()
                );

                days.push(
                    <div
                        key={day}
                        className={`relative h-24 sm:h-28 p-1.5 border-b border-r border-gray-700 overflow-hidden flex flex-col
                            ${isCurrentMonth ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-900 text-gray-600 hover:bg-gray-800'} 
                            transition-colors duration-150 cursor-pointer group`}
                        onClick={() => handleDayClick(cloneDay)}
                    >
                        <span className={`text-xs font-semibold ${isToday ? 'bg-indigo-500 text-white rounded-full h-5 w-5 flex items-center justify-center' : ''}`}>
                            {day.getDate()}
                        </span>
                        <div className="mt-1 flex-grow overflow-y-auto text-left pr-1">
                            {tasksForDay.map(task => (
                                <div key={task.id} className={`text-xs px-1 py-0.5 mb-1 rounded-md truncate ${task.completed ? 'bg-green-800 text-green-300 line-through' : 'bg-indigo-800 text-indigo-200'}`}>
                                    {task.text}
                                </div>
                            ))}
                        </div>
                        <button className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-indigo-600 rounded-full hover:bg-indigo-500">
                            <PlusCircle size={16} className="text-white"/>
                        </button>
                    </div>
                );
                day.setDate(day.getDate() + 1);
            }
            rows.push(
                <div key={day} className="grid grid-cols-7">
                    {days}
                </div>
            );
            days = [];
        }

        return <div>{rows}</div>;
    };

    return (
        <div className="min-h-full">
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">My Calendar</h2>
            <div className="bg-gray-800 rounded-lg shadow-lg">
                {renderHeader()}
                {renderDays()}
                {isLoading ? <div className="p-8"><Spinner /></div> : renderCells()}
            </div>
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={`Add Task for ${selectedDate?.toLocaleDateString()}`}>
                <form onSubmit={handleAddTask} className="space-y-4">
                    <div>
                        <label htmlFor="newTask" className="block text-sm font-medium text-gray-300">Task</label>
                        <input
                            type="text"
                            id="newTask"
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
                            placeholder="e.g., Finish Physics chapter 5"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-600 rounded-md hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Add Task</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CalendarView;