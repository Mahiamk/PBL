import React from 'react';
import Chat from '../../Chat';

const MessageManager = ({ selectedId }) => {
  return (
    <div className="h-[calc(100vh-140px)] min-h-[560px] w-full flex flex-col overflow-hidden animate-fade-in">
      <Chat preSelectedUser={selectedId ? parseInt(selectedId) : null} />
    </div>
  );
};

export default MessageManager;