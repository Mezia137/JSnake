// get territory
const territory = document.getElementById("territory");
const territory_ctx = territory.getContext("2d");

// set game scale
const scale = 50;

// set territory dimentions
territory.height = Math.round(window.innerHeight / scale) * scale;
territory.width = Math.round(window.innerWidth / scale) * scale;

// set glass dimentions
const glass = document.getElementById("glass");
glass.style.height = territory.height+'px';
glass.style.width = territory.width+'px';

glass.style.backdropFilter = "blur(0px)";

// play button
const play_button = document.getElementById("play-tile");
//~ play_button.onclick = main();

// challenge
//~ const challenge_mode = true;

//~ const challenge_tile = document.getElementById("challenge");
//~ const challenge_completed_button = document.getElementById("challenge_completed");
//~ const challenge_rule = document.getElementById("rule");

//~ let challenge_completed = true;
//~ let challenge_in_progress;
//~ let is_challenge_in_progress = false;

//~ challenge_completed_button.onclick = function () {challenge_completed = true; glass.style.backdropFilter = "blur(0px)"; challenge_tile.style.bottom = "-550px"; console.log('ok')};
//~ challenge_completed_button.onclick = function () {challenge_completed = true; disparition()};
//~ challenge_completed_button.removeEventListener('onclick', te());
//~ challenge_tile.addEventListener("transitionend", function () {if (challenge_completed === true) {is_challenge_in_progress = false}});

//~ function te(){challenge_completed = true; glass.style.backdropFilter = "blur(0px)"; challenge_tile.style.bottom = "-550px"; console.log('ok')}
//~ function te(){challenge_completed = true; disparition()}



// colors
const board_background = "#262626";
const snake_color = "#BFBFBF";
const dead_snake_color = "#BF3939";
const food_color = ["#D9141460", "#D91414A0", "#D91414FF"];

// initial snake positions
let initials_positions = [
	{x: scale*10, y: scale*10},
	{x: scale*9, y: scale*10},
	{x: scale*8, y: scale*10},
	{x: scale*7, y: scale*10},
	{x: scale*6, y: scale*10},
];

// snake class
class Snake {
	constructor (vertebrae, direction={x: scale, y: 0}) {
		this.vertebrae = vertebrae;
		this.direction = direction;
		this.changing_direction = false;
		this.head = vertebrae[0];
		this.growing_up = 0;
	}
	
	draw_vertebra (vertebra) {
		territory_ctx.fillStyle = snake_color;
		territory_ctx.fillRect(vertebra.x, vertebra.y, scale, scale);  
	}
	
	draw () {
		this.vertebrae.forEach(this.draw_vertebra);
	}
	
	next_head () {
		this.head = {x: ((this.vertebrae[0].x + this.direction.x)%territory.width+territory.width)%territory.width,
					y: ((this.vertebrae[0].y + this.direction.y)%territory.height+territory.height)%territory.height};
	}
	
	did_ate_food (food_position) {
		return this.head.x === food_position.x && this.head.y === food_position.y;
	}
	
	move () {
		this.next_head();
		if (this.growing_up > 0) {
			--this.growing_up;
			
		} else {
			this.vertebrae.pop();
		}
		this.vertebrae.unshift(this.head);

	}
	
	is_dead () {
		for (let i = 4; i < this.vertebrae.length; i++) {
        if (this.vertebrae[i].x === this.vertebrae[0].x && this.vertebrae[i].y === this.vertebrae[0].y) return true;
        }
	}
	
	dead () {
		this.vertebrae.forEach(function(vertebra) {
			territory_ctx.fillStyle = dead_snake_color;  
			territory_ctx.fillRect(vertebra.x, vertebra.y, scale, scale);  
			})
		console.log(this.vertebrae.length-5);
	}
	
