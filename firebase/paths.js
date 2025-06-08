const appId = typeof __app_id !== 'undefined' ? __app_id : 'socialstudy-default-app';

export const usersCollectionPath = `/artifacts/${appId}/public/data/users`;
export const studySessionsCollectionPath = `/artifacts/${appId}/public/data/studySessions`;
export const likesCollectionPath = `/artifacts/${appId}/public/data/likes`;
export const commentsCollectionPath = `/artifacts/${appId}/public/data/comments`;
export const groupsCollectionPath = `/artifacts/${appId}/public/data/groups`;
export const getTodosCollectionPath = (userId) => `/artifacts/${appId}/users/${userId}/todos`;