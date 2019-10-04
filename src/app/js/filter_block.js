(function ($, Drupal, drupalSettings) {

    'use strict';
	
	Drupal.behaviors.filter_block = {
	  attach: function (context) {
	    
	  }
	}

	// Little block with filter
	var filter = '#filter .mapFilter__content';
	var $filter = $(filter);
	// Spoiler button
	var spoiler_button = '.mapFilter__spoiler-button';
	var $spoiler_button = $(spoiler_button);

	// block with filter must be draggable only if it is desktop
	if ($(window).width() > 1170) {
		$filter.draggable({ containment: "#map", scroll: false,  cancel: '.-nodrag' });
	}

	// when user click spoiler button
	$spoiler_button.click(function(e){
		// we get css top position
		var topPosition = parseInt($filter.css('top').replace('px', ''));
		// add or remove -closed class for block with filter
		$filter.toggleClass('-closed');
		// add or remove active class for spoiler
		$(this).toggleClass('active');
		// if top more than 30px 
		if (topPosition >= 30){
			//we make filter equals 30px
			$filter.css('top', '30px');			
		}
	});

})(jQuery, Drupal, drupalSettings);
