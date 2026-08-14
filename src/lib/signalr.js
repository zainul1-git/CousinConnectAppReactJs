import * as signalR from '@microsoft/signalr';

let connection = null;

export function getChatConnection() {
  if (connection) return connection;

  const token = localStorage.getItem('cc_token');
  const hubUrl = import.meta.env.VITE_SIGNALR_HUB_URL || 'https://localhost:7168/hubs/chat';

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${hubUrl}?access_token=${token}`)
    .withAutomaticReconnect()
    .build();

  return connection;
}

export function stopChatConnection() {
  if (connection) {
    connection.stop();
    connection = null;
  }
}