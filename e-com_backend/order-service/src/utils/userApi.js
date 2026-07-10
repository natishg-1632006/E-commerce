const axios = require('axios');

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || 'http://localhost:5006/api/v1/users';

/**
 * Get logged-in user's profile
 */
const getProfile = async (token) => {
  try {
    const { data } = await axios.get(
      `${USER_SERVICE_URL}/profile`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    return data.data;
  } catch (err) {
    throw new Error(
      `User Service Error (Get Profile): ${
        err.response?.data?.message || err.message
      }`
    );
  }
};

/**
 * Update logged-in user's profile
 */
const updateProfile = async (profileData, token) => {
  try {
    const { data } = await axios.put(
      `${USER_SERVICE_URL}/profile`,
      profileData,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    return data.data;
  } catch (err) {
    throw new Error(
      `User Service Error (Update Profile): ${
        err.response?.data?.message || err.message
      }`
    );
  }
};

module.exports = {
  getProfile,
  updateProfile,
};