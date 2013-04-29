
lychee.define('lychee.ui.Renderer').requires([
	'lychee.ui.Area',
	'lychee.ui.Button',
	'lychee.ui.Slider',
	'lychee.ui.Textarea'
]).includes([
	'lychee.Renderer'
]).exports(function(lychee, global) {

	var _area     = lychee.ui.Area;
	var _button   = lychee.ui.Button;
	var _slider   = lychee.ui.Slider;
	var _textarea = lychee.ui.Textarea;


	var Class = function(id) {

		lychee.Renderer.call(this, id);

	};


	Class.prototype = {

		renderEntity: function(entity, offsetX, offsetY) {

			if (entity instanceof _area) {
				this.renderUIArea(entity, offsetX, offsetY);
			} else if (entity instanceof _button) {
				this.renderUIButton(entity, offsetX, offsetY);
			} else if (entity instanceof _slider) {
				this.renderUISlider(entity, offsetX, offsetY);
			} else if (entity instanceof _textarea) {
				this.renderUITextarea(entity, offsetX, offsetY);
			}

		},

		renderUIArea: function(entity, offsetX, offsetY) {

			offsetX = offsetX || 0;
			offsetY = offsetY || 0;


			var position = entity.getPosition();

			var realX = position.x + offsetX;
			var realY = position.y + offsetY;


			var children = entity.getChildren();

			for (var c = 0, cl = children.length; c < cl; c++) {
				this.renderEntity(children[c], realX, realY);
			}

		},

		renderUIButton: function(entity, offsetX, offsetY) {

			offsetX = offsetX || 0;
			offsetY = offsetY || 0;


			var position = entity.getPosition();

			var realX = position.x + offsetX;
			var realY = position.y + offsetY;


			if (
				realX >= 0 && realX <= this.__width
				&& realY >= 0 && realY <= this.__height
			) {

				var label = entity.getLabel();
				var font  = entity.getFont();
				if (label !== null && font !== null) {

					this.drawText(
						realX, realY,
						label, font,
						true
					);

				}

			}

		},

		renderUISlider: function(entity, offsetX, offsetY) {

			offsetX = offsetX || 0;
			offsetY = offsetY || 0;


			var position = entity.getPosition();

			var realX = position.x + offsetX;
			var realY = position.y + offsetY;


			if (
				realX >= 0 && realX <= this.__width
				&& realY >= 0 && realY <= this.__height
			) {

				var bgcolor = entity.getState() === 'active' ? '#666666' : '#333333';

				var radius = entity.radius;
				if (radius > 0) {

					this.setAlpha(0.5);

					this.drawArc(
						realX, realY,
						0, 1,
						radius,
						bgcolor,
						true
					);

					this.setAlpha(1.0);


					var drag = entity.getDrag();

					this.drawCircle(
						realX + drag.x,
						realY + drag.y,
						24,
						'#ff0000',
						true
					);

				}

			}

		},

		renderUITextarea: function(entity, offsetX, offsetY) {

			offsetX = offsetX || 0;
			offsetY = offsetY || 0;


			var position = entity.getPosition();

			var realX = position.x + offsetX;
			var realY = position.y + offsetY;

			if (
				realX >= 0 && realX <= this.__width
				&& realY >= 0 && realY <= this.__height
			) {

				var hwidth  = entity.width / 2;
				var hheight = entity.height / 2;

				var bgcolor = entity.getState() === 'active' ? '#666666' : '#333333';


				this.setAlpha(0.5);

				this.drawBox(
					realX - hwidth,
					realY - hheight,
					realX + hwidth,
					realY + hheight,
					bgcolor,
					true
				);

				this.setAlpha(1.0);


				this.setBoundaries(
					realX - hwidth,
					realY - hheight,
					realX + hwidth,
					realY + hheight
				);

				var font = entity.getFont();
				if (font !== null) {

					var lines  = entity.getLines();
					for (var l = 0, ll = lines.length; l < ll; l++) {

						var text   = entity.getText(l);
						var offset = entity.getOffset(l);

						if (offset >= 0 && offset <= hheight * 2) {

							this.drawText(
								realX - hwidth,
								realY - hheight + offset,
								text,
								font,
								false
							);

						}

					}

				}

				this.flush(false);


			}

		},

		renderUIWizard: function(entity, offsetX, offsetY) {

			offsetX = offsetX || 0;
			offsetY = offsetY || 0;


			var position = entity.getPosition();

			var realX = position.x + offsetX;
			var realY = position.y + offsetY;


			if (
				realX >= 0 && realX <= this.__width
				&& realY >= 0 && realY <= this.__height
			) {

				var area = entity.getArea();
				if (area !== null) {
					this.renderUIArea(area, realX, realY);
				}

			}

		}

	};


	return Class;

});

