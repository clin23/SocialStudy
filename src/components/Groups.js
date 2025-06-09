import React from "react";

const Groups = () => (
  <div className="min-h-full">
    <h2 className="text-2xl font-semibold text-gray-100 mb-4">Study Groups</h2>
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-indigo-400 mb-2">
        Welcome to Groups!
      </h3>
      <p className="text-gray-300 text-sm">
        This feature is currently under development. Soon you&apos;ll be able
        to:
      </p>
      <ul className="list-disc list-inside text-gray-400 mt-2 space-y-1 text-sm">
        <li>Create new study groups for specific topics or goals.</li>
        <li>Discover and join existing groups.</li>
        <li>Share resources and chat with group members.</li>
        <li>Participate in group-specific study sessions.</li>
      </ul>
      <p className="mt-3 text-gray-300 text-sm">Stay tuned for updates!</p>
    </div>
    <div className="mt-4">
      <button
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-3 rounded-lg shadow-md transition-colors disabled:opacity-50 text-sm"
        disabled
      >
        Create New Group (Coming Soon)
      </button>
    </div>
  </div>
);

export default Groups;
