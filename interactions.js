(function () {
	if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
		return;
	}

	var targets = Array.prototype.slice.call(
		document.querySelectorAll('a:not(.no-interaction), button:not(.no-interaction), [role="button"]:not(.no-interaction), input[type="button"]:not(.no-interaction), input[type="submit"]:not(.no-interaction)')
	);

	if (!targets.length) {
		return;
	}

	targets.forEach(function (el) {
		el.classList.add('interactive-target');
		var startRot = (Math.random() * 3.2) - 1.6;
		var endRot = startRot + ((Math.random() * 2.4) - 1.2);
		var lift = -1 * (2 + Math.random() * 2.2);
		var duration = 1.15 + Math.random() * 0.75;
		var delay = -Math.random() * duration;

		el.style.setProperty('--idle-rot-start', startRot.toFixed(2) + 'deg');
		el.style.setProperty('--idle-rot-end', endRot.toFixed(2) + 'deg');
		el.style.setProperty('--idle-shift', lift.toFixed(2) + 'px');
		el.style.setProperty('--idle-duration', duration.toFixed(2) + 's');
		el.style.setProperty('--idle-delay', delay.toFixed(2) + 's');
	});

	var pointerX = null;
	var pointerY = null;
	var rafPending = false;
	var nearDistance = 90;

	function distanceToRect(x, y, rect) {
		var dx = 0;
		if (x < rect.left) {
			dx = rect.left - x;
		} else if (x > rect.right) {
			dx = x - rect.right;
		}

		var dy = 0;
		if (y < rect.top) {
			dy = rect.top - y;
		} else if (y > rect.bottom) {
			dy = y - rect.bottom;
		}

		return Math.sqrt(dx * dx + dy * dy);
	}

	function updateNearTargets() {
		rafPending = false;
		if (pointerX === null || pointerY === null) {
			return;
		}

		targets.forEach(function (el) {
			if (!el.offsetParent) {
				el.classList.remove('cursor-near');
				return;
			}

			if (el.matches(':hover')) {
				el.classList.remove('cursor-near');
				return;
			}

			var rect = el.getBoundingClientRect();
			var distance = distanceToRect(pointerX, pointerY, rect);
			if (distance <= nearDistance) {
				el.classList.add('cursor-near');
			} else {
				el.classList.remove('cursor-near');
			}
		});
	}

	function requestNearUpdate() {
		if (!rafPending) {
			rafPending = true;
			window.requestAnimationFrame(updateNearTargets);
		}
	}

	document.addEventListener('mousemove', function (event) {
		pointerX = event.clientX;
		pointerY = event.clientY;
		requestNearUpdate();
	});

	window.addEventListener('scroll', requestNearUpdate, { passive: true });
	window.addEventListener('resize', requestNearUpdate);

	document.addEventListener('mouseout', function (event) {
		if (event.relatedTarget || event.toElement) {
			return;
		}
		targets.forEach(function (el) {
			el.classList.remove('cursor-near');
		});
	});
})();
