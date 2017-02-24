(function($) {
	
	var initPlugin = function() {
		// $('head').append('<link rel="stylesheet" href="tourdewebpage.css" type="text/css" />');
		$("body")
			.find("*")
			.andSelf()
			.each(function() {
				zindex = parseInt($(this).css('z-index'));
				if (zindex > zHighVal) zHighVal = zindex;
			});
		
		
		// Add some event listeners...
		$(document).on("tour-next", function(){
			var element = $.fn.tourdewebpage.vars.objects[$.fn.tourdewebpage.vars.step].element;
			$(element).css("z-index", $.fn.tourdewebpage.vars.oldZIndex);
			$(element).removeClass($.fn.tourdewebpage.defaults.activeComponentClass);
			$($.fn.tourdewebpage.defaults.arrowAllSelector).hide();
			$.fn.tourdewebpage.vars.step++;
			$.fn.tourdewebpage.show($.fn.tourdewebpage.vars.step);
		});
		
		$(document).on("tour-prev", function(){
			var element = $.fn.tourdewebpage.vars.objects[$.fn.tourdewebpage.vars.step].element;
			$(element).css("z-index", $.fn.tourdewebpage.vars.oldZIndex);
			$(element).removeClass($.fn.tourdewebpage.defaults.activeComponentClass);
			$($.fn.tourdewebpage.defaults.arrowAllSelector).hide();
			$.fn.tourdewebpage.vars.step--;
			$.fn.tourdewebpage.show($.fn.tourdewebpage.vars.step);
		});
		
		$(document).on("tour-end", function(){
			$.fn.tourdewebpage.end();
		});
		
		// Add overlays to body
		var wrapper = $('<div />')
			.addClass( 'tourdewebpage-overlay' )
			.css('z-index', zHighVal + 1)
			.appendTo( 'body' );
		var wrapper2 = $('<div />')
			.addClass('tourdewebpage-text-overlay' )
			.css('z-index', zHighVal + 2)
			.appendTo( 'body' );
		var arrowImg = $('<div id="arrow-box" style="position: relative; z-index: ' + (zHighVal + 2) + '"><svg width="275" height="155" class="arrow_canvas"><defs><marker id="arrowMarker" viewBox="0 0 36 21" refX="21" refY="10" markerUnits="strokeWidth" orient="auto" markerWidth="16" markerHeight="12"><path style="fill:none;stroke:#fff;stroke-width:2;" d="M0,0 c30,11 30,9 0,20"></path></marker></defs><path class="tourdewebpage-arrow" style="display:none; fill:none; stroke:#fff; stroke-width:3" marker-end="url(#arrowMarker)" d="M15,15 Q245,15 245,147" id="tourdewebpage_arrow_quadrant_3"></path><path class="tourdewebpage-arrow" style="display:none; fill:none; stroke:#fff; stroke-width:3" marker-end="url(#arrowMarker)" d="M245,147 Q8,147 15,15" id="tourdewebpage_arrow_quadrant_1"></path><path class="tourdewebpage-arrow" style="display:none; fill:none; stroke:#fff; stroke-width:3" marker-end="url(#arrowMarker)" d="M15,147 Q245,147 245,15" id="tourdewebpage_arrow_quadrant_2"></path><path class="tourdewebpage-arrow" style="display:none; fill:none; stroke:#fff; stroke-width:3" marker-end="url(#arrowMarker)" d="M245,15 Q15,15 15,147" id="tourdewebpage_arrow_quadrant_4"></path></svg></div>')
			.appendTo(wrapper2);
		var textBx = $('<div id="tourdewebpage-text-box" style="position: relative; z-index: ' + (zHighVal + 2) + '; border: 1px white"><span class="vcentered" id="tourdewebpage-text"></span><br /><div id="tourdewebpage-next-button"><button id="tourdewebpage-btn-prev" class="btn btn-success" onClick="$(this).trigger(\'tour-prev\')"><span class="fa fa-arrow-left"></span> Prev</span></button> <button id="tourdewebpage-btn-next" class="btn btn-success" onClick="$(this).trigger(\'tour-next\')">Next <span class="fa fa-arrow-right"></span></button> <button class="btn btn-success" onClick="$(this).trigger(\'tour-end\')">End <span class="fa fa-close"></span></button></div></div>')
			.appendTo(wrapper2);
		wrapper2.hide();


	}
	
	var zHighVal = 0;
	initPlugin();

	// Declare the plugin
	$.fn.tourdewebpage = function( options ) {
		$.fn.tourdewebpage.vars.settings = $.extend({}, $.fn.tourdewebpage.defaults, options);
		this.each(function() {
			var index = $($(this)[0]).attr($.fn.tourdewebpage.defaults.indexAttribute);
			var content = $($(this)[0]).attr($.fn.tourdewebpage.vars.settings.messageAttr)
			$.fn.tourdewebpage.vars.objects.push({index: index, element: $(this)[0], content: content});
		});
		$.fn.tourdewebpage.vars.objects.sort(compare);
		$.fn.tourdewebpage.start()
		return this;
	}
	
	$.fn.tourdewebpage.active = false;
	
	$.fn.tourdewebpage.start = function() {
		$($.fn.tourdewebpage.defaults.textOverlaySelector).show();
		$.fn.tourdewebpage.show(0);
		$("." + $.fn.tourdewebpage.vars.settings.overlayClass).show();
		$.fn.tourdewebpage.active = true;
	}
	
	$.fn.tourdewebpage.show = function(step) {
		if ($.fn.tourdewebpage.vars.objects.length <= 0) {
			$.fn.tourdewebpage.vars.objects.push({index: 1, element: null, content: 'Sorry, No help set up for this page.'});
		}
		if (step < $.fn.tourdewebpage.vars.objects.length && step >= 0) {
			var obj = $.fn.tourdewebpage.vars.objects[step];
			var element = obj.element;
			var quadrant = 1;
			var position =  {top: 0, left: 0};
			if (element && !$(element).is(":visible"))
			{
				$.fn.tourdewebpage.vars.step++;
				$.fn.tourdewebpage.show($.fn.tourdewebpage.vars.step);
				return;
			}
			if (element) {
				$.fn.tourdewebpage.vars.oldZIndex = $(element).css("z-index");
				quadrant = getQuadrant($(element));
				$(element).addClass($.fn.tourdewebpage.defaults.activeComponentClass);
				$(element).css("z-index", zHighVal + 10);
				position = getArrowPosition($(element), quadrant);
				$($.fn.tourdewebpage.defaults.arrowBoxSelector).css({top: position.top, left: position.left});
				$($.fn.tourdewebpage.defaults.arrowQuadrantSelectorPrefix + quadrant).show();
				positionTextBox(quadrant);
			}
			else {
				positionTextBox(quadrant);
				// position the text box in the exact center of the screen.
				var left = ($(window).width() - $('#tourdewebpage-text-box').outerWidth())/2;
				var top = ($(window).height() - $('#tourdewebpage-text-box').outerHeight())/2;
			}
			
			//$($.fn.tourdewebpage.defaults.textSelector).html($(element).attr($.fn.tourdewebpage.vars.settings.messageAttr));
			$($.fn.tourdewebpage.defaults.textSelector).html(obj.content);
			//id="tourdewebpage-btn-prev"
			(step == 0) ? $('#tourdewebpage-btn-prev').hide() : $('#tourdewebpage-btn-prev').show();
			(step == $.fn.tourdewebpage.vars.objects.length - 1) ? $('#tourdewebpage-btn-next').hide() : $('#tourdewebpage-btn-next').show();
		} else {
			$.fn.tourdewebpage.end();
		}
	}
	
	$.fn.tourdewebpage.end = function() {
		$($.fn.tourdewebpage.defaults.arrowAllSelector).hide();
		$($.fn.tourdewebpage.defaults.textOverlaySelector).hide();
		$("." + $.fn.tourdewebpage.vars.settings.overlayClass).hide();
		// Remove the objects???
		$.fn.tourdewebpage.vars.objects = [];
		$.fn.tourdewebpage.active = false;
		$.fn.tourdewebpage.vars.step = 0;
	}
	
	
	
	// Plugin Defaults
	$.fn.tourdewebpage.defaults = {
			overlayColor: '#ccc',
			textColor: '#fff',
			container: "body",
			overlayClass: 'tourdewebpage-overlay',
			overlayAttrs: {},
			messageAttr: "tourdewebpage-message",
			arrowBoxSelector: '#arrow-box',
			textSelector: '#tourdewebpage-text',
			arrowQuadrantSelectorPrefix: '#tourdewebpage_arrow_quadrant_',
			activeComponentClass: "tourdewebpage-active",
			arrowAllSelector: '.tourdewebpage-arrow',
			textOverlaySelector: '.tourdewebpage-text-overlay',
			indexAttribute: 'tourdewebpage-index'
	};
	
	$.fn.tourdewebpage.vars = {
			objects: [],
			settings: {},
			oldZIndex: 0,
			arrowOffset: 16 / 2, //$('#arrowMarker').width() / 2;
			arrowWidth: 275, //$('#arrow_canvas').width();
			arrowHeight: 155,
			step: 0,
			zHighVal: 0
	};
	
	var positionTextBox = function(quadrant) {
		// Text box height should be centered with the end of the arrow and the text centered vertically
		var arrowBox = $($.fn.tourdewebpage.defaults.arrowBoxSelector);
		var textBox = $('#tourdewebpage-text-box');
		var textBoxWidth = 400;
		var arrowOffset =  $('#arrow-box').offset();
		textBox.width(textBoxWidth);
		var top = arrowOffset.top;
		var left = 0;
		//var lineHeight = $('#tourdewebpage-text').css('line-height');
		var textAlign = 'left';
		switch (quadrant) {
			case 1:
				top = arrowOffset.top - 30;
				left = arrowOffset.left + $('.arrow_canvas').width();
				break;
			case 2:
				top = arrowOffset.top - 30;
				left = arrowOffset.left - textBoxWidth;
				var textAlign = 'right';
				break;
			case 3:
				top = arrowOffset.top - arrowBox.height();
				left = arrowOffset.left - textBoxWidth;
				var textAlign = 'right';
				break;
			case 4:
				top = arrowOffset.top - arrowBox.height();
				left = arrowOffset.left + $('.arrow_canvas').width();
				break;
		}
		textBox.css({top: top, left: left, 'text-align': textAlign});

	}
	
	var getQuadrant = function(element) {
		var hmiddle = ($(window).height() + element.height()) / 2;
		var vmiddle = ($(window).width() + element.width()) / 2;
		var position = $(element).offset();
		return hmiddle - position.top > 0 ? 
				(vmiddle - position.left - (element.width() / 2) > 0 ? 1 : 2) : 
				(vmiddle - position.left - (element.width() / 2) > 0 ? 4 : 3)
	}
	
	var getArrowPosition = function(element, quadrant) {
		var height = $(element).height();
		var width = $(element).width();
		var position = $(element).offset();
		var top = position.top;
		var left = position.left;
		switch (quadrant) {
			case 1:
				top = top + height;
				left = left + (width / 2);
				break;
			case 2:
				top = top + height;
				left = left - $.fn.tourdewebpage.vars.arrowWidth + ($.fn.tourdewebpage.vars.arrowOffset * 6);
				break;
			case 3:
				left = left - $.fn.tourdewebpage.vars.arrowWidth + ($.fn.tourdewebpage.vars.arrowOffset * 6);
				top = top - $.fn.tourdewebpage.vars.arrowHeight;
				break;
			case 4:
				left = left + (width / 2);
				top = top - $.fn.tourdewebpage.vars.arrowHeight;
				break;
		}
		return {top: top, left: left};
	}
	
	function compare(a,b) {
		  if (a.index < b.index)
		    return -1;
		  else if (a.index > b.index)
		    return 1;
		  else 
		    return 0;
	}
	
	
	
})(jQuery);