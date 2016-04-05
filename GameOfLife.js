(function(){
/*
 * Conway's - Game of Life.
 * Any live cell with fewer than two live neighbours dies, as if caused by under-population.
 * Any live cell with two or three live neighbours lives on to the next generation.
 * Any live cell with more than three live neighbours dies, as if by over-population.
 * Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
 */

'use strict';

/*
 * Representation of each cell on the canvas.
 * "row" and "col" stores the location of the cell.
 * The "alive" property stores whether the cell is alive or dead.
 */
 
 
	function Cell(row, col) {
	
		var _this = this,
			$this = null,
			alive = false;
		
		// On activation, set the 'conway-alive' class to the cell.
		this.activate = function () {
			alive = true;
			$this.addClass('conway-alive');
		};
		
		// On de-activation, remove the 'conway-alive' class to the cell.
		this.deActivate = function () {
			alive = false;
			$this.removeClass('conway-alive');
		};
		
		this.isAlive = function () {
			return alive;
		};
		
		this.getRow = function () {
			return row;
		};
		
		this.getCol = function () {
			return col;
		};
		
		this.getJqueryElement = function () {
			return $this;
		};
		
		// If $this is not yet defined, create a new HTML element.
		// This represents the HTML form of the cell.
		if (null === $this) {
			$this = $('<div>').addClass('conway-cell').data('cell', _this);
		}
		
		return this;
	}
	
	/**
	* The main logic of the game goes here.
	* This is where the logic of the game and all the Cells and their
	* behavour is monitored.
	*/
	function ConwayGame(selector, numRows, numCols) {
		var $parent = $(selector), // The parent element for the game
			_this = this,
			rows = numRows, // The number of Rows for the board.
			cols = numCols, // The number of Columns for the board.
			cells = [], // The 2D map of cells
			lifeMap = [],
			intervalTime = 500,
			intervalId,
			running = false,
			iterations = 0,
			$iterationsElement = null,
			cellsCreated = 0,
			cellsDestroyed = 0;
		
		this.getSpeed = function () {
			return intervalTime;
		};
		
		this.getIterations = function () {
			return iterations;
		};
		
		this.setIterationSelector = function (jQuerySelector) {
			$iterationsElement = $(jQuerySelector);
		};
		
		this.getCellsCreated = function () {
			return cellsCreated;
		};
		
		this.getCellsDestroyed = function () {
			return cellsDestroyed;
		};
		
		var initialize = function () {
			for (var i = 0; i < rows; i++) {
				cells[i] = [];
				var $row = $('<div>').addClass('conway-row');
			
				for (var j = 0; j < cols; j++) {
			
					var cell = cells[i][j] = new Cell(i, j);
					var $cell = cell.getJqueryElement();
			
					$cell.on('click', function (event) {
						var cellObj = $(this).data('cell');
						
						cellObj.isAlive() ? cellObj.deActivate() : cellObj.activate();
				
						_this.reMap();
					});
					$row.append($cell);
				}
				$parent.append($row);
			}
		};
		
		this.reDraw = function () {
			for (var i = 0; i < rows; i++) {
				for (var j = 0; j < cols; j++) {
					var cell = cells[i][j];
					cell.isAlive() ? cell.activate() : cell.deActivate();
				}
			}
		};
		
		this.getNeighborsCount = function (cell) {
		
			var neighbors = 0,
			row = cell.getRow(),
			col = cell.getCol();
		
			var rowAbove = cells[row - 1];
			var rowBelow = cells[row + 1];
			
			if (rowAbove) {
				if (rowAbove[col - 1] && rowAbove[col - 1].isAlive()) neighbors++;
				if (rowAbove[col] && rowAbove[col].isAlive()) neighbors++;
				if (rowAbove[col + 1] && rowAbove[col + 1].isAlive()) neighbors++;
			}
		
			if (cells[row][col - 1] && cells[row][col - 1].isAlive()) neighbors++;
			if (cells[row][col + 1] && cells[row][col + 1].isAlive()) neighbors++;
		
			if (rowBelow) {
				if (rowBelow[col - 1] && rowBelow[col - 1].isAlive()) neighbors++;
				if (rowBelow[col] && rowBelow[col].isAlive()) neighbors++;
				if (rowBelow[col + 1] && rowBelow[col + 1].isAlive()) neighbors++;
			}
		
			return neighbors;
		};
		
		this.reMap = function () {
			for (var i = 0; i < rows; i++) {
				lifeMap[i] = [];
		
				for (var j = 0; j < cols; j++) {
					var cell = cells[i][j];
					lifeMap[i][j] = _this.getNeighborsCount(cell);
				}
			}
		};
		
		this.getNextLife = function () {
			iterations++;
			if (null != $iterationsElement) {
				$iterationsElement.text(iterations);
			}
		
			for (var i = 0; i < rows; i++) {
				for (var j = 0; j < cols; j++) {
			
					var cell = cells[i][j];
					var lifeValue = lifeMap[i][j];
			
					if (cell.isAlive() && (lifeValue < 2 || lifeValue > 3)) {
						cell.deActivate();
						cellsDestroyed++;
					} else if (lifeValue === 3) {
						cell.activate();
						cellsCreated++;
					}
				}
			}
			_this.reMap();
		};
		
		this.next = function () {
			_this.getNextLife();
			_this.reDraw();
		};
		
		this.play = function () {
			if (!running) {
				intervalId = setInterval(_this.next, intervalTime);
				running = true;
			}
		};
		
		this.pause = function () {
			if (running) {
				clearInterval(intervalId);
				running = false;
			}
		};
		
		this.increaseSpeed = function () {
			if (intervalTime > 100) {
				intervalTime -= 100;
			}
			_this.pause();
			_this.play();
		};
		
		this.decreaseSpeed = function () {
			if (intervalTime < 2000) {
				intervalTime += 100;
			}
			_this.pause();
			_this.play();
		};
		
		if (cells.length === 0) {
			initialize();
		}

		return this;
	}
		
	// Run as soon as the Document is Ready.
	$(function () {
		
		var sizeX = $('#sizex');
		var sizeY = $('#sizey');
		
		$('#createGameButton').on('click', function () {
			var conwayGame = document.getElementsByClassName('conway-game')[0];
			while (conwayGame.firstChild) {
				conwayGame.removeChild(conwayGame.firstChild);
			}
			
			var game = new ConwayGame('.conway-game', sizeY.val(), sizeX.val());
			game.setIterationSelector('#iterations');
		
			$('#nextButton').on('click', function () {
				game.next();
			});
			
			$('#playButton').on('click', function () {
				game.play();
			});
			
			$('#pauseButton').on('click', function () {
				game.pause();
			});
			
			$('#speedUpButton').on('click', function () {
				game.increaseSpeed();
			});
			
			$('#slowDownButton').on('click', function () {
				game.decreaseSpeed();
			});
			
			$('#fetchDetailsButton').on('click', function () {
				$('#cellsCreated').text(game.getCellsCreated());
				$('#cellsDestroyed').text(game.getCellsDestroyed());
			});		
		});
	});
 })();
 