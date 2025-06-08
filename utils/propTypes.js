import PropTypes from 'prop-types';

export const userPropType = PropTypes.shape({
  uid: PropTypes.string.isRequired,
  email: PropTypes.string,
  displayName: PropTypes.string,
  photoURL: PropTypes.string,
  emailVerified: PropTypes.bool,
});

export const sessionPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  startTime: PropTypes.instanceOf(Date).isRequired,
  endTime: PropTypes.instanceOf(Date),
  userId: PropTypes.string.isRequired,
  status: PropTypes.oneOf(['active', 'completed', 'cancelled']).isRequired,
  createdAt: PropTypes.instanceOf(Date).isRequired,
  updatedAt: PropTypes.instanceOf(Date).isRequired,
});

export const todoPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  completed: PropTypes.bool.isRequired,
  dueDate: PropTypes.instanceOf(Date),
  userId: PropTypes.string.isRequired,
  createdAt: PropTypes.instanceOf(Date).isRequired,
  updatedAt: PropTypes.instanceOf(Date).isRequired,
});

export const groupPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  members: PropTypes.arrayOf(PropTypes.string).isRequired,
  createdBy: PropTypes.string.isRequired,
  createdAt: PropTypes.instanceOf(Date).isRequired,
  updatedAt: PropTypes.instanceOf(Date).isRequired,
}); 