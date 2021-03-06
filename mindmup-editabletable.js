/*global $, window*/
$.fn.editableTableWidget = function (options) {
	'use strict';
	return $(this).each(function () {
		if(!$.isArray(options.editor))options.editor=[options.editor];
		var buildDefaultOptions = function () {
				var opts = $.extend({}, $.fn.editableTableWidget.defaultOptions);
				opts.editor = [opts.editor.clone()];
				return opts;
			},
			activeOptions = $.extend(buildDefaultOptions(), options),
			ARROW_LEFT = 37, ARROW_UP = 38, ARROW_RIGHT = 39, ARROW_DOWN = 40, ENTER = 13, ESC = 27, TAB = 9,
			element = $(this),
			editors = activeOptions.editor,
			editor,
			active,
			showEditor = function (select) {
				active = element.find('td:not([noedit]):focus');
				if (active.length) {
					var index = active.index();
					editor = (editors[index]) ? editors[index] : editors[0];
					editor.val(active.text())
						.removeClass('error')
						.show()
						.offset(active.offset())
						.css(active.css(activeOptions.cloneProperties))
						.width(active.width())
						.height(active.height())
						.focus();
					if (select) {
						editor.select();
					}
				}
			},
			setActiveText = function () {
				var text = editor.val(),
					evt = $.Event('change'),
					originalContent;
				if (active.text() === text || editor.hasClass('error')) {
					return true;
				}
				originalContent = active.html();
				active.text(text).trigger(evt, text);
				if (evt.result === false) {
					active.html(originalContent);
				}
			},
			movement = function (element, keycode, start, end) {
				start = (typeof start === 'undefined') ? true : start;
				end = (typeof end === 'undefined') ? true : end;
				if (keycode === ARROW_RIGHT && end) {
					return element.next('td');
				} else if (keycode === ARROW_LEFT && start) {
					return element.prev('td');
				} else if (keycode === ARROW_UP && start) {
					return element.parent().prev().children().eq(element.index());
				} else if (keycode === ARROW_DOWN && end) {
					return element.parent().next().children().eq(element.index());
				}
				return [];
			};
		$.each(editors,function(key,ed){
			ed.blur(function () {
				setActiveText();
				editor.hide();
			}).keydown(function (e) {
				if (e.which === ENTER) {
					setActiveText();
					editor.hide();
					active.focus();
					e.preventDefault();
					e.stopPropagation();
				} else if (e.which === ESC) {
					editor.val(active.text());
					e.preventDefault();
					e.stopPropagation();
					editor.hide();
					active.focus();
				} else if (e.which === TAB) {
					active.focus();
				} else {
					var possibleMove = movement(
						active, 
						e.which, 
						this.selectionEnd===0, 
						this.selectionStart===this.value.length
					);
					if (possibleMove.length > 0) {
						possibleMove.focus();
						e.preventDefault();
						e.stopPropagation();
					}
				}
			})
			.on('input paste', function () {
				var evt = $.Event('validate');
				active.trigger(evt, editor.val());
				if (evt.result === false) {
					editor.addClass('error');
				} else {
					editor.removeClass('error');
				}
			});
		});
		
		element.on('click keypress dblclick', showEditor)
		.css('cursor', 'pointer')
		.keydown(function (e) {
			var prevent = true,
				possibleMove = movement($(e.target), e.which);
			if (possibleMove.length > 0) {
				possibleMove.focus();
			} else if (e.which === ENTER) {
				showEditor(false);
			} else if (e.which === 17 || e.which === 91 || e.which === 93) {
				showEditor(true);
				prevent = false;
			} else {
				prevent = false;
			}
			if (prevent) {
				e.stopPropagation();
				e.preventDefault();
			}
		});

		element.find('td').prop('tabindex', 1);

		$.each(editors,function(key,ed){
			ed.css('position', 'absolute').hide().appendTo(element.parent());
		});

		$(window).on('resize', function () {
			if (editor.is(':visible')) {
				editor.offset(active.offset())
				.width(active.width())
				.height(active.height());
			}
		});
	});

};
$.fn.editableTableWidget.defaultOptions = {
	cloneProperties: ['padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
					  'text-align', 'font', 'font-size', 'font-family', 'font-weight',
					  'border', 'border-top', 'border-bottom', 'border-left', 'border-right'],
	editor: $('<input>')
};

