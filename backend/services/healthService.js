const healthService = {
  getServerHealth() {
    return {
      status: 'OK',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    };
  },
};

export default healthService;
