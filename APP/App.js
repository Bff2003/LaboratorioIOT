import React, { Component } from 'react';
import { WebView } from 'react-native-webview';

class MyWeb extends Component {
  render() {
    return (
      <WebView
        source={{ uri: 'http://10.20.88.142:3000/' }}
        style={{ flex: 1 }}
      />
    );
  }
}

export default MyWeb;
