import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  History, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ChatHistorySidebar = ({ 
  isOpen, 
  onToggle, 
  currentChatId, 
  onSelectChat, 
  onNewChat,
  chatSessions,
  onDeleteChat 
}) => {
  const [sessions, setSessions] = useState(chatSessions || []);

  useEffect(() => {
    setSessions(chatSessions || []);
  }, [chatSessions]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hari ini';
    if (diffDays === 2) return 'Kemarin';
    if (diffDays <= 7) return `${diffDays - 1} hari lalu`;
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const groupSessionsByDate = (sessions) => {
    const groups = {};
    sessions.forEach(session => {
      const date = new Date(session.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Hari ini';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Kemarin';
      } else {
        const diffTime = Math.abs(today - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          groupKey = `${diffDays} hari lalu`;
        } else {
          groupKey = date.toLocaleDateString('id-ID', { 
            month: 'long',
            year: 'numeric'
          });
        }
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(session);
    });

    return groups;
  };

  const groupedSessions = groupSessionsByDate(sessions);

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80 lg:w-72
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-gray-600" />
            <h2 className="font-semibold text-gray-800">Chat History</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-100">
          <Button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 justify-start"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {Object.keys(groupedSessions).length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Belum ada riwayat chat
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Chat dengan AI akan tersimpan di sini
              </p>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedSessions).map(([dateGroup, sessionsInGroup]) => (
                <div key={dateGroup} className="mb-4">
                  {/* Date Group Header */}
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <Calendar className="h-3 w-3" />
                    {dateGroup}
                  </div>

                  {/* Sessions in this date group */}
                  <div className="space-y-1">
                    {sessionsInGroup.map((session) => (
                      <div
                        key={session.id}
                        className={`
                          group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors
                          ${currentChatId === session.id 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'hover:bg-gray-50'
                          }
                        `}
                        onClick={() => onSelectChat(session)}
                      >
                        <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-800 truncate">
                            {session.title || 'Untitled Chat'}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {session.preview || 'No messages yet'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-400">
                              {session.messageCount || 0} pesan
                            </span>
                            {session.persona && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {session.persona.name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(session.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {sessions.length} chat session{sessions.length !== 1 ? 's' : ''} tersimpan
          </p>
        </div>
      </div>

      {/* Toggle Button (when sidebar is closed) */}
      {!isOpen && (
        <Button
          onClick={onToggle}
          className="fixed top-4 left-4 z-40 lg:top-6 lg:left-6"
          size="sm"
          variant="outline"
        >
          <ChevronRight className="h-4 w-4 mr-2" />
          History
        </Button>
      )}
    </>
  );
};

export default ChatHistorySidebar;
