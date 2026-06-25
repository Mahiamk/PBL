import React from 'react';
import Chat from '../../Chat';

const MessageManager = ({ selectedId }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Messages</h2>
      <Chat preSelectedUser={selectedId ? parseInt(selectedId) : null} />
    </div>
  );
};

export default MessageManager;