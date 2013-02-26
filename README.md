# drupalui

Experimental set of UI components for Drupal, focusing on the D8 version of the Seven admin theme. This code was build primarily as a proof-of-concept for [the new CSS coding standards](http://drupal.org/node/1886770) recently adopted by the community. However, it also implements some of the UI components proposed in the [Style Guide](http://groups.drupal.org/node/283223) that myself and the Drupal UX team have been working on for Seven.

## Demo
[demo](http://ryanfrederick.com/sandbox/d8/seven/)

## On the code

The code presently focuses on the splitbutton component, and necessarily implements the components on which it depends (button, popup, menu).

## Known issues

Currently popups are not correctly positioned in Firefox.

## Code review is welcome

I made an effort to code the components to all of our current standards, including accessibility. The components are keyboard-navigable, and work fairly well in VoiceOver, but I have not tested in other screen readers. I would love to receive feedback on any aspects of code quality and performance. Incidentally, I am aware that the JavaScript in particular is not of the highest quality.

**Important**: I have used a hacked version of Modernizr and jQuery UI to build this. Modernizr was modified to output the following classes on `<html>`, as suggested in an earlier draft of the new coding standards: for supported features, `supports-{feature}` and for unsupported, the standard `no-{feature}`. This is non-standard behaviour for Modernizr and probably should not be used in any shipping code. The current version of the CSS coding standards for Drupal suggest classes of `has-{feature}` and `has-no-{feature}`, however, this remains up for debate. jQuery UI has not been directly hacked, but a base widget is used in this code that overrides some of the default private methods (including `destroy()`) from the jQuery UI Widget Factory so that the class names conform to the SMACSS standard being adopted in Drupal 8. This would also not fly for shipping code, so if we use jQuery UI to implement this work for Drupal 8, we may need to submit a pull request to the project (for configurable classes) or find another solution.
