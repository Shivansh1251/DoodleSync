import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../utils/ApiService';

export default function RoomBrowser() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const result = await ApiService.getAllRooms();
      if (result.error) {
        setError(result.error);
      } else {
        setRooms(result.rooms || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (roomId) => {
    const userName = localStorage.getItem('ds_user') || 'Anonymous';
    navigate(`/board?room=${roomId}`);
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm(`Are you sure you want to delete room "${roomId}"?`)) return;
    
    try {
      const result = await ApiService.deleteRoom(roomId);
      if (result.error) {
        alert('Error deleting room: ' + result.error);
      } else {
        alert('Room deleted successfully');
        loadRooms(); // Refresh the list
      }
    } catch (err) {
      alert('Error deleting room: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Browse Rooms</h1>
        <button
          onClick={loadRooms}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded transition-colors duration-300">
          Error: {error}
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
          <p>No rooms found.</p>
          <button
            onClick={() => navigate('/room-entry')}
            className="mt-4 px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-300"
          >
            Create New Room
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div key={room.roomId} className="border dark:border-gray-700 rounded-lg p-4 shadow hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg truncate text-gray-900 dark:text-white transition-colors duration-300">{room.roomId}</h3>
                <button
                  onClick={() => handleDeleteRoom(room.roomId)}
                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm transition-colors duration-300"
                  title="Delete room"
                >
                  🗑️
                </button>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-3 transition-colors duration-300">
                <p>Created by: {room.createdBy || 'Anonymous'}</p>
                <p>Last modified: {formatDate(room.lastModified)}</p>
              </div>
              
              <button
                onClick={() => handleJoinRoom(room.roomId)}
                className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-300"
              >
                Join Room
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/room-entry')}
          className="px-6 py-2 bg-green-600 dark:bg-green-500 text-white rounded hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-300"
        >
          Create New Room
        </button>
      </div>
    </div>
  );
}