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
		
		// Initialize the list of cells required. Add the same to the HTML parent element.
		var initialize = function () {
			for (var i = 0; i < rows; i++) {
				cells[i] = [];
				var $row = $('<div>').addClass('conway-row');
			
				for (var j = 0; j < cols; j++) {
			
					var cell = cells[i][j] = new Cell(i, j);
					var $cell = cell.getJqueryElement();
			
					// Add click handler for the Cell.
					$cell.on('click', function (event) {
						var cellObj = $(this).data('cell');
						if (cellObj.isAlive()) {
							cellObj.deActivate()
						} else {
							cellObj.activate();
						}
				
						_this.reMap();
					});
			
					$row.append($cell);
				}
				// Add the HTML Row to the Parent element.
				$parent.append($row);
			}
		};
		
		// Re-draw the Elements based on their status, if they are alive or not.
		this.reDraw = function () {
			for (var i = 0; i < rows; i++) {
				for (var j = 0; j < cols; j++) {
					var cell = cells[i][j];
					cell.isAlive() ? cell.activate() : cell.deActivate();
				}
			}
		};
		
		// Get the count of immediate neighbors for the cell.
		this.getNeighborsCount = function (cell) {
		
			var neighbors = 0,
			row = cell.getRow(),
			col = cell.getCol();
		
			// Top Left to Top Right
			if (cells[row - 1]) {
				if (cells[row - 1][col - 1] && cells[row - 1][col - 1].isAlive()) neighbors++;
				if (cells[row - 1][col] && cells[row - 1][col].isAlive()) neighbors++;
				if (cells[row - 1][col + 1] && cells[row - 1][col + 1].isAlive()) neighbors++;
			}
		
			// Middle Left to Middle Right. Ignore the current cell.
			if (cells[row][col - 1] && cells[row][col - 1].isAlive()) neighbors++;
			if (cells[row][col + 1] && cells[row][col + 1].isAlive()) neighbors++;
		
			// Bottom Left to Bottom Right.
			if (cells[row + 1]) {
				if (cells[row + 1][col - 1] && cells[row + 1][col - 1].isAlive()) neighbors++;
				if (cells[row + 1][col] && cells[row + 1][col].isAlive()) neighbors++;
				if (cells[row + 1][col + 1] && cells[row + 1][col + 1].isAlive()) neighbors++;
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
			
					if (cell.isAlive()) {
						if (lifeValue < 2 || lifeValue > 3) {
							cell.deActivate();
							cellsDestroyed++;
						}
					} else {
						if (lifeValue === 3) {
							cell.activate();
							cellsCreated++;
						}
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
		//var sizeX = $('#sizex').val();
		//var sizeY = $('#sizey').val();
		
		//var game = new ConwayGame('.conway-game', sizeY.val(), sizeX.val());
		//game.setIterationSelector('#iterations');
		
		//$('#nextButton').on('click', function () {
		//	game.next();
		//});
		//
		//$('#playButton').on('click', function () {
		//	game.play();
		//});
		//
		//$('#pauseButton').on('click', function () {
		//	game.pause();
		//});
		//
		//$('#speedUpButton').on('click', function () {
		//	game.increaseSpeed();
		//});
		//
		//$('#slowDownButton').on('click', function () {
		//	game.decreaseSpeed();
		//});
		//
		//$('#fetchDetailsButton').on('click', function () {
		//	$('#cellsCreated').text(game.getCellsCreated());
		//	$('#cellsDestroyed').text(game.getCellsDestroyed());
		//});
		
		$('#createGameButton').on('click', function () {
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
		
		//sizeX.on('blur', function () {
		//	$('.conway-game').empty();
		//	if (game) delete game;
		//	//sizeX = $('#sizex');
		//	var game = new ConwayGame('.conway-game', sizeY.val(), sizeX.val());
		//})
		//sizeY.on('blur', function(){
		//	$('.conway-game').empty();
		//	if (game) delete game;
		//	//sizeY = $('#sizey');
		//	var game = new ConwayGame('.conway-game', sizeY.val(), sizeX.val());
		//})
	});
 })();
 