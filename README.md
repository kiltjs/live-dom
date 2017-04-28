
# live-dom

DOM auto-discover library. Initialize matched nodes automatically.

[![npm](https://img.shields.io/npm/v/live-dom.svg)](https://www.npmjs.com/package/live-dom) [![bower](https://img.shields.io/bower/v/live-dom.svg)](http://bower.io/search/?q=live-dom)
[![Build Status](https://travis-ci.org/kiltjs/live-dom.svg?branch=master)](https://travis-ci.org/kiltjs/live-dom)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

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
