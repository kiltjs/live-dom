/* global describe, it, assert, $live */
describe('live selector', function () {

    it('uls', function(done) {

      var uls = 0;

      document.body.innerHTML = '';

      $live('ul', function (ul) {
        uls++;
        ul.innerHTML = 'ul-' + uls;
      });

      setTimeout(function () {

        assert.strictEqual(uls, 4);
        assert.strictEqual(document.body.innerHTML, '<ul>ul-1</ul><ul>ul-2</ul><ul>ul-3</ul><ul>ul-4</ul>');
        done();

      }, 10);

      document.body.innerHTML = '<ul></ul><ul></ul><ul></ul><ul></ul>';

    });

});
