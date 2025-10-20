// Frontend API utility for MongoDB backend
const API_BASE = 'http://localhost:4000/api';

class ApiService {
  static async getRoomInfo(roomId) {
    try {
      const response = await fetch(`${API_BASE}/rooms/${roomId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching room info:', error);
      return { exists: false, error: error.message };
    }
  }

  static async getChatHistory(roomId, limit = 50) {
    try {
      const response = await fetch(`${API_BASE}/rooms/${roomId}/chat?limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return { messages: [], error: error.message };
    }
  }

  static async getAllRooms() {
    try {
      const response = await fetch(`${API_BASE}/rooms`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return { rooms: [], error: error.message };
    }
  }

  static async deleteRoom(roomId) {
    try {
      const response = await fetch(`${API_BASE}/rooms/${roomId}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting room:', error);
      return { error: error.message };
    }
  }

  // Helper to check if server is available
  static async checkServerHealth() {
    try {
      const response = await fetch(`${API_BASE}/rooms`);
      return response.ok;
    } catch (error) {
      console.error('Server health check failed:', error);
      return false;
    }
  }
}

export default ApiService;