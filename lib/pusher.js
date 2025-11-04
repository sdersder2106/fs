const Pusher = require('pusher');

const pusher = new Pusher({
  appId: '2072966',
  key: '0ad42094e8713af8969b',
  secret: '9c3e8d55a6c9ade97ee7',
  cluster: 'eu',
  useTLS: true
});

async function sendNotificationToUser(userId, notification) {
  try {
    await pusher.trigger(`private-user-${userId}`, 'notification', notification);
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

async function sendNotificationToCompany(companyId, notification) {
  try {
    await pusher.trigger(`private-company-${companyId}`, 'notification', notification);
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

async function broadcastToCompany(companyId, event, data) {
  try {
    await pusher.trigger(`private-company-${companyId}`, event, data);
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

module.exports = {
  sendNotificationToUser,
  sendNotificationToCompany,
  broadcastToCompany,
  pusher
};