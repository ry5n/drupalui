/*!
 * Drupal UI Popup
 */

;(function( $, w, d, undefined ) {

  'use strict';

  // define your widget under a namespace of your choice with additional
  // parameters, e.g.
  // $.widget( "namespace.widgetname", (optional) - an
  // existing widget prototype to inherit from, an object
  // literal to become the widget's prototype );

  $.widget( "drupal.popup", $.drupal.component, {

    // Default options
    options: {
      position: {
        my: "left top+2",
        at: "left bottom",
        of: null
      }
    }

    // Constructor
    // Create elements, add attributes, bind events, etc.
  , _create: function() {

      $.drupal.component.prototype._create.apply(this, arguments);

      // Set instance variables
      this.isActive = false;
      this.belongsTo = this.element;

      if ( this.element.closest('.js-split-button').length ) {
        this.belongsTo = this.element.closest('.js-split-button');
        this.options.position.of = this.belongsTo;
      }

      // make DOM changes
      this.popup = $( '#' + this.element.attr('data-target') );

      if ( !this.popup.length ) {
        throw new Error(
          'Drupal UI popups must define a target using data-target="id".'
        );
      }
      else {
        this.popup.insertAfter(this.element);
      }

      // Private event handlers
      this._on( this.element, {
        'click': 'toggle'

      , 'keydown': function( event ) {
          switch ( event.keyCode ) {
            case $.ui.keyCode.DOWN:
              if ( this.isActive ) {
                var tabbables = this.popup.find(':tabbable');
                if ( event.keyCode === $.ui.keyCode.UP ) {
                  tabbables.last().trigger('focus');
                } else {
                  tabbables.first().trigger('focus');
                }
              }
              else {
                this._open();
              }
              break;
            case $.ui.keyCode.TAB:
              if ( this.isActive ) {
                if ( event.shiftKey && this.options.position.at.split(' ')[1] !== 'top' ) {
                  this.close();
                }
                else if ( !event.shiftKey && this.options.position.at.split(' ')[1] === 'top' ) {
                  this.close();
                }
              }
              break;
          }
        }
      });

      this._on( this.document, {
        'click': function( event ) {
          if ( !$(event.target).closest(this.popup).length ) {
            this.close();
          }
        }

      , 'keydown': function( event ) {
          switch ( event.keyCode ) {
            case $.ui.keyCode.ESCAPE:
              this.close();
              if ( $(event.target).closest(this.popup).length || event.target === this.element[0] ) {
                this.element.trigger('focus');
              }
              break;

            case $.ui.keyCode.TAB:
              var focus = this.popup.find(':focus');

              // Prevent tabbing away from the popup
              if ( focus.length ) {
                var tabbables = this.popup.find(':tabbable');

                if ( event.shiftKey && focus[0] === tabbables.first()[0] ) {
                  event.preventDefault();
                  tabbables.first().trigger('focus');
                  // this.close();
                }
                else if ( !event.shiftKey && focus[0] === tabbables.last()[0] ) {
                  event.preventDefault();
                  tabbables.last().trigger('focus');
                  // this.close();
                }
              }
          }
        }
      });

      // Public event handlers using pub/sub
      // @see devpatch.com/articles/2010-03-22-communication-between-jquery-ui-widgets/
      // this.element.bind( 'drupal:eventName', $.proxy( this.eventHandler, this ) );
      this.element.bind( 'drupal:popupOpen', $.proxy( function( event, source ) {
        if ( source !== this ) {
          this.close();
        }
      }, this ) );
    }

  , _refresh: function() {
      this._positionPopup();
    }

    // Destroy an instantiated plugin. Events bound via _on are removed
    // automatically; revert other DOM modifications here.
  , _destroy: function() {
      // remove generated elements
      // this.element.removeStuff();
    }

  , _open: function() {

      // state changes
      this.isActive = true;

      // DOM changes
      this.element.addClass('is-active');
      this._positionPopup();
      this.popup
        .addClass('is-open')
        .attr('aria-hidden', 'false')
        .css('min-width', this.belongsTo.outerWidth())
        .find(':focusable').first().trigger('focus');

      // When open, popups need re-positioning on resize
      this._on( this.window, {
        'resize': function( event ) {
          this._positionPopup(event);
        }
      });

      // Publish messages
      $('[data-component]').trigger('drupal:popupOpen', this);
    }

  , _positionPopup: function() {
      this.popup.position({
        my: this.options.position.my,
        at: this.options.position.at,
        of: this.options.position.of || this.element
      });
    }

    // _setOptions is called with a hash of all options that are changing;
    // always refresh when changing options
  , _setOptions: function() {
      // _super and _superApply handle keeping the right this-context
      this._superApply( arguments );
      this._refresh();
    },

    // _setOption is called for each individual option that is changing
    _setOption: function( key, value ) {
      this._super( key, value );
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

  , close: function() {
      var self = this;

      self.popup.addClass('is-transitioning-out');
      self.popup.fadeOut(160, function() {
        self.popup.removeClass('is-open')
            .attr('aria-hidden', 'true')
            .removeAttr('style')
            .removeClass('is-transitioning-out');

        self.isActive = false;
        self.element.removeClass('is-active');
      });

      // When closed, remove the window resize listener.
      this._off( this.window, 'resize' );
    }

  , toggle: function( event ) {
      if ( this.popup.length ) {
        event.stopPropagation();
        event.preventDefault();

        if ( this.isActive ) {
          this.close();
        } else {
          this._open();
        }
      }
    }

  });

})( jQuery, window, document );
