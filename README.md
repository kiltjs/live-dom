
# live-dom

[![npm](https://img.shields.io/npm/v/live-dom.svg?maxAge=2592000)](https://www.npmjs.com/package/live-dom) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/kiltjs/nitro/master/LICENSE)

DOM auto discover library, allows define behaviors for given css selectors indepedently of when nodes are attached to document.

### Installation

``` sh
npm install live-dom --save

# or throw bower
bower install live-dom --save
```

### Usage

``` js

$live('.btn.submit-login', function (btn) {

  btn.addEventListener('click', function (e) {
    user.login();
  });

});

```

### Forms

Initialize automatically html forms based on name attribute.

``` html
<form name="login">
  <input type="text" name="username"></input>
  <input type="password" name="password"></input>
</form>
```

``` js

$live.form('login', function (form) {

  form.addEventListener('submit', function (e) {
    fetch('/api/signin', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: form.elements['username'].value,
        password: form.elements['password'].value,
      })
    });
  });

});

```

### Components

$live.components implements a wrapper around customElements V1. Using customElements v0 or $live-dom as fallbacks.

``` js
$live.component('login-form', {
  template: `
    <form name="login">
      <input type="text" name="username"></input>
      <input type="password" name="password"></input>
    </form>
  `,
  controller: function (loginForm) {
    var form = loginForm.querySelector('form');

    form.addEventListener('submit', function (e) {
      fetch('/api/signin', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: form.elements['username'].value,
          password: form.elements['password'].value,
        })
      });
    });
  }
});

```