	change_direction (event) {
		const LEFT_KEY = 37;
		const RIGHT_KEY = 39;
		const UP_KEY = 38;
		const DOWN_KEY = 40;
	
		if (this.changing_direction) return;
		this.changing_direction = true;

		const key_pressed = event.keyCode;
		if (key_pressed === LEFT_KEY && this.direction.x !== scale) {
			this.direction.x = -scale;
			this.direction.y = 0;
		}
		if (key_pressed === UP_KEY && this.direction.y !== scale) {
			this.direction.x = 0;
			this.direction.y = -scale;
		}
		if (key_pressed === RIGHT_KEY && this.direction.x !== -scale) {
			this.direction.x = scale;
			this.direction.y = 0;
		}
		if (key_pressed === DOWN_KEY && this.direction.y !== -scale) {
			this.direction.x = 0;
			this.direction.y = scale;
		}
	}
}

// challenge class
class Food {
	constructor (type, position) {
		this.position = position;
		this.type = type;
		this.grow_power = (this.type+1)*2;

	}
	
	draw () {
		territory_ctx.fillStyle = food_color[this.type];
		territory_ctx.fillRect(this.position.x, this.position.y, scale, scale);
	}
	
	generate_position (snake, foods) {
		let occuped_positions = []
		occuped_positions = occuped_positions.concat(snake.vertebrae)
		foods.forEach(food => occuped_positions.push(food.position))
		
		this.position.x = random_number(0, territory.width-scale, scale);
		this.position.y = random_number(0, territory.height-scale, scale);
		
		//~ for (const position of occuped_positions) {
			//~ console.log(position)
			//~ if (this.food_position.x == position.x && this.food_position.y == position.y) {
				//~ this.food_position_generate(snake, challenges);
			//~ }
		//~ }
		//~ console.log(occuped_positions)
	}
	
	//~ challenger () {
		//~ challenge_completed = false;
		//~ is_challenge_in_progress = true;
		//~ glass.style.animation = "flou-progressif 2s ease-out";
		//~ challenge_tile.style.bottom = "50px";
	//~ }
	
	//~ complete_challenge () {
		
	//~ }
}

init();

// main game
function main () {
	while (true) {
		[snake, foods] = init();
		play_button.onclick = function () {main(game_loop (snake, foods))};
	}
}

// initialisation
function init () {
	const foods = [new Food(0, {x: 100*scale, y: 50*scale}),
			new Food(1, {x: 102*scale, y: 50*scale}),
			new Food(2, {x: 104*scale, y: 50*scale}),];
	
	const snake = new Snake(initials_positions, direction={x: scale, y: 0});
	
	foods.forEach(food => food.generate_position(snake, foods));
	document.addEventListener("keydown", function (event) {snake.change_direction(event)});
	game_loop(snake, foods);
	
	clear_territory();
	foods.forEach(food => food.draw());
	snake.draw();
	
	game_loop(snake, foods)
	//~ return [snake, foods];
}

// game loop
function game_loop (snake, foods) {
	if (snake.is_dead()) {
		snake.dead();
		return
	};
	snake.changing_direction = false;
	
	setTimeout(function onTick() {
		if (1==1) {
			snake.move();
			for (let food of foods) {
				if (snake.did_ate_food(food.position)) {
					snake.growing_up += food.grow_power;
					//~ if (challenge_mode) {
						//~ challenge_in_progress = challenge; 
						//~ challenge_in_progress.challenger();
					//~ }
					food.generate_position(snake, foods);
				}
			}
				
			clear_territory();
			foods.forEach(food => food.draw());
			snake.draw();
		} else {
			//~ challenge_in_progress.complete_challenge();
		}
		
		game_loop(snake, foods );
	}, 100)
}

function clear_territory() {
	territory_ctx.fillStyle = board_background;
	territory_ctx.fillRect(0, 0, territory.width, territory.height);
}

function random_number(min, max, step) {
	return Math.round((Math.random() * (max-min)) / step) * step + min;
}
