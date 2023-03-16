
// get territory
const territory = document.getElementById("territory");
// get context 
const territory_ctx = territory.getContext("2d");

// set game scale
const scale = 20;

// set territory dimentions
territory.height = Math.round(window.innerHeight / scale) * scale;
territory.width = Math.round(window.innerWidth / scale) * scale;

let glass = document.getElementById("glass");
glass.style.height = territory.height+'px';
glass.style.width = territory.width+'px';

// challenge
const challenge_tile = document.getElementById("challenge");
const challenge_completed_button = document.getElementById("challenge_completed");
let challenge_completed = true;
let challenge_finish = true;
challenge_completed_button.onclick = function () {challenge_completed = true; challenge_tile.style.bottom = "-550px";};
challenge_tile.addEventListener("transitionend", function () {if (challenge_completed === true) {challenge_finish = true}});

// colors
const board_border = '#7B868C';
const board_background = "#181926";
const snake_color = "#D7D7D9";
const snake_border_color = "#386273";
const food_color = "#BF3939";
const food_border_color = '#F27777';

// initial snake positions
let initials_positions = [
	{x: 200, y: 200},
	{x: 180, y: 200},
	{x: 160, y: 200},
	{x: 140, y: 200},
	{x: 120, y: 200},
];

// initial food position
let food_position = {x: 0, y:0}

// snake class definition
class Snake {
	constructor (vertebrae, direction={x: scale, y: 0}) {
		this.vertebrae = vertebrae;
		this.direction = direction;
		this.changing_direction = false;
		this.head = vertebrae[0];	
	}
	
	draw_vertebra (vertebra) {
		territory_ctx.fillStyle = snake_color;
		//~ territory_ctx.strokestyle = snake_border_color;
		territory_ctx.fillRect(vertebra.x, vertebra.y, scale, scale);  
		//~ territory_ctx.strokeRect(vertebra.x, vertebra.y, scale, scale);
	}
	
	draw () {
		this.vertebrae.forEach(this.draw_vertebra);
		//~ if (this.ate_food()) {
			//~ challenge()
			//~ generate_food();
		//~ }
	}
	
	next_head () {
		this.head = {x: (this.vertebrae[0].x + this.direction.x)%territory.width,
					y: (this.vertebrae[0].y + this.direction.y)%territory.height};
	}
	
	ate_food () {
		return this.head.x === food_position.x && this.head.y === food_position.y;
	}
	
	move () {
		this.next_head();
		if (this.ate_food()) {
			challenge()
			generate_food();
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
			territory_ctx.fillStyle = 'red';  
			territory_ctx.strokestyle = 'darkblue';
			territory_ctx.fillRect(vertebra.x, vertebra.y, scale, scale);  
			territory_ctx.strokeRect(vertebra.x, vertebra.y, scale, scale);
			})
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

main();

function main () {
	generate_food()
	const snake = new Snake(initials_positions, direction={x: scale, y: 0});
	document.addEventListener("keydown", function (event) {snake.change_direction(event)});
	game(snake);
}

// game loop
function game (snake) {
	if (snake.is_dead()) {
		snake.dead();
		return
	};
	snake.changing_direction = false;
	
	setTimeout(function onTick() {
		if (challenge_finish) {
			snake.move();
			
			clear_territory();
			draw_food();
			snake.draw();
		}
		
		game(snake);
	}, 100)
}

function clear_territory() {
	territory_ctx.fillStyle = board_background;
	territory_ctx.fillRect(0, 0, territory.width, territory.height);
}

function draw_food() {
	territory_ctx.fillStyle = food_color;
	//~ territory_ctx.strokestyle = food_border_color;
	territory_ctx.fillRect(food_position.x, food_position.y, scale, scale);
	//~ territory_ctx.strokeRect(food_position.x, food_position.y, scale, scale);
}

function random_number(min, max, step) {
	return Math.round((Math.random() * (max-min)) / step) * step + min;
}
    
function generate_food() {
	food_position.x = random_number(0, territory.width-scale, scale);
	food_position.y = random_number(0, territory.height-scale, scale);
      
      //~ snake.forEach(function has_snake_eaten_food(part) {
        //~ const has_eaten = part.x == food_x && part.y == food_y;
        //~ if (has_eaten) gen_food();
      //~ });
    }

function challenge() {
	challenge_completed = false;
	challenge_finish = false;
	challenge_tile.style.bottom = "50px";
}

function challenge_done() {
	challenge_completed = true;
}
