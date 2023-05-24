 class Api {
  constructor(options) {
    this._url = options.baseUrl;
    this._headers = options.headers;
  }

  _checkStatusRequest(res) {
    if (res.ok) {
      return res.json();
    }
    return Promise.reject(`Ошибка: ${res.status}`);
  }

  //попробовать как работает
  _request(url, options) {
    return fetch(url, options).then(this._checkStatusRequest)
  }

  getUserInfo() {
    return  this._request(`${this._url}/users/me`, {
      method: "GET",
      headers: this._headers,
    })
  }

  // getUserInfo() {
  //   return fetch(`${this._url}/users/me`, {
  //     method: "GET",
  //     headers: this._headers,
  //   }).then((res) => this._checkStatusRequest(res));
  // }

  editUserInfo({ name, about }) {
    return fetch(`${this._url}/users/me`, {
      method: "PATCH",
      headers: this._headers,
      body: JSON.stringify({
        name: name,
        about: about,
      }),
    }).then((res) => this._checkStatusRequest(res));
  }

  editUserAvatar({ avatar }) {
    return fetch(`${this._url}/users/me/avatar`, {
      method: "PATCH",
      headers: this._headers,
      body: JSON.stringify({
        avatar: avatar,
      }),
    }).then((res) => this._checkStatusRequest(res));
  }

  getInitialCards() {
    return fetch(`${this._url}/cards`, {
      method: "GET",
      headers: this._headers,
    }).then((res) => this._checkStatusRequest(res));
  }

  addNewCard(data) {
    return fetch(`${this._url}/cards`, {
      method: "POST",
      headers: this._headers,
      body: JSON.stringify({
        name: data.name,
        link: data.link,
      }),
    }).then((res) => this._checkStatusRequest(res));
  }

  deleteCard(cardId) {
    return fetch(`${this._url}/cards/${cardId}`, {
      method: "DELETE",
      headers: this._headers,
    }).then((res) => this._checkStatusRequest(res));
  }

  putLike(cardId) {
    return fetch(`${this._url}/cards/${cardId}/likes`, {
      method: "PUT",
      headers: this._headers,
    }).then((res) => this._checkStatusRequest(res));
  }

  deleteLike(cardId) {
    return fetch(`${this._url}/cards/${cardId}/likes`, {
      method: "DELETE",
      headers: this._headers,
    }).then((res) => this._checkStatusRequest(res));
  }
}

const api = new Api({
  baseUrl: "https://mesto.nomoreparties.co/v1/cohort-63",
  headers: {
    authorization: "22a3f4d4-5ffd-4789-9813-a7106adf4dad",
    "Content-Type": "application/json",
  },
});

export default api