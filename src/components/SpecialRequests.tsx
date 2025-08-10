import React, { useState, useEffect } from 'react';
import { Gift, MessageCircle, Send, CheckCircle, X, Sparkles, Heart, Star, Zap } from 'lucide-react';
import { SpecialRequest } from '@/lib/song';
import { LeaderboardService } from '@/lib/services/leaderboard';

interface SpecialRequestsProps {
  organizationId: string;
  userId: string;
  isDjMode?: boolean;
  emitSpecialRequest:  (data: { songId: string; userId: string; organizationId: string ; message: string}) => void;
  onSpecialRequest: (callback: (data: { message: string }) => void) => void;
  offSpecialRequest: (callback: (data?: any) => void) => void;
}

export default function SpecialRequests({ organizationId, userId, isDjMode, emitSpecialRequest, onSpecialRequest, offSpecialRequest }: SpecialRequestsProps) {
  const [requests, setRequests] = useState<SpecialRequest[]>([]);
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestType, setRequestType] = useState<SpecialRequest['type']>('birthday');
  const [message, setMessage] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');
  const [hasUsedFreeRequest, setHasUsedFreeRequest] = useState(false);
  const [djMessage, setDjMessage] = useState('');

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, [organizationId]);

  const loadRequests = async () => {
    const data = await LeaderboardService.getSpecialRequests(organizationId);
    setRequests(
      data.sort(
        (a: SpecialRequest, b: SpecialRequest) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    );

    setHasUsedFreeRequest(data.some((r: SpecialRequest) => r.requestedBy === userId));
  };

  const handleSubmitRequest = async () => {
    if (!message.trim() || !requestedBy.trim()) return;

    await LeaderboardService.addSpecialRequest(organizationId, {
      type: requestType,
      message: message.trim(),
      requestedBy: requestedBy.trim(),
      paid: hasUsedFreeRequest,
      amount: hasUsedFreeRequest ? getRequestPrice(requestType) : 0,
      status: 'pending',
      fromRole: 'USER',
      visibility,
      isFirstFree: !hasUsedFreeRequest
    });

    setMessage('');
    setRequestedBy('');
    setShowRequestForm(false);
    loadRequests();

    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-400 text-black px-6 py-3 rounded-xl shadow-lg z-50 font-semibold';
    notification.textContent = 'Special request submitted!';
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 3000);
  };

  const handleUpdateStatus = async (requestId: string, status: SpecialRequest['status']) => {
    await LeaderboardService.updateSpecialRequestStatus(organizationId, requestId, status);
    loadRequests();
    if (status === 'approved') {
      emitSpecialRequest({
        songId: requestId,
        userId,
        organizationId,
        message: djMessage.trim()
      });
      setDjMessage('');
    }
  };

  const getRequestPrice = (type: SpecialRequest['type']): number => {
    const prices = {
      birthday: 10,
      anniversary: 15,
      dedication: 8,
      custom: 12
    };
    return prices[type];
  };

  const getRequestIcon = (type: SpecialRequest['type']) => {
    switch (type) {
      case 'birthday': return '🎂';
      case 'anniversary': return '💕';
      case 'dedication': return '💝';
      default: return '🎵';
    }
  };

  useEffect(() => {
    const handleOnSpecialRequest = (data: { message: string }) => {
      setBroadcastMessage(data.message);
    };

    const handleOffSpecialRequest = () => {
      setBroadcastMessage(null);
    };

    onSpecialRequest(handleOnSpecialRequest);
    offSpecialRequest(handleOffSpecialRequest);

    return () => {
      offSpecialRequest(handleOnSpecialRequest);
      offSpecialRequest(handleOffSpecialRequest);
    };
  }, [organizationId, onSpecialRequest, offSpecialRequest]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const visibleRequests = isDjMode
    ? requests.filter(r => r.fromRole === 'USER')
    : requests.filter(r => r.status === 'approved' && r.visibility === 'public');

  return (
    <div className="space-y-6">
      {/* Broadcast Message */}
      {broadcastMessage && (
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-black p-6 rounded-2xl border-2 border-green-400 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="font-bold text-lg">DJ Announcement</h3>
              <p className="text-black/80">{broadcastMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Gift className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Special Requests</h2>
                <p className="text-pink-100 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Dedications, celebrations & more</span>
                </p>
              </div>
            </div>
            {!isDjMode && (
              <button
                onClick={() => setShowRequestForm(true)}
                className="bg-white text-pink-600 px-6 py-3 rounded-xl hover:bg-pink-50 transition-colors font-semibold shadow-lg transform hover:scale-105"
              >
                Make Request
              </button>
            )}
          </div>
        </div>

        {/* Requests List */}
        <div className="p-6">
          {visibleRequests.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">No special requests yet</h3>
              <p className="text-gray-400 max-w-md mx-auto">Be the first to make a special request and spread some joy!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleRequests.map((request) => (
                <div
                  key={request.id}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                    request.status === 'pending'
                      ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-yellow-400/10'
                      : request.status === 'approved'
                      ? 'border-green-500/50 bg-gradient-to-r from-green-500/10 to-green-400/10'
                      : 'border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <span className="text-3xl mr-3">{getRequestIcon(request.type)}</span>
                        <div>
                          <h3 className="font-bold text-white capitalize text-lg">
                            {request.type} Request
                          </h3>
                          <p className="text-sm text-gray-400">
                            by {request.requestedBy} • {formatTime(request.timestamp)}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-200 mb-3 text-lg leading-relaxed">{request.message}</p>
                      {request.paid && (
                        <span className="bg-gradient-to-r from-green-500 to-green-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                          Paid ${request.amount}
                        </span>
                      )}
                    </div>

                    {/* DJ controls */}
                    {isDjMode && (
                      <div className="flex flex-col space-y-3 ml-6">
                        <input
                          type="text"
                          placeholder="Optional message to broadcast"
                          value={djMessage}
                          onChange={(e) => setDjMessage(e.target.value)}
                          className="p-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 text-sm"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateStatus(request.id, 'approved')}
                            className="bg-gradient-to-r from-green-500 to-green-400 text-black p-3 rounded-xl hover:from-green-400 hover:to-green-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
                            title="Approve & Broadcast"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(request.id, 'completed')}
                            className="bg-gray-700 text-white p-3 rounded-xl hover:bg-gray-600 transition-colors"
                            title="Dismiss"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Request Form */}
      {showRequestForm && !isDjMode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Make a Special Request</h3>
              <p className="text-gray-400">Share a special moment with everyone</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Request Type
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as SpecialRequest['type'])}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-pink-500 focus:outline-none"
                >
                  <option value="birthday">🎂 Birthday - $10</option>
                  <option value="anniversary">💕 Anniversary - $15</option>
                  <option value="dedication">💝 Dedication - $8</option>
                  <option value="custom">🎵 Custom - $12</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your special request message..."
                  rows={3}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSubmitRequest}
                  disabled={!message.trim() || !requestedBy.trim()}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-xl hover:from-pink-400 hover:to-purple-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{hasUsedFreeRequest ? `Pay $${getRequestPrice(requestType)}` : "Free Request"}</span>
                </button>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="flex-1 bg-gray-700 text-gray-300 py-3 px-6 rounded-xl hover:bg-gray-600 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
