/*!
 * Drupal UI Popup Menu
 *
 * Extends Drupal UI Popup
 */

;(function( $, w, d, undefined ) {

  'use strict';

  $.widget( "drupal.menu", $.drupal.component, {

    options: {}

  , _create: function( event ) {

      $.drupal.component.prototype._create.apply(this, arguments);

      // Set instance variables
      this.items = this.element.find('.js-menu__item');
      this.activeDescendent = null;

      // DOM changes
      this.element.attr('tabindex', '-1');
      this.items.each( function() {
        $(this).uniqueId();
      });

      // Private event handlers
      this._on({
        'focusout': function( event ) {
          this.activeDescendent = null;
          this.element.removeAttr( 'aria-activedescendent' );
        }

      , 'focusin .js-menu__item': function( event ) {
          this.activeDescendent = $(event.target);
          this.element.attr( 'aria-activedescendent', this.activeDescendent.attr('id') );
        }

      , 'mouseenter': function( event ) {
          this.element.find(':focus').trigger('blur');
        }

      , 'keydown': function( event ) {
          switch ( event.keyCode ) {
            case $.ui.keyCode.DOWN:
            case $.ui.keyCode.UP:
              event.preventDefault();
              var direction = event.keyCode === $.ui.keyCode.DOWN ? 'next' : 'previous';

              if ( this.activeDescendent !== null ) {
                this[ direction + 'Item' ]( event );
              }
              else {
                this.activeDescendent = this.items.first();
                this._focusItem( this.activeDescendent );
              }
          }
        }
      });

      // Public handlers using pub/sub
      // @see devpatch.com/articles/2010-03-22-communication-between-jquery-ui-widgets/
      // this.element.bind( 'drupal:eventName', $.proxy( this.eventHandler, this ) );
      // this.element.bind( 'drupal:popupOpen', $.proxy( function( event, source ) {
      //   // console.log(source);
      //   // console.log(this.element.closest('.offset-parent'));
      //   // console.log(this.element.closest(source));

      //   if ( this.element.closest(source).length ) {
      //     if ( this.activeDescendent !== null ) {
      //       this._focusItem( this.activeDescendent );
      //     } else {
      //       this.element.trigger('focus');
      //     }
      //   }
      // }, this ) );
    }

  , _destroy: function() {
      // Revert DOM changes
      this.element.removeAttr('tabindex');
      this.items.each( function() {
        $(this).removeUniqueId();
      });
    }

  , _focusItem: function( item ) {
      item.trigger('focus');
    }

  , _adjacentItem: function( direction, event ) {
      var targetItem, targetIndex;
      var increment = direction === 'previous' ? -1 : 1;

      targetIndex = this.items.index(this.activeDescendent) + increment;

      if ( typeof targetIndex !== 'number' || targetIndex < 0 ) {
        targetIndex = 0;
      }
      else if ( targetIndex > this.items.length - 1 ) {
        targetIndex = this.items.length - 1;
      }
      targetItem = this.items.eq(targetIndex);

      this._focusItem( targetItem );
    }

  , nextItem: function( event ) {
      this._adjacentItem( 'next', event );
    }

  , previousItem: function( event ) {
      this._adjacentItem( 'previous', event );
    }

  });

})( jQuery, window, document );
