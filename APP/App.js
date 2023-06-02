import React, { Component } from 'react';
import { WebView } from 'react-native-webview';

class MyWeb extends Component {
  render() {
    const IP = process.env.FRONTEND_IP;
    const port = process.env.FRONTEND_PORT;
    const uri = `http://${IP}:${port}/`;

    return (
      <WebView
        source={{ uri }}
        style={{ flex: 1 }}
      />
    );
  }
}

export default MyWeb;
