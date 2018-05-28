/* global describe, it, assert, component */

describe('live selector', function () {

  it('uls', function(done) {

    function _assertFn1 (attr_name, old_value, new_value) {
      assert.strictEqual(attr_name, 'data-test');
      assert.strictEqual(old_value, null);
      assert.strictEqual(new_value, 'foobar');
      _assertFn = _assertFn2;
    }

    function _assertFn2 (attr_name, old_value, new_value) {
      assert.strictEqual(attr_name, 'data-test');
      assert.strictEqual(old_value, 'foobar');
      assert.strictEqual(new_value, 'barfoo');

      done();
    }

    var _assertFn = _assertFn1;

    component('attribute-tag', {
      onAttributeChanged: function (attr_name, old_value, new_value) {
        _assertFn(attr_name, old_value, new_value);
      }
    });

    document.body.innerHTML = '';

    var attribute_tag_el = document.createElement('attribute-tag');

    document.body.appendChild(attribute_tag_el);

    setTimeout(function () {
      attribute_tag_el.setAttribute('data-test', 'foobar');
      setTimeout(function () {
        attribute_tag_el.setAttribute('data-test', 'barfoo');
      }, 10);
    }, 100);

  });

});
