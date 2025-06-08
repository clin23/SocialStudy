import React from 'react';

const Modal = ({ isOpen, onClose, title, children, fullHeight = false, noOverlayClose = false }) => {
    if (!isOpen) return null;
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            onClick={noOverlayClose ? undefined : onClose}
        >
            <div
                className={`bg-gray-800 rounded-lg shadow-xl w-full ${fullHeight ? 'max-w-2xl h-[90vh] overflow-y-auto' : 'max-w-md'} p-6 transform transition-all`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-800 py-2 z-10">
                    <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200 text-2xl leading-none">
                        &times;
                    </button>
                </div>
                <div className={fullHeight ? 'overflow-y-auto' : ''}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;