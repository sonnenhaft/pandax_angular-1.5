export default class Order {


  constructor (User, Constants, Request, Helper, moment, WebSocket) {
    'ngInject';

    _.assign(this, {
        User,
        Constants,
        Request,
        WebSocket,
        list: [],
        listInvited: [],
        providers: [],
        history: [],
        historyProvider: {},
        Helper,
        moment,
        orderDetails: {}
    });

  }

  fetchEntertainers(orderId) {
    return this
      .Request
      .send(
        null,
        this.Constants.api.searchEntertainers.method,
        this.Constants.api.searchEntertainers.uri(orderId)
      )
      .then(
        result => {
          return this.list = result.data;
        },
        error => console.log(error)
      );
  }

  getEntertainers() {
    return this.list;
  }

  getProviders() {
    return this.providers;
  }

  getProviderById(id) {
    return _.find(this.providers, ['type', id]);
  }

  getPastOrders() {
    return _.orderBy(this.history.past, order => order.datetime, 'desc');
  }

  getFutureOrders() {
    return _.sortBy(this.history.future, order => order.datetime);
  }

  getOrdersWithParam(id, type) {
    return _.find(this.history[type], ['id', Number(id)]);
  }

  /*
    Invited entertainers
  */
  fetchEntertainersInvited(orderId) {
    return this
      .Request
      .send(
        null,
        this.Constants.api.invitedEntertainers.method,
        this.Constants.api.invitedEntertainers.uri(orderId)
      )
      .then(
        result => {
          this.listInvited = result.data && result.data.items;
          return this.sortInvitedList();
        },
        error => console.log(error)
      );
  }

  getEntertainersInvited() {
    return this.listInvited;
  }


  buildOrder (form) {
    return {
      service_type: Number(_.head(this.Helper.getActiveObjectFromArray(this.getProviders())).type),
      length: parseFloat(form.hour).toString(),
      location: form.geo.location.formatted_address,
      coordinates: {
        lat: form.geo.coords.latitude.toString(),
        long: form.geo.coords.longitude.toString()
      },
      location_notes: form.notes ? form.notes : '',
      apartment: form.apt,
      asap: form.asap,
      datetime: form.asap ?
        this.moment() :
        this.moment(new Date(this.moment(form.date).format('YYYY/MM/DD') + ' ' + form.time)),
      entertainers_number: Number(form.entertainer),
      guests_number: form.guest.toString(),
      cost: form.price.toString()
    }
  }


  fetchOrderDetails(orderId) {
    return this
      .Request
      .send(
        null,
        this.Constants.api.orderDetails.method,
        this.Constants.api.orderDetails.uri(orderId)
      )
      .then(
        result => {
          return this.orderDetails = result.data;
        },
        error => console.log(error)
      );
  }


  fetchProviderPastOrders () {
    return new Promise((resolve, reject) => {
        this.historyProvider = {
          past: [
            {
              id: 1,
              customer: {
                photo: '/assets/images/photos/photo2-3x.png',
                name: 'Daniel',
                tel: "+ 9246 3415 5314",
                rating: 5
              },
              datetime: this.moment(new Date('08-24-2016 15:00')),
              service_type: 1,
              address: 'Santa Monica Fwy 2222',
              guests: 3,
              duration: '1h 30m',
              initial_price: 250
            },
            {
              id: 2,
              customer: {
                photo: '/assets/images/photos/photo3-3x.png',
                name: 'Daniel 2',
                tel: "+ 9246 3415 5314",
                rating: 5
              },
              datetime: this.moment(new Date('07-21-2016 12:30')),
              service_type: 3,
              address: '365 W Craig Rd #123, North Las Vegas, NV 89032, USA',
              guests: 1,
              duration: '2h',
              initial_price: 800
            }
          ],
          future: [
            {
              id: 1,
              datetime: this.moment(new Date('09-10-2016 18:30')),
              service_type: 1,
              address: 'Santa Monica Fwy 1110',
              guests: 3,
              duration: '1h 30m',
              initial_price: 250,
              provider: [
                {
                  name: 'Agnes',
                  duration: '1h 30m',
                  price: 100,
                  img: ''
                },
                {
                  name: 'Kimberly',
                  duration: null,
                  price: 50,
                  img: ''
                },
                {
                  name: 'Rebecca',
                  duration: null,
                  price: 0,
                  img: ''
                },
                {
                  name: 'Agnes',
                  duration: '1h 30m',
                  price: 100,
                  img: ''
                },
                {
                  name: 'Agnes',
                  duration: '45m',
                  price: 100,
                  img: ''
                }
              ]
            },
            {
              id: 2,
              active: true,
              datetime: new Date(),
              service_type: 3,
              address: '365 W Craig Rd #123, North Las Vegas, NV 89032, USA',
              guests: 1,
              duration: '2h',
              initial_price: 800,
              provider: [
                {
                  name: 'Lil',
                  duration: '2h',
                  price: 400,
                  img: ''
                },
                {
                  name: 'Sara',
                  duration: '2h',
                  price: 200,
                  img: ''
                }
              ]
            },
            {
              id: 3,
              asap: true,
              datetime: new Date(),
              service_type: 2,
              address: '1, 22262 Mission Blvd, Hayward, CA 94541, USA',
              guests: '2-3',
              duration: '1h',
              initial_price: 250,
              provider: [
                {
                  name: 'Lil',
                  duration: '1h',
                  price: 125,
                  img: ''
                },
                {
                  name: 'Sara',
                  duration: '1h',
                  price: 125,
                  img: ''
                }
              ]
            }
          ]
        };

        setTimeout(() => {
          resolve(this.historyProvider);
        }, 4000);
    })


  }

  getProviderPastOrders () {
    return _.orderBy(this.historyProvider.past, order => order.datetime, 'desc');
  }

  inviteEntertainer (orderId, entertainer) {
    return this
      .Request
      .send(
        null,
        this.Constants.api.inviteEntertainer.method,
        this.Constants.api.inviteEntertainer.uri(orderId, entertainer.id)
      )
      .then(
        result => {
          /*
            ToDo: talk to BE to get same response structure as getInvites
           */
          this.addEntertainerToInvitedList({provider: entertainer});
          return result.data;
        }
      );
  }

  getChannelNameOfOrder (orderId) {
    return this.fetchOrderDetails(orderId)
      .then(
        orderDetails => {
          return orderDetails.channel_name;
        },
        error => console.log(error)
      )
  }

  addEntertainerToInvitedList (entertainer) {
    this.listInvited.push(entertainer);
    return this.listInvited;
  }

  subcribeOnEntertainerInvite (channelName) {
    this.WebSocket.invites(channelName, this.setEntertainerConfirmed.bind(this));
  }

  unsubcribeOnEntertainerInvite () {
    this.WebSocket.close();
  }

  setEntertainerConfirmed (data) {
    let entertainer = _.find(this.listInvited, (item) => item.provider.id == data.provider_id);
    entertainer.status = this.Constants.order.statuses.accepted;
    entertainer.datetime = data.datetime;
    this.sortInvitedList();
  }

  sortInvitedList () {
    this.listInvited.sort((itemA, itemB) => {
        return this.moment(itemA.datetime) - this.moment(itemB.datetime);
    });
  }
}
