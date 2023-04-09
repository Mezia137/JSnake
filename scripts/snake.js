// get territory
const territory = document.getElementById("territory");
const territory_ctx = territory.getContext("2d");

// set game scale and speed
let scale = 50;
let speed = 100;

// colors
const board_background = "#262626";
const snake_color = "#BFBFBF";
const dead_snake_color = "#BF3939";
const food_color = ["#6a2020", "#961b1b", "#d91414"];

// set territory dimentions
territory.height = Math.floor(window.innerHeight / scale) * scale;
territory.width = Math.floor(window.innerWidth / scale) * scale;

// menu
const menu_tile = document.getElementById("menu-tile");
document.getElementById("play-button").onclick = function() {main();};
document.addEventListener('keyup', function(event) {
	if (!playing && ['Space', 'Enter'].includes(event.code)) {main()}
});

// settings
document.getElementById("settings-button").onclick = function() {
	alert("The settings page is under development for v2. It will be possible to set the scale, speed and grow power of each feed.");
};

// score
let score;
const menu_score_display = document.getElementById("menu-score");
const pause_score_display = document.getElementById("pause-score");

// pause
let paused = false;
let playing;
const pause_tile = document.getElementById("pause-tile");
document.addEventListener('keydown', function(event) {
	if (playing && ['Space', 'Escape', 'KeyP', 'Enter'].includes(event.code)) {pause()}
});
// The game resumes only when the animation is finished.
pause_tile.addEventListener("animationend", function(event) {
	if (event.animationName==="disappear") {
		pause_tile.style.display = 'none';
		paused = false;
	}
});

// initial snake positions
let initials_positions = [
	{x: scale*7, y: scale*10},
	{x: scale*6, y: scale*10},
	{x: scale*5, y: scale*10},
	{x: scale*4, y: scale*10},
	{x: scale*3, y: scale*10},
];

// snake class
class Snake {
	constructor (vertebrae, direction={x: scale, y: 0}) {
		this.vertebrae = vertebrae; // list of snake positions
		this.direction = direction; // next x and y movement
		this.changing_direction = false; 
		this.head_positon = vertebrae[0];
		this.growing_up = 0; // stores the number of vertebrae to grow
	}
	
	draw_vertebra (vertebra) {
		territory_ctx.fillStyle = snake_color;
		territory_ctx.fillRect(vertebra.x, vertebra.y, scale, scale);  
	}
	
	draw () {
		this.vertebrae.forEach(this.draw_vertebra);
	}
	
	generate_head_positon () {
		// use of modulo for the periodicity of the territory
		this.head_positon = {x: ((this.vertebrae[0].x + this.direction.x)%territory.width+territory.width)%territory.width,
					y: ((this.vertebrae[0].y + this.direction.y)%territory.height+territory.height)%territory.height};
	}
	
	did_ate_food (food_position) {
		return this.head_positon.x === food_position.x && this.head_positon.y === food_position.y;
	}
	
	move () {
		this.generate_head_positon();
		// To give the illusion of moving forward the snake gains a new vertebra and loses its last one,
		// except if there are still vertebrae to grow in this case the last one remains so it grows.
		if (this.growing_up > 0) {
			this.growing_up--;
			score++;
			
		} else {
			this.vertebrae.pop();
		}
		this.vertebrae.unshift(this.head_positon);
	}
	
	is_dead () {
		for (let i = 4; i < this.vertebrae.length; i++) {
        // Check if the snake bites its tail.
        if (this.vertebrae[i].x === this.vertebrae[0].x && this.vertebrae[i].y === this.vertebrae[0].y) return true;
        }
	}
	
	death_animation () {
		this.vertebrae.forEach(function(vertebra) {
			territory_ctx.fillStyle = dead_snake_color;  
			territory_ctx.fillRect(vertebra.x, vertebra.y, scale, scale);  
			})
	}
	
