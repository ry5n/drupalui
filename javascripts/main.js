/*!
 * Main
 */
(function( $, w, d ) {
  'use strict';

  $(d).ready(function() {
    $('.js-component').component();
    $('.js-popup').popup();
    $('.js-menu').menu();
  });

})( jQuery, this, document );
