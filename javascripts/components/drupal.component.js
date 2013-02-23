/*!
 * Drupal UI Base Component
 * 
 * Inherits from the jQuery UI Widget Factory and overrides a number of methods
 * from the base Widget. This is dumb, reasons are inline. Note that original
 * comments that come from the jQuery UI source have been removed to avoid
 * confusion with comments on the overridden methods. For original code, see:
 * https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.widget.js
 */

;(function( $, w, d, undefined ) {

  'use strict';

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
      this.element
        .unbind( this.eventNamespace )
        .removeData( this.widgetName )
        .removeData( this.widgetFullName )
        .removeAttr( 'data-component' );
      this.widget()
        .unbind( this.eventNamespace )
        .removeAttr( "aria-disabled" )
        .removeClass( "is-disabled" );

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

      if ( typeof suppressDisabledCheck !== "boolean" ) {
        handlers = element;
        element = suppressDisabledCheck;
        suppressDisabledCheck = false;
      }

      if ( !handlers ) {
        handlers = element;
        element = this.element;
        delegateElement = this.widget();
      } else {
        element = delegateElement = $( element );
        this.bindings = this.bindings.add( element );
      }

      $.each( handlers, function( event, handler ) {
        function handlerProxy() {
          if ( !suppressDisabledCheck &&
              ( instance.options.disabled === true ||
                $( this ).hasClass( "is-disabled" ) ) ) {
            return;
          }
          return ( typeof handler === "string" ? instance[ handler ] : handler )
            .apply( instance, arguments );
        }

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
