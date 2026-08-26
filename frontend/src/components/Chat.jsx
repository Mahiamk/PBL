import React, { useState, useEffect, useRef } from 'react';
import { fetchConversations, fetchChatHistory, sendMessage, markMessagesAsRead, uploadChatAttachment, getBackendBaseUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
  PaperPlaneRight,
  User,
  ChatCircleDots,
  Check,
  Checks,
  Paperclip,
  Microphone,
  X,
  FileText,
  Play,
  Pause,
  ArrowBendUpLeft,
  Circle,
  CaretLeft,
  MagnifyingGlass,
  Storefront,
  Sparkle
} from '@phosphor-icons/react';

const CAMPUS_MERCHANTS = [
  { id: 3, full_name: 'AIU Tech & Repair Hub', role: 'Tech & Laptop Repair', store_type: 'tech', initial: 'TH' },
  { id: 4, full_name: 'AIU Campus Barber Shop', role: 'Hair & Grooming Studio', store_type: 'barber', initial: 'BB' },
  { id: 5, full_name: 'AIU Tailor & Alterations', role: 'Bespoke Tailor & Alterations', store_type: 'tailor', initial: 'TL' },
  { id: 6, full_name: 'AIU Flask & Bottle Shop', role: 'Drinkware & Insulated Tumblers', store_type: 'bottles', initial: 'FB' },
  { id: 7, full_name: 'AIU Campus Cafe & Brews', role: 'Cafe & Barista Services', store_type: 'cafe', initial: 'CF' },
  { id: 8, full_name: 'AIU Wellness & Cupping Therapy', role: 'Hijama & Physical Therapy', store_type: 'wellness', initial: 'WL' },
  { id: 9, full_name: 'AIU Official Apparel & Store', role: 'Collegiate Apparel & Merch', store_type: 'clothing', initial: 'AP' },
];

