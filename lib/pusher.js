const Pusher = require('pusher');

// Initialiser Pusher avec vos credentials
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '2072966',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '0ad42094e8713af8969b',
  secret: process.env.PUSHER_SECRET || '9c3e8d55a6c9ade97ee7',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
  useTLS: true
});

// Remplace sendNotificationToUser de WebSocket
async function sendNotificationToUser(userId, notification) {
  try {
    await pusher.trigger(
      `private-user-${userId}`, 
      'notification', 
      {
        ...notification,
        timestamp: new Date().toISOString()
      }
    );
    console.log(`✅ Notification envoyée à l'utilisateur ${userId} via Pusher`);
    return true;
  } catch (error) {
    console.error('❌ Erreur Pusher:', error);
    return false;
  }
}

// Remplace sendNotificationToCompany de WebSocket
async function sendNotificationToCompany(companyId, notification) {
  try {
    await pusher.trigger(
      `private-company-${companyId}`, 
      'notification', 
      {
        ...notification,
        timestamp: new Date().toISOString()
      }
    );
    console.log(`✅ Notification envoyée à la compagnie ${companyId} via Pusher`);
    return true;
  } catch (error) {
    console.error('❌ Erreur Pusher:', error);
    return false;
  }
}

// Remplace broadcastToCompany de WebSocket
async function broadcastToCompany(companyId, event, data) {
  try {
    await pusher.trigger(
      `private-company-${companyId}`, 
      event, 
      {
        ...data,
        timestamp: new Date().toISOString()
      }
    );
    console.log(`✅ Event ${event} diffusé à la compagnie ${companyId} via Pusher`);
    return true;
  } catch (error) {
    console.error('❌ Erreur Pusher:', error);
    return false;
  }
}

// Pour mettre à jour le dashboard en temps réel
async function updateDashboard(companyId, stats) {
  try {
    await pusher.trigger(
      `private-company-${companyId}`, 
      'dashboard-update', 
      {
        ...stats,
        timestamp: new Date().toISOString()
      }
    );
    return true;
  } catch (error) {
    console.error('❌ Erreur mise à jour dashboard:', error);
    return false;
  }
}

// Nouvelle fonction pour les commentaires
async function notifyNewComment(companyId, comment) {
  try {
    await pusher.trigger(
      `private-company-${companyId}`, 
      'new-comment', 
      comment
    );
    return true;
  } catch (error) {
    console.error('❌ Erreur notification commentaire:', error);
    return false;
  }
}

// Nouvelle fonction pour les findings
async function notifyNewFinding(companyId, finding) {
  try {
    await pusher.trigger(
      `private-company-${companyId}`, 
      'new-finding', 
      finding
    );
    return true;
  } catch (error) {
    console.error('❌ Erreur notification finding:', error);
    return false;
  }
}

module.exports = {
  sendNotificationToUser,
  sendNotificationToCompany,
  broadcastToCompany,
  updateDashboard,
  notifyNewComment,
  notifyNewFinding,
  pusher // Export direct de l'instance si besoin
};
