import angular from 'angular';
import 'angular-websocket';

class WebSocket {

  constructor (Constants, $websocket, Helper) {
    'ngInject';

    Object.assign(this, {
      Constants,
      $websocket,
      Helper,
      dataStream: {}
    });
  }

  open (channelName, cbOnOpen, cbOnClose) {
    this.dataStream = this.$websocket(this.Constants.api.ws.invites.uri(channelName));

    this.dataStream.onOpen(response => {
      console.log('onOpen:', response);
      if (cbOnOpen) {
        cbOnOpen( );
      }
    });

    this.dataStream.onClose(response => {
      console.log('onClose:', response);
      if (cbOnClose) {
        cbOnClose( );
      }
    });

    return this.dataStream;
  }

  invites (channelName = '', cbOnMessage, cbOnOpen) {
    this.open(channelName, cbOnOpen);

    this.dataStream.onMessage(message => {
      console.log('onmessage:', message);
      const data = JSON.parse(message.data);

      if (data.action == 'close') {
        this.close( );
        return data;
      }

      if (data.code == 404) {
        this.Helper.showToast(data.message, 8000);
        return data;
      }
      if (cbOnMessage) {
        cbOnMessage(data);
      }

      return data;
    });
  }

  close ( ) {
    console.log('close directly:');
    this.dataStream.close( );
  }
}

export default angular.module('WebSocket', [
  'angular-websocket'
]).service('WebSocket', WebSocket).name;