const Chat = ({ preSelectedUser = null }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'merchants'
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
        const baseUrl = getBackendBaseUrl();
        return `${baseUrl}${path}`;
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
                setConversations(prev => {
                    // Merge and deduplicate with any optimistic active chat
                    const merged = [...data];
                    if (preSelectedUser && !merged.some(u => u.id === preSelectedUser.id)) {
                        merged.unshift(preSelectedUser);
                    }
                    return merged;
                });
                
                if (preSelectedUser) {
                    const existing = data.find(u => u.id === preSelectedUser.id);
                    setSelectedUser(existing || preSelectedUser);
                    setActiveTab('all');
                }
            }).catch(console.error);
        }
    }, [user]);

    // Handle updates to preSelectedUser when prop changes
    useEffect(() => {
        if (preSelectedUser) {
            setSelectedUser(preSelectedUser);
            setActiveTab('all');
            setConversations(prev => {
                const exists = prev.some(c => c.id === preSelectedUser.id);
                if (exists) {
                    return [preSelectedUser, ...prev.filter(c => c.id !== preSelectedUser.id)];
                }
                return [preSelectedUser, ...prev];
            });
        }
    }, [preSelectedUser]);

    // WebSocket Connection
    useEffect(() => {
        if (!user) return;
        // If we already have a connection, don't reconnect just because selectedUser changed
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const backendBaseUrl = getBackendBaseUrl();
        const wsUrl = `${protocol}://${backendBaseUrl.replace(/^https?:\/\//, '')}/api/messages/ws?token=${user.token}`;
        
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
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

             // Instantly update conversations list if incoming message from another user
             if (data.sender_id && data.sender_id !== user?.userId) {
                 setConversations(prev => {
                     const exists = prev.find(c => c.id === data.sender_id);
                     if (exists) {
                         return [exists, ...prev.filter(c => c.id !== data.sender_id)];
                     }
                     const merchant = CAMPUS_MERCHANTS.find(m => m.id === data.sender_id);
                     const newConv = merchant || { id: data.sender_id, full_name: `User #${data.sender_id}`, role: 'vendor' };
                     return [newConv, ...prev];
                 });
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

        // Immediately update conversations so it stays at the top of active chats
        setConversations(prev => {
            const exists = prev.some(c => c.id === selectedUser.id);
            if (exists) {
                return [selectedUser, ...prev.filter(c => c.id !== selectedUser.id)];
            }
            return [selectedUser, ...prev];
        });

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
    
    const filteredConversations = conversations.filter(c => {
        const name = (c.full_name || c.email || '').toLowerCase();
        const role = (c.role || '').toLowerCase();
        return name.includes(searchQuery.toLowerCase()) || role.includes(searchQuery.toLowerCase());
    });

    const filteredMerchants = CAMPUS_MERCHANTS.filter(m => {
        const name = m.full_name.toLowerCase();
        const role = m.role.toLowerCase();
        return name.includes(searchQuery.toLowerCase()) || role.includes(searchQuery.toLowerCase());
    });

    const handleSelectMerchant = (merchant) => {
        const targetObj = {
            id: merchant.id,
            full_name: merchant.full_name,
            role: merchant.role || 'vendor',
            profile_image: merchant.profile_image || null
        };

        const existing = conversations.find(u => u.id === merchant.id);
        const userToSelect = existing || targetObj;

        setSelectedUser(userToSelect);
        setActiveTab('all');

        // Instantly add to active conversations list without waiting for page refresh
        setConversations(prev => {
            const exists = prev.some(c => c.id === userToSelect.id);
            if (exists) {
                return [userToSelect, ...prev.filter(c => c.id !== userToSelect.id)];
            }
            return [userToSelect, ...prev];
        });
    };

    return (
        <>
            <div className="flex h-full w-full bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-[#e8e8ed] overflow-hidden">
                {/* Sidebar List - responsive: hidden on mobile if user selected */}
                <div className={`w-full md:w-84 lg:w-96 border-r border-[#e8e8ed] bg-[#fbfbfd] flex flex-col h-full overflow-hidden shrink-0 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="p-4 border-b border-[#e8e8ed] bg-white space-y-3 shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2 rounded-2xl bg-[#1d1d1f] text-white">
                                    <ChatCircleDots size={20} weight="fill" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold text-[#1d1d1f] tracking-tight">Direct Messages</h3>
                                    <p className="text-[11px] text-[#86868b]">AIU Campus Communications</p>
                                </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                                isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                {isConnected ? 'Live' : 'Connecting'}
                            </span>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <MagnifyingGlass size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]" />
                            <input
                                type="text"
                                placeholder="Search chats or campus stores..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 bg-[#f5f5f7] border border-[#e8e8ed] rounded-xl text-xs text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:bg-white focus:border-[#1d1d1f] transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f]"
                                >
                                    <X size={13} weight="bold" />
                                </button>
                            )}
                        </div>

                        {/* Segmented Filter Control */}
                        <div className="flex bg-[#f5f5f7] p-1 rounded-xl gap-1">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    activeTab === 'all'
                                        ? 'bg-white text-[#1d1d1f] shadow-xs'
                                        : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                                }`}
                            >
                                Active Chats {conversations.length > 0 && `(${conversations.length})`}
                            </button>
                            <button
                                onClick={() => setActiveTab('merchants')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                    activeTab === 'merchants'
                                        ? 'bg-white text-[#1d1d1f] shadow-xs'
                                        : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                                }`}
                            >
                                <Storefront size={14} weight="duotone" />
                                Shops ({CAMPUS_MERCHANTS.length})
                            </button>
                        </div>
                    </div>

                    {/* Conversations / Merchant List */}
                    <div className="overflow-y-auto flex-1 p-2.5 space-y-1">
                        {activeTab === 'all' ? (
                            filteredConversations.length === 0 ? (
                                <div className="p-6 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-[#f5edf0] text-[#6b535d] flex items-center justify-center mx-auto mb-3">
                                        <ChatCircleDots size={24} weight="duotone" />
                                    </div>
                                    <p className="text-xs font-bold text-[#1d1d1f] mb-1">No Active Chats</p>
                                    <p className="text-[11px] text-[#86868b] mb-4">Start an instant inquiry with any campus shop.</p>
                                    <button
                                        onClick={() => setActiveTab('merchants')}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1d1d1f] text-white text-xs font-semibold rounded-xl hover:bg-[#333336] transition-all shadow-xs"
                                    >
                                        <Storefront size={14} weight="bold" />
                                        Browse Campus Shops
                                    </button>
                                </div>
                            ) : (
                                filteredConversations.map(c => (
                                    <div 
                                        key={c.id} 
                                        onClick={() => setSelectedUser(c)}
                                        className={`p-3 cursor-pointer rounded-2xl transition-all duration-200 flex items-center space-x-3 ${
                                            selectedUser?.id === c.id 
                                                ? 'bg-white shadow-xs border border-[#dfd5da] text-[#1d1d1f] ring-2 ring-[#8e6e7d]/15' 
                                                : 'hover:bg-white/80 text-[#6e6e73]'
                                        }`}
                                    >
                                        <div className="w-10 h-10 bg-[#f5edf0] text-[#594951] font-bold text-xs rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-[#e6dadf]">
                                           {c.profile_image ? (
                                                <img src={getImageUrl(c.profile_image)} alt="User" className="w-full h-full object-cover" />
                                           ) : (
                                                <span>{(c.full_name || 'U').substring(0, 2).toUpperCase()}</span>
                                           )}
                                        </div>
                                        <div className="overflow-hidden flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-xs text-[#1d1d1f] truncate">{c.full_name || c.email}</p>
                                            </div>
                                            <p className="text-[11px] text-[#86868b] capitalize truncate">{c.role || 'Campus Merchant'}</p>
                                        </div>
                                    </div>
                                ))
                            )
                        ) : (
                            filteredMerchants.map(m => (
                                <div
                                    key={m.id}
                                    onClick={() => handleSelectMerchant(m)}
                                    className={`p-3 cursor-pointer rounded-2xl transition-all duration-200 flex items-center space-x-3 ${
                                        selectedUser?.id === m.id
                                            ? 'bg-white shadow-xs border border-[#dfd5da] text-[#1d1d1f] ring-2 ring-[#8e6e7d]/15'
                                            : 'hover:bg-white/80 text-[#6e6e73]'
                                    }`}
                                >
                                    <div className="w-10 h-10 bg-[#1d1d1f] text-white font-bold text-xs rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
                                        {m.initial}
                                    </div>
                                    <div className="overflow-hidden flex-1 min-w-0">
                                        <p className="font-bold text-xs text-[#1d1d1f] truncate">{m.full_name}</p>
                                        <p className="text-[11px] text-[#86868b] truncate">{m.role}</p>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-1 bg-[#f5edf0] text-[#594951] rounded-lg">
                                        Chat
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 flex flex-col bg-[#f5f5f7] h-full overflow-hidden min-w-0 ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    {selectedUser ? (
                        <>
                            {/* Chat Top Bar */}
                            <div className="p-3.5 sm:p-4 border-b border-[#e8e8ed] bg-white flex items-center justify-between shadow-xs z-10 shrink-0">
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-xl md:hidden transition-colors"
                                        title="Back to conversations"
                                    >
                                        <CaretLeft size={20} weight="bold" />
                                    </button>
                                    <div className="w-10 h-10 bg-[#1d1d1f] text-white font-bold text-xs rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                                        {selectedUser.profile_image ? (
                                            <img src={getImageUrl(selectedUser.profile_image)} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{(selectedUser.full_name || 'U').substring(0, 2).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="font-bold text-xs sm:text-sm text-[#1d1d1f] block leading-tight">{selectedUser.full_name}</span>
                                        <span className="text-[11px] text-[#86868b] capitalize">{selectedUser.role || 'Campus Merchant'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/50 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Ready to assist
                                    </span>
                                </div>
                            </div>
                            
                            {/* Messages Bubble List */}
                            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-[#fbfbfd]">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#86868b]">
                                        <div className="w-12 h-12 bg-white rounded-2xl border border-[#e8e8ed] shadow-xs flex items-center justify-center mb-2.5 text-[#594951]">
                                            <Sparkle size={22} weight="duotone" />
                                        </div>
                                        <p className="text-xs font-bold text-[#1d1d1f] mb-1">Start Conversation with {selectedUser.full_name}</p>
                                        <p className="text-[11px] max-w-xs text-[#86868b]">Send an inquiry regarding an order, ask about service availability, or request details.</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = msg.sender_id === user.userId;
                                        const repliedMsg = msg.reply_to_id ? messages.find(m => m.id === msg.reply_to_id) : null;

                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2 group`}>
                                                {!isMe && (
                                                    <div className="w-7 h-7 rounded-xl overflow-hidden bg-[#1d1d1f] text-white shrink-0 mb-1 flex items-center justify-center font-bold text-[10px]">
                                                        {selectedUser.profile_image ? (
                                                            <img src={getImageUrl(selectedUser.profile_image)} alt="User" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{(selectedUser.full_name || 'U').substring(0, 2).toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                )}

                                                {isMe && (
                                                    <button 
                                                        onClick={() => setReplyingTo(msg)} 
                                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-[#86868b] hover:text-[#1d1d1f] transition-all rounded-full hover:bg-[#f5edf0]"
                                                        title="Reply"
                                                    >
                                                        <ArrowBendUpLeft size={16} weight="duotone" />
                                                    </button>
                                                )}

                                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[78%] sm:max-w-[70%]`}>
                                                    {repliedMsg && (
                                                         <div className="mb-1 text-[11px] px-3 py-1.5 rounded-xl bg-[#f5edf0] border-l-3 border-[#8e6e7d] opacity-90 w-full truncate cursor-pointer hover:bg-[#eee0e5] transition-colors">
                                                             <p className="font-bold text-[#594951]">{repliedMsg.sender_id === user.userId ? 'You' : selectedUser.full_name}</p>
                                                             <p className="truncate text-[#6e6e73]">
                                                                 {repliedMsg.content || (repliedMsg.attachment_type === 'image' ? 'Image' : 'Attachment')}
                                                             </p>
                                                         </div>
                                                    )}

                                                    <div className={`p-3.5 rounded-2xl shadow-xs text-xs sm:text-sm leading-relaxed ${
                                                        isMe 
                                                        ? 'bg-[#1d1d1f] text-white rounded-br-xs' 
                                                        : 'bg-white border border-[#e8e8ed] text-[#1d1d1f] rounded-bl-xs'
                                                    }`}>
                                                        {msg.message_type === 'image' && msg.attachment_url && (
                                                            <div 
                                                                className="mb-2 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
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
                                                            <a href={getImageUrl(msg.attachment_url)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-2 rounded-xl bg-black/10 mb-2 hover:bg-black/20 transition-colors ${isMe ? 'text-white' : 'text-[#8e6e7d]'}`}>
                                                                <FileText size={18} weight="duotone" />
                                                                <span className="underline break-all text-xs">Download Attachment</span>
                                                            </a>
                                                        )}

                                                        {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}

                                                        <div className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${isMe ? 'text-white/70' : 'text-[#86868b]'}`}>
                                                            <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                            {isMe && (
                                                                msg.is_read ? <Checks size={14} weight="bold" className="text-white" /> : <Check size={14} weight="bold" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {!isMe && (
                                                    <button 
                                                        onClick={() => setReplyingTo(msg)} 
                                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-[#86868b] hover:text-[#1d1d1f] transition-all rounded-full hover:bg-[#f5edf0]"
                                                        title="Reply"
                                                    >
                                                        <ArrowBendUpLeft size={16} weight="duotone" />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            
                            {/* Input Bar */}
                            <div className="p-3.5 sm:p-4 bg-white border-t border-[#e8e8ed] shrink-0">
                                 {replyingTo && (
                                    <div className="mb-2 p-2.5 bg-[#f5edf0] rounded-2xl flex items-center justify-between border-l-4 border-[#8e6e7d]">
                                        <div className="overflow-hidden">
                                            <p className="text-[11px] font-bold text-[#594951]">Replying to {replyingTo.sender_id === user.userId ? 'yourself' : selectedUser.full_name}</p>
                                            <p className="text-xs text-[#6e6e73] truncate">
                                                {replyingTo.content || 'Attachment'}
                                            </p>
                                        </div>
                                        <button onClick={cancelReply} className="text-[#86868b] hover:text-rose-500 p-1">
                                             <X size={16} weight="bold" />
                                        </button>
                                    </div>
                                 )}

                                 {attachment && (
                                     <div className="mb-2 p-2.5 bg-[#f5f5f7] rounded-2xl flex items-center justify-between border border-[#e8e8ed]">
                                         <div className="flex items-center gap-2 overflow-hidden">
                                             {attachment.type === 'image' && (
                                                 <img src={getImageUrl(attachment.url)} alt="Preview" className="w-9 h-9 object-cover rounded-lg" />
                                             )}
                                             {attachment.type === 'file' && <FileText size={18} weight="duotone" className="text-[#86868b]" />}
                                             {attachment.type === 'audio' && <Microphone size={18} weight="duotone" className="text-[#86868b]" />}
                                             <span className="text-xs text-[#1d1d1f] truncate max-w-[200px]">{attachment.name}</span>
                                         </div>
                                         <button onClick={clearAttachment} className="text-[#86868b] hover:text-rose-500">
                                             <X size={16} weight="bold" />
                                         </button>
                                     </div>
                                 )}

                                 <div className="flex gap-2 items-center">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        onChange={handleFileSelect}
                                    />
                                    
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2.5 text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5edf0] rounded-full transition-colors"
                                        title="Attach file"
                                    >
                                        <Paperclip size={20} weight="duotone" />
                                    </button>
                                    
                                    {isRecording ? (
                                        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
                                            <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                                            <span className="font-mono text-xs font-bold">{formatTime(recordingTime)}</span>
                                            <div className="flex-1 text-xs text-right font-medium">Recording audio...</div>
                                            <button onClick={stopRecording} className="p-1 hover:bg-rose-100 rounded-lg">
                                                <div className="w-4 h-4 bg-rose-600 rounded-xs" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <input 
                                                type="text"
                                                className="flex-1 border border-[#dfd5da] rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1d1d1f]/10 focus:border-[#1d1d1f] transition-all text-xs sm:text-sm bg-[#f5f5f7] focus:bg-white"
                                                placeholder={`Message ${selectedUser.full_name}...`}
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                            />
                                            
                                            {!inputValue && !attachment ? (
                                                <button 
                                                    onClick={startRecording}
                                                    className="p-2.5 text-[#86868b] hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                                                    title="Record voice message"
                                                >
                                                    <Microphone size={20} weight="duotone" />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={handleSend}
                                                    disabled={!inputValue.trim() && !attachment}
                                                    className="bg-[#1d1d1f] text-white p-2.5 rounded-full hover:bg-[#333336] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95 shrink-0"
                                                >
                                                    <PaperPlaneRight size={17} weight="duotone" />
                                                </button>
                                            )}
                                        </>
                                    )}
                                 </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-[#86868b] flex-col bg-[#fbfbfd] p-8 text-center">
                            <div className="w-16 h-16 bg-[#f5edf0] text-[#6b535d] rounded-3xl flex items-center justify-center mb-4 shadow-xs">
                                <ChatCircleDots size={32} weight="duotone" />
                            </div>
                            <h3 className="text-base font-extrabold text-[#1d1d1f] mb-1.5">Direct Campus Merchant Chat</h3>
                            <p className="text-xs text-[#86868b] max-w-sm mb-6">Connect directly with store owners for custom orders, sizing advice, repairs, and appointment consultations.</p>
                            
                            <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                                {CAMPUS_MERCHANTS.slice(0, 4).map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => handleSelectMerchant(m)}
                                        className="p-3 bg-white border border-[#e8e8ed] rounded-2xl hover:border-[#1d1d1f] transition-all flex items-center space-x-3 shadow-xs group"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-[#1d1d1f] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                                            {m.initial}
                                        </div>
                                        <div className="overflow-hidden min-w-0">
                                            <p className="font-bold text-xs text-[#1d1d1f] truncate">{m.full_name}</p>
                                            <p className="text-[10px] text-[#86868b] truncate">{m.role}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Full Screen Image Modal */}
            {viewingImage && (
                <div 
                    className="fixed inset-0 z-[100] bg-slate-950/95 flex items-center justify-center p-4 backdrop-blur-md"
                    onClick={() => setViewingImage(null)}
                >
                     <button 
                        className="absolute top-6 right-6 text-white/70 hover:text-white p-2.5 rounded-full hover:bg-white/10 transition-colors"
                        onClick={() => setViewingImage(null)}
                     >
                         <X size={24} weight="bold" />
                     </button>
                     <img 
                        src={viewingImage} 
                        alt="Full view" 
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl" 
                        onClick={(e) => e.stopPropagation()} 
                     />
                </div>
            )}
        </>
    );
};

export default Chat;
