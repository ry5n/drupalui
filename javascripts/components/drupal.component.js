/*!
 * Drupal UI Base Component
 * 
 * Inherits from the jQuery UI Widget Factory and overrides a number of methods
 * fromt the base Widget.
 */

;(function( $, w, d, undefined ) {

  'use strict';

  // define your widget under a namespace of your choice with additional
  // parameters, e.g.
  // $.widget( "namespace.widgetname", (optional) - an
  // existing widget prototype to inherit from, an object
  // literal to become the widget's prototype );

  $.widget( "drupal.component", $.Widget, {
    
    // Add a data-attribute to the component instance so we can query
    // the DOM for all of the Drupal components. Useful for simple
    // pub/sub like so: $('[data-component]').trigger('drupal:event');
    // For production code, the data-attributes should use a Drupal
    // namespace, like data-DrupalUI-component, or shorthand like
    // data-DCUI-component (Drupal Core UI).
    _create: function() {
      this.element.attr( 'data-component', this.widgetName );
    }
    
    // Overriding the following methods (destroy, _on, _hoverable, _focusable) 
    // is dumb, but jQuery UI doesn’t allow us to configure the state classes 
    // like 'ui-state-disabled'. It has been done here as an easy way to 
    // achive (better) SMACSS conventions, so we have 'is-disabled' etc.
  , destroy: function() {
      this._destroy();
      // we can probably remove the unbind calls in 2.0
      // all event bindings should go through this._on()
      this.element
        .unbind( this.eventNamespace )
        // 1.9 BC for #7810
        // TODO remove dual storage
        .removeData( this.widgetName )
        .removeData( this.widgetFullName )
        .removeAttr( 'data-component' );
      this.widget()
        .unbind( this.eventNamespace )
        .removeAttr( "aria-disabled" )
        .removeClass( "is-disabled" );

      // clean up events and states
      this.bindings.unbind( this.eventNamespace );
      this.hoverable.removeClass( "is-hovered" );
      this.focusable.removeClass( "is-focused" );
    }

  , _setOption: function( key, value ) {
      this.options[ key ] = value;

      if ( key === "disabled" ) {
        this.widget()
          .toggleClass( "is-disabled", !!value )
          .attr( "aria-disabled", value );
        this.hoverable.removeClass( "is-hovered" );
        this.focusable.removeClass( "is-focused" );
      }

      return this;
    }

  , _on: function( suppressDisabledCheck, element, handlers ) {
      var delegateElement,
        instance = this;

      // no suppressDisabledCheck flag, shuffle arguments
      if ( typeof suppressDisabledCheck !== "boolean" ) {
        handlers = element;
        element = suppressDisabledCheck;
        suppressDisabledCheck = false;
      }

      // no element argument, shuffle and use this.element
      if ( !handlers ) {
        handlers = element;
        element = this.element;
        delegateElement = this.widget();
      } else {
        // accept selectors, DOM elements
        element = delegateElement = $( element );
        this.bindings = this.bindings.add( element );
      }

      $.each( handlers, function( event, handler ) {
        function handlerProxy() {
          // allow widgets to customize the disabled handling
          // - disabled as an array instead of boolean
          // - disabled class as method for disabling individual parts
          if ( !suppressDisabledCheck &&
              ( instance.options.disabled === true ||
                $( this ).hasClass( "is-disabled" ) ) ) {
            return;
          }
          return ( typeof handler === "string" ? instance[ handler ] : handler )
            .apply( instance, arguments );
        }

        // copy the guid so direct unbinding works
        if ( typeof handler !== "string" ) {
          handlerProxy.guid = handler.guid =
            handler.guid || handlerProxy.guid || $.guid++;
        }

        var match = event.match( /^(\w+)\s*(.*)$/ ),
          eventName = match[1] + instance.eventNamespace,
          selector = match[2];
        if ( selector ) {
          delegateElement.delegate( selector, eventName, handlerProxy );
        } else {
          element.bind( eventName, handlerProxy );
        }
      });
    }

  , _hoverable: function( element ) {
      this.hoverable = this.hoverable.add( element );
      this._on( element, {
        mouseenter: function( event ) {
          $( event.currentTarget ).addClass( "is-hovered" );
        },
        mouseleave: function( event ) {
          $( event.currentTarget ).removeClass( "is-hovered" );
        }
      });
    }

  , _focusable: function( element ) {
      this.focusable = this.focusable.add( element );
      this._on( element, {
        focusin: function( event ) {
          $( event.currentTarget ).addClass( "is-focused" );
        },
        focusout: function( event ) {
          $( event.currentTarget ).removeClass( "is-focused" );
        }
      });
    }

  });

})( jQuery, window, document );
