import React, { useState, useEffect, useRef } from 'react';
import { fetchConversations, fetchChatHistory, sendMessage, markMessagesAsRead, uploadChatAttachment } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Send, User, MessageSquare, Check, CheckCheck, Paperclip, Mic, X, FileText, Play, Pause, Reply } from 'lucide-react';

const Chat = ({ preSelectedUser = null }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [attachment, setAttachment] = useState(null); // { url, type, name, file }
    const [replyingTo, setReplyingTo] = useState(null); // Message object being replied to
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [viewingImage, setViewingImage] = useState(null); // Full screen image view
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const fileInputRef = useRef(null);
    const timerIntervalRef = useRef(null);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:8000${path}`;
    };

    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Initial Fetch: Conversations
    useEffect(() => {
        if(user) {
            fetchConversations().then(data => {
                setConversations(data);
                // If we have a pre-selected user object
                if (preSelectedUser) {
                    // Check if they are already in the list
                    const existing = data.find(u => u.id === preSelectedUser.id);
                    if (existing) {
                        setSelectedUser(existing);
                    } else {
                        // New conversation! Set them as selected manually
                        // Ensure the object has { id, full_name, role }
                        setSelectedUser(preSelectedUser);
                    }
                }
            }).catch(console.error);
        }
    }, [user, preSelectedUser]);

    // WebSocket Connection
    useEffect(() => {
        if (!user) return;
        // If we already have a connection, don't reconnect just because selectedUser changed
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        // Adjust port: Frontend is 5173, Backend is 8000
        const wsUrl = `ws://localhost:8000/api/messages/ws?token=${user.token}`;
        
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
             console.log("WebSocket Connected");
             setIsConnected(true);
        };

        // Note: onmessage is overridden by the specialized effect below
        
        socket.onclose = () => {
            setIsConnected(false);
            wsRef.current = null;
        };
        socket.onerror = (err) => console.error("WebSocket Error:", err);

        return () => {
            // Only close if component is unmounting OR user changed
            // We do NOT want to close just because selectedUser changed
            if (socket.readyState === 1) socket.close();
            wsRef.current = null;
        };
    }, [user]); // Removed selectedUser dependency

    // Keep ref updated
    const selectedUserRef = useRef(selectedUser);
    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    // Handle Incoming Messages
    useEffect(() => {
        if (!wsRef.current) return;
        
        // We set the onmessage handler here so it always has access to the latest selectedUser via Ref
        wsRef.current.onmessage = (event) => {
             const data = JSON.parse(event.data);
             const currentSelected = selectedUserRef.current;
             
             if (data.type === 'read_receipt') {
                 if (currentSelected && data.reader_id === currentSelected.id) {
                     setMessages(prev => prev.map(msg => 
                        msg.sender_id === user.userId ? { ...msg, is_read: true } : msg
                     ));
                 }
                 return;
             }
             
             // Check if message belongs to current conversation
             if (currentSelected && (data.sender_id === currentSelected.id || data.receiver_id === currentSelected.id)) {
                 // DEDUPLICATION: Check if we already have this message ID
                 setMessages(prev => {
                     if (prev.some(m => m.id === data.id)) return prev;
                     return [...prev, data];
                 });

                 // If incoming message from active chat partner, mark as read
                 // ONLY if the window is currently focused/visible
                 if (data.sender_id === currentSelected.id) {
                     if (document.visibilityState === 'visible') {
                         markMessagesAsRead(currentSelected.id);
                     }
                 }
             }
        };
    }, [selectedUser, isConnected]); // Re-attach when selectedUser changes or connection is re-established

    // Watch for visibility changes to mark messages as read when user comes back
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && selectedUser) {
                 markMessagesAsRead(selectedUser.id);
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleVisibilityChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleVisibilityChange);
        };
    }, [selectedUser]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fetch History when selecting user
    useEffect(() => {
        if (selectedUser) {
            fetchChatHistory(selectedUser.id).then(msgs => {
                setMessages(msgs);
                // Mark as read when opening chat
                markMessagesAsRead(selectedUser.id);
            }).catch(console.error);
        }
    }, [selectedUser]);

    // Start Audio Recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Determine supported MIME type (prefer MP4/AAC for macOS/iOS compatibility, fallback to WebM)
            let mimeType = 'audio/webm';
            let extension = 'webm';
            
            if (MediaRecorder.isTypeSupported('audio/mp4')) {
                mimeType = 'audio/mp4';
                extension = 'mp4';
            } else if (MediaRecorder.isTypeSupported('audio/aac')) {
                mimeType = 'audio/aac';
                extension = 'aac';
            } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                mimeType = 'audio/webm;codecs=opus';
                extension = 'webm';
            }

            const options = { mimeType };
            mediaRecorderRef.current = new MediaRecorder(stream, options);
            audioChunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };
            
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                // Create file with proper extension
                const file = new File([audioBlob], `voice_message.${extension}`, { type: mimeType });
                
                // Upload immediately
                try {
                   const data = await uploadChatAttachment(file);
                   setAttachment({
                       url: data.url,
                       type: 'audio',
                       name: 'Voice Message',
                       file: file
                   });
                } catch (error) {
                    console.error("Audio upload failed", error);
                    alert("Failed to upload audio message");
                }
                
                // Cleanup stream
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            timerIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone");
        }
    };
    
    // Stop Audio Recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            // stream stop handled in onstop
            setIsRecording(false);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
    };
    
    // Handle File Selection
    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Determine type
        let type = 'file';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('audio/')) type = 'audio';
        
        try {
            const data = await uploadChatAttachment(file);
            setAttachment({
                url: data.url,
                type: type,
                name: file.name,
                file: file
            });
        } catch (error) {
            console.error("File upload failed", error);
            alert("Failed to upload file");
        }
        
        // Reset input
        e.target.value = '';
    };

    const clearAttachment = () => {
        setAttachment(null);
        if (isRecording) {
            stopRecording();
        }
    };
    
    const cancelReply = () => {
        setReplyingTo(null);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSend = async () => {
        if ((!inputValue.trim() && !attachment) || !selectedUser) return;
        
        const messagePayload = {
             receiver_id: selectedUser.id,
             content: inputValue || null,
             attachment_url: attachment ? attachment.url : null,
             message_type: attachment ? attachment.type : 'text',
             reply_to_id: replyingTo ? replyingTo.id : null
        };

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
             wsRef.current.send(JSON.stringify(messagePayload));
        } else {
             // Fallback
             await sendMessage(messagePayload);
        }
        setInputValue('');
        setAttachment(null);
        setReplyingTo(null);
    };
    
    return (
        <>
            <div className="flex h-[600px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                {/* Sidebar List */}
            <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col">
                <div className="p-4 border-b border-gray-100 font-bold text-gray-900 flex items-center bg-white">
                    <MessageSquare className="w-5 h-5 mr-2 text-primary" /> Chats
                </div>
                <div className="overflow-y-auto flex-1">
                    {conversations.length === 0 ? (
                        <p className="text-gray-500 text-sm p-8 text-center">No active conversations</p>
                    ) : (
                        conversations.map(c => (
                            <div 
                                key={c.id} 
                                onClick={() => setSelectedUser(c)}
                                className={`p-4 cursor-pointer hover:bg-white border-b border-gray-50 transition-colors flex items-center ${selectedUser?.id === c.id ? 'bg-white border-l-4 border-l-primary shadow-sm' : ''}`}
                            >
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3 text-gray-500 overflow-hidden">
                                   {c.profile_image ? (
                                        <img src={getImageUrl(c.profile_image)} alt="User" className="w-full h-full object-cover" />
                                   ) : (
                                        <User className="w-5 h-5" />
                                   )}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-semibold text-gray-900 truncate">{c.full_name || c.email}</p>
                                    <p className="text-xs text-gray-500 capitalize">{c.role}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50">
                {selectedUser ? (
                    <>
                        <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3 text-primary overflow-hidden">
                                    {selectedUser.profile_image ? (
                                        <img src={getImageUrl(selectedUser.profile_image)} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-4 h-4" />
                                    )}
                                </div>
                                <span className="font-bold text-gray-900">{selectedUser.full_name}</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {isConnected ? 'Live' : 'Connecting...'}
                            </span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender_id === user.userId;
                                // Find replied message context
                                const repliedMsg = msg.reply_to_id ? messages.find(m => m.id === msg.reply_to_id) : null;

                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2 group`}>
                                        {!isMe && (
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mb-1">
                                                {selectedUser.profile_image ? (
                                                    <img src={getImageUrl(selectedUser.profile_image)} alt="User" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Reply Button (Left Side for Me) */}
                                        {isMe && (
                                            <button 
                                                onClick={() => setReplyingTo(msg)} 
                                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-gray-600 transition-all rounded-full hover:bg-gray-100"
                                                title="Reply"
                                            >
                                                <Reply className="w-4 h-4" />
                                            </button>
                                        )}

                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                            {/* Reply Context Bubble */}
                                            {repliedMsg && (
                                                 <div className={`mb-1 text-xs px-3 py-2 rounded-lg bg-gray-100 border-l-4 border-gray-400 opacity-80 w-full truncate cursor-pointer hover:bg-gray-200 transition-colors`} onClick={() => {
                                                     // Optional: Scroll to message
                                                 }}>
                                                     <p className="font-bold text-gray-600 mb-0.5">{repliedMsg.sender_id === user.userId ? 'You' : selectedUser.full_name}</p>
                                                     <p className="truncate text-gray-500">
                                                         {repliedMsg.content || (repliedMsg.attachment_type === 'image' ? 'Example Image' : (repliedMsg.attachment_url ? 'Attachment' : 'Message'))}
                                                     </p>
                                                 </div>
                                            )}

                                            <div className={`p-3 rounded-2xl shadow-sm w-full ${
                                                isMe 
                                                ? 'bg-[#3B82F6] text-white rounded-br-none' 
                                                : 'bg-[#1F2937] text-white rounded-bl-none'
                                            }`}>
                                                {/* Content Rendering based on Type */}
                                                {msg.message_type === 'image' && msg.attachment_url && (
                                                    <div 
                                                        className="mb-2 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => setViewingImage(getImageUrl(msg.attachment_url))}
                                                    >
                                                        <img src={getImageUrl(msg.attachment_url)} alt="Shared" className="max-w-full h-auto max-h-64 object-cover" />
                                                    </div>
                                                )}
                                                
                                                {msg.message_type === 'audio' && msg.attachment_url && (
                                                    <div className="mb-2 min-w-[200px]">
                                                        <audio controls src={getImageUrl(msg.attachment_url)} className="w-full h-8" />
                                                    </div>
                                                )}
                                                
                                                {msg.message_type === 'file' && msg.attachment_url && (
                                                    <a href={getImageUrl(msg.attachment_url)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-2 rounded bg-black/10 mb-2 hover:bg-black/20 transition-colors ${isMe ? 'text-white' : 'text-blue-400'}`}>
                                                        <FileText className="w-5 h-5" />
                                                        <span className="text-sm underline break-all">Download File</span>
                                                    </a>
                                                )}

                                                {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}

                                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'} flex items-center justify-end gap-1`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    {isMe && (
                                                        msg.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Reply Button (Right Side for Others) */}
                                        {!isMe && (
                                            <button 
                                                onClick={() => setReplyingTo(msg)} 
                                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-gray-600 transition-all rounded-full hover:bg-gray-100"
                                                title="Reply"
                                            >
                                                <Reply className="w-4 h-4" />
                                            </button>
                                        )}

                                        {isMe && (
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mb-1">
                                                {user.profileImage ? (
                                                    <img src={getImageUrl(user.profileImage)} alt="Me" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        <div className="p-4 bg-white border-t border-gray-100">
                             {/* Reply Preview */}
                             {replyingTo && (
                                <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-center justify-between border-l-4 border-l-primary border-t border-r border-b border-gray-200">
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-primary mb-1">Replying to {replyingTo.sender_id === user.userId ? 'yourself' : selectedUser.full_name}</p>
                                        <p className="text-sm text-gray-600 truncate">
                                            {replyingTo.content || (replyingTo.attachment_type === 'image' ? 'Image' : (replyingTo.attachment_url ? 'Attachment' : 'Message'))}
                                        </p>
                                    </div>
                                    <button onClick={cancelReply} className="text-gray-400 hover:text-red-500 p-1">
                                         <X className="w-4 h-4" />
                                    </button>
                                </div>
                             )}

                             {/* Attachment Preview */}
                             {attachment && (
                                 <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-center justify-between border border-gray-200">
                                     <div className="flex items-center gap-2 overflow-hidden">
                                         {attachment.type === 'image' && (
                                             <img src={getImageUrl(attachment.url)} alt="Preview" className="w-10 h-10 object-cover rounded" />
                                         )}
                                         {attachment.type === 'file' && <FileText className="w-5 h-5 text-gray-500" />}
                                         {attachment.type === 'audio' && <Mic className="w-5 h-5 text-gray-500" />}
                                         <span className="text-sm text-gray-700 truncate max-w-[200px]">{attachment.name}</span>
                                     </div>
                                     <button onClick={clearAttachment} className="text-gray-400 hover:text-red-500">
                                         <X className="w-4 h-4" />
                                     </button>
                                 </div>
                             )}

                             <div className="flex gap-2 items-end">
                                {/* File Input (Hidden) */}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    onChange={handleFileSelect}
                                />
                                
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                    title="Attach file"
                                >
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                
                                {isRecording ? (
                                    <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-full border border-red-100 animate-pulse">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                        <span className="font-mono text-sm">{formatTime(recordingTime)}</span>
                                        <div className="flex-1 text-xs text-right">Recording...</div>
                                        <button onClick={stopRecording} className="p-1 hover:bg-red-100 rounded-full">
                                            <div className="w-4 h-4 bg-red-600 rounded-sm" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <input 
                                            type="text"
                                            className="flex-1 border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                            placeholder="Type your message..."
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        />
                                        
                                        {!inputValue && !attachment ? (
                                            <button 
                                                onClick={startRecording}
                                                className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                title="Record voice message"
                                            >
                                                <Mic className="w-5 h-5" />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={handleSend}
                                                disabled={!inputValue.trim() && !attachment}
                                                className="bg-primary text-white p-3 rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        )}
                                    </>
                                )}
                             </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 flex-col bg-gray-50/50">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="font-medium text-gray-500">Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>

        {/* Full Screen Image Modal */}
        {viewingImage && (
            <div 
                className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
                onClick={() => setViewingImage(null)}
            >
                 <button 
                    className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                    onClick={() => setViewingImage(null)}
                 >
                     <X className="w-8 h-8" />
                 </button>
                 <img 
                    src={viewingImage} 
                    alt="Full view" 
                    className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" 
                    onClick={(e) => e.stopPropagation()} 
                 />
            </div>
        )}
        </>
    );
};

export default Chat;
