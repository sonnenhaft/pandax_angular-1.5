import PandaHttpInterceptor from './panda-app.http-interceptor';
import localStorage from './common/SafeLocalStorage';

export default angular.module('panda-stubs', [
  PandaHttpInterceptor
]).config($provide => {
  'ngInject';

  $provide.decorator('$http', ($delegate, $q, $window, PandaHttpInterceptor) => {
    const $http = $delegate;
    const role = 'provider';
    const orderId = 113;
    if ($window.location.href.includes('stub') || localStorage.stub) {
      const mocks = {
        '/api/sessions': { data: { role }, token: 1 },
        [`/api/${role}/profile`]: { data: { role } },
        [`/api/${role}/service-types`]: { data: {  } },
        [`/api/${role}/orders/history?page=1&include=invites`]: { data: {items: [{
              startDt: new Date(),
              worked_time: 30*60,
              cost: 50,
              finalCost: 60
            }, {}]}, meta: {pagination: {}}  },
        [`/api/${role}/orders/last-not-accomplished`]: [],
        '/api/orders/1/entertainers/search': [{}],
        [`/api/${role}/orders/1/invites`]: { items: [] },
        [`/api/orders/${orderId}`]: { serviceType: {} },
        [`/api/orders/${orderId}/entertainers/search`]: {},
        [`/api/${role}/orders?page=1&status[]=accepted&status[]=in+progress&include=invites`]: { items: [] },
        [`/api/${role}/orders/${orderId}/invites`]: { items: [] },
        [`/api/${role}/service-types`]: [],
        [`/api/${role}/unratedinvites`]: [
          { id: 204, order_id: 102, location: 'vulica Prytyckaha 2, Minsk, Belarus', location_notes: '111' },
          { id: 204, order_id: 102, location: 'vulica Prytyckaha 3, Minsk, Belarus', location_notes: '111', provider: { displaying_name: 'John7' } },
          { id: 204, order_id: 102, location: 'vulica Prytyckaha 4, Minsk, Belarus', location_notes: '111', finish_dt: '2016-11-02T14:24:50+00:00' }
        ]
      };

      const mock = (config, fn, args) => {
        const url = PandaHttpInterceptor.request(config).url;
        console.log(url);
        if (mocks[url]) {
          return $q.when({ data: mocks[url] });
        } else {
          return fn.apply($http, args); // eslint-disable-line prefer-rest-params
        }
      };

      const $httpMock = function $httpMock (config) {
        return mock(config, $http, arguments); // eslint-disable-line prefer-rest-params
      };
      Object.assign($httpMock, $http);
      ['get', 'put', 'update', 'delete'].forEach(key => {
        $httpMock[key] = function $httpMethodMock (url) {
          return mock({ url }, $http[key], arguments); // eslint-disable-line prefer-rest-params
        };
      });
      return $httpMock;
    } else {
      return $http;
    }
  });
}).name;
