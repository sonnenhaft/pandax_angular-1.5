export default class User {

  constructor (Storage, Constants, Request, $state, $http, Helper, $q) {
    'ngInject';

    _.assign(this, {Storage, Constants, Request, $state, $http, Helper, $q, userAvatarSrc: '', billingInfo: {}});
  }

  isAuth () {
    return this.Storage.getObject('MINX').user ? true : false;
  }

  token () {
    if (this.isAuth()) {
      return this.Storage.getObject('MINX').token;
    }
  }

  get (param) {
    return param ?
      this.Storage.getObject('MINX').user[param] :
      this.Storage.getObject('MINX').user;
  }

  update (object) {
    let session = this.Storage.getObject('MINX');

    this.Storage.setObject('MINX', _.assign(
      session, {
        user: _.assign(session.user, object)
      }
    ));
  }

  create (user) {
    user.data.role = user.data.role === 'client' ?
      'customer' :
      user.data.role;

    this.Storage.setObject('MINX', {
      token: user.token,
      user: _.assign(user.data, {
        auth: user.data.first_name && user.data.last_name
      })
    });
  }

  login (credentials) {
    return this
      .Request
      .send(
        false,
        this.Constants.api.login.method,
        this.Constants.api.login.uri,
        {
          email: credentials.email,
          password: credentials.password
        }
      )
      .then(
        result => {
          if (result.data.message) {
            return {
              error: result.data.message
            };
          }

          this.create(result.data);
          return this.getUserProfile(result.data, this.get('role'));
        }
      );
  }

  register (credentials) {
    return this
      .Request
      .send(
        false,
        this.Constants.api.signup.method,
        this.Constants.api.signup.uri(credentials.type),
        {
          email: credentials.email,
          password: credentials.password
        }
      )
      .then(
        result => {
          if (result.data.detail) {
            return {
              error: result.data.detail
            };
          }

          return this.login(credentials);
        }
      );
  }

  restore (email) {
    return this
      .Request
      .send(
        false,
        this.Constants.api.password.restore.method,
        this.Constants.api.password.restore.uri,
        email
      )
      .then(
        result => {
          if (result.data.detail) {
            return {
              error: result.data.detail
            };
          }

          return result;
        }
      );
  }

  reset (password, token) {
    return this
      .Request
      .send(
        false,
        this.Constants.api.password.change.method,
        this.Constants.api.password.change.uri(token),
        password
      )
      .then(
        result => {
          if (result.data.detail) {
            return {
              error: result.data.detail
            };
          }

          return result;
        }
      );
  }

  changeByOld (passwordOld, passwordNew) {
    return this
      .Request
      .send(
        false,
        this.Constants.api.password.changeByOld.method,
        this.Constants.api.password.changeByOld.uri(),
        {
          old_password: passwordOld,
          new_password: passwordNew
        }
      )
      .then(
        result => {
          if (result.data.detail) {
            return {
              error: result.data.detail
            };
          }

          return result;
        }
      );
  }


  getUserProfile (user, type, redirectUser = true) {
    let result;

    if (type == 'admin') {      
      result = this.$q.defer().resolve(user);
      if (redirectUser == true) {
        this.redirectUser();
      }
    } else {
      result = this
      .Request
      .send(
        user.token,
        this.Constants.api.profile.method.GET,
        this.Constants.api.profile.uri(type)
      )
      .then(
        result => {
          this.update(result.data);
          if (redirectUser == true) {
            this.redirectUser();
          }
          this.setUserAvatarSrc(result.data);
          return result.data;
        }
      );
    }

    return result;
  }

  UpdateUserProfile (fields) {
    return this
      .Request
      .send(
        this.token(),
        this.Constants.api.profile.method.PUT,
        this.Constants.api.profile.uri(this.get('role')),
        fields
      )
      .then(
        result => {
          this.update(result.data);
          return result.data;
        }
      );
  }

  UpdateUserPhoto (file, slot) {
    return this.Request
      .send(
        this.token(),
        this.Constants.api.photo.method,
        this.Constants.api.photo.uri(this.get('role'), slot),
        file
      )
      .then(
        result => {
          if (slot == 1) {
            this.setUserAvatarSrc(result.data)
          }
          return result.data;
        }
      )
  }

  redirectUser () {
    switch (true) {
      case this.get('role') === 'customer':
        this.$state.go('main.order');
        return false;

      case this.get('role') === 'admin':
        this.$state.go('admin.entertainers');
        return false;

      case !this.get('first_name') || !this.get('last_name'):
        this.$state.go('main.profile.create');
        return false;

      default:
        this.$state.go('main.profile.view');
    }
  }

  logout () {
    this.Storage.remove('MINX');
    setTimeout(() => this.$state.go('home'), 1);
  }

  /*
    User avatar section
   */
  fetchUserAvatarSrc () {
    let result = this.getUserAvatarSrc();

    if (!result) {
      result = this.getUserProfile(_.assign(this.get(), {token: this.token()}), this.get('role'), false)
        .then(data => {
          return this.setUserAvatarSrc(data);
        });
    }

    return result;
  }

  setUserAvatarSrc (data = {}) {
    let photoSrc = this.Constants.user.avatar.empty;

    if (data.photo && data.photo.preview) {
      photoSrc = data.photo.preview;
    } else if (data.photos && data.photos[0] && data.photos[0].preview) {
      photoSrc = data.photos[0].preview;
    }

    if (!photoSrc || photoSrc.length == 0) {
      photoSrc = this.Constants.user.avatar.empty;
    }

    return this.userAvatarSrc = photoSrc + '?' + this.Helper.getUniqueNumberByTime();
  }

  getUserAvatarSrc () {
    return this.userAvatarSrc;
  }

  fetchBillingInfo () {
    return this.billingInfo;
  }
}