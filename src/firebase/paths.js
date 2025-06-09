// Define app ID constant
const APP_ID =
  process.env.REACT_APP_FIREBASE_APP_ID || "socialstudy-default-app";

export const getAppId = () => APP_ID;

export const getUsersPath = (appId = APP_ID) =>
  `/artifacts/${appId}/public/data/users`;

export const getStudySessionsPath = (appId = APP_ID) =>
  `/artifacts/${appId}/public/data/studySessions`;

export const getLikesPath = (appId = APP_ID) =>
  `/artifacts/${appId}/public/data/likes`;

export const getCommentsPath = (appId = APP_ID) =>
  `/artifacts/${appId}/public/data/comments`;

export const getGroupsPath = (appId = APP_ID) =>
  `/artifacts/${appId}/public/data/groups`;

export const getUserTodosPath = (userId, appId = APP_ID) =>
  `/artifacts/${appId}/users/${userId}/todos`;
