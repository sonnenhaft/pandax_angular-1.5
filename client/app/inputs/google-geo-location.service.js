class GoogleGeoLocationService {
    /** @return Promise<locations>*/
  _geocodeFn = null
  _LagLngFn = null

  constructor (uiGmapGoogleMapApi, $q, $log) {
    'ngInject';

    this.$q = $q;
    this.$log = $log;
    this._deferedInitPromise = uiGmapGoogleMapApi.then(windowGoogleMaps => this._deferedInit(windowGoogleMaps));
  }

    /** @param {Object} googleMaps - same as window.google.maps */
  _deferedInit (googleMaps) {
    this._geocodeFn = coords => this.$q((resolve, reject) => new googleMaps.Geocoder( ).geocode(coords, (locations, status) => {
      if (status === 'OK') {
        resolve(locations);
      } else if (status === 'ZERO_RESULTS') {
        resolve([]);
      } else {
        reject(status);
      }
    }));
    this._LagLngFn = ({ latitude, longitude }) => ({ latLng: new googleMaps.LatLng(latitude, longitude) });
  }

  findLocationByCoords ({ latitude, longitude }) {
    return this._deferedInitPromise
            .then(( ) => this._geocodeFn(this._LagLngFn({ latitude, longitude })))
            .then(
                ([location]) => ({ coords: { latitude, longitude }, location }),
                e => {
                  this.$log.warn('seems like no locations were found for this marker', e);
                  return { coords: { latitude, longitude } };
                }
            );
  }

  findLocationsByName (address) {
    return this._deferedInitPromise.then(( ) => this._geocodeFn({ address }));
  }

  getCurrentLocation ( ) {
    return this.$q((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject)).then(
            ({ coords: { latitude, longitude } }) => ({ lat: ( ) => latitude, lng: ( ) => longitude }),
            e => {
              console.warn('Can not detect locatoin, switching pointer "New York, NY 10128, USA"');
              return { lat: ( ) => 40.7816, lng: ( ) => -73.9511 };
            }
        );
  }
}

export default angular.module('GoogleGeoLocationService', [
  // 'uiGmapgoogle-maps'
])
  .provider('uiGmapGoogleMapApi', function() {
    this.configure = () => {}
    this.$get = () => {
      Promise.resolve()
    }
  })
  .service('GoogleGeoLocationService', GoogleGeoLocationService)
  .name;