	change_direction (event) {
		const LEFT_KEY = 37;
		const RIGHT_KEY = 39;
		const UP_KEY = 38;
		const DOWN_KEY = 40;
		
		// The snake only changes direction once per tick.
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

// food class
class Food {
	constructor (type, position) {
		this.position = position;
		this.type = type;
		this.grow_power = (this.type+1)*2; // Number of vertebrae it grows

	}
	
	draw () {
		territory_ctx.fillStyle = food_color[this.type];
		territory_ctx.fillRect(this.position.x, this.position.y, scale, scale);
	}
	
	generate_position (snake_positions) {
		this.position.x = random_number(0, territory.width-scale, scale);
		this.position.y = random_number(0, territory.height-scale, scale);
		
		// The food can't appear under the snake otherwise
		// the game becomes boring when the snake takes a lot of space because you have to wait to find the food.
		for (const occuped_position of snake_positions) {
			if (this.position.x == occuped_position.x && this.position.y == occuped_position.y) {
				this.generate_position(snake_positions);
			}
		}
	}
}

// initialisation and running game loop
function main () {
	score = 0;
	playing = true;
	const foods = [new Food(0, {x: 100*scale, y: 50*scale}),
			new Food(1, {x: 102*scale, y: 50*scale}),
			new Food(2, {x: 104*scale, y: 50*scale}),];
	
	const snake = new Snake(initials_positions.slice(), direction={x: scale, y: 0});
	// Listen to the arrows to change the direction.
	document.addEventListener('keydown', function(event) {
		if (!paused && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
			snake.change_direction(event)
		}
	});
	
	foods.forEach(food => food.generate_position(snake.vertebrae));
	
	menu_tile.style.display = 'none';
	territory.style.animation = 'unblur 0.7s forwards';
	
	game_loop(snake, foods)
}

// game loop
function game_loop (snake, foods) {
	if (snake.is_dead()) {
		snake.death_animation();
		end();
		return
	};
	snake.changing_direction = false;
	
	// Set the tempo of the game, defined by speed in ms.
	setTimeout(function onTick() {
		if (!paused) {
			snake.move();
			for (let food of foods) {
				// Increase the number of vertebrae to grow if a food is eaten.
				if (snake.did_ate_food(food.position)) {
					snake.growing_up += food.grow_power;
					food.generate_position(snake.vertebrae);
				}
			}
			
			clear_territory();
			draw_score_territory();
			foods.forEach(food => food.draw());
			snake.draw();
		}		
		game_loop(snake, foods );
	}, speed)
}

function clear_territory () {
	territory_ctx.fillStyle = board_background;
	territory_ctx.fillRect(0, 0, territory.width, territory.height);
}

function draw_score_territory () {
	territory_ctx.font = "bold 200px Ubuntu";
	territory_ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
	territory_ctx.textAlign = "center";
	territory_ctx.fillText(score, territory.width/2, territory.height/2+70);
}

function pause () {
	if (!paused) {
		pause_score_display.textContent = "SCORE : "+score;
		pause_tile.style.display = 'block';
		pause_tile.style.animation = 'appear 1s forwards';
		territory.style.animation = 'blur 1s forwards';
		paused = true;
	} else {
		pause_tile.style.animation = 'disappear 1s forwards';
		territory.style.animation = 'unblur 1s forwards';
	}
}

function end () {
	playing = false;
	percentage_score = ((score+initials_positions.length)*100)/((territory.height/scale)*(territory.width/scale))
	setTimeout(function() {
		menu_score_display.innerHTML = `SCORE : ${score} ${"&nbsp;".repeat(10)} ${Math.round(percentage_score)}%`;
		menu_tile.style.display = 'block';
		menu_tile.style.animation = 'appear 1s forwards';
		territory.style.animation = 'blur 1s forwards';
	}, 300);
}

function random_number(min, max, step) {
	return Math.round((Math.random() * (max-min)) / step) * step + min;
}
