// get territory
const territory = document.getElementById("territory");
const territory_ctx = territory.getContext("2d");

// set game scale
const scale = 100;

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
document.getElementById("play-button").onclick = function() {
	setTimeout(function() {
		main()
	}, );
};
document.addEventListener('keyup', function(event) {
	if (!playing && ['Space', 'Enter'].includes(event.code)) {main()}
});

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
		this.vertebrae = vertebrae;
		this.direction = direction;
		this.changing_direction = false;
		this.head_positon = vertebrae[0];
		this.growing_up = 0;
	}
	
	draw_vertebra (vertebra) {
		territory_ctx.fillStyle = snake_color;
		territory_ctx.fillRect(vertebra.x, vertebra.y, scale, scale);  
	}
	
	draw () {
		this.vertebrae.forEach(this.draw_vertebra);
	}
	
	generate_head_positon () {
		this.head_positon = {x: ((this.vertebrae[0].x + this.direction.x)%territory.width+territory.width)%territory.width,
					y: ((this.vertebrae[0].y + this.direction.y)%territory.height+territory.height)%territory.height};
	}
	
	did_ate_food (food_position) {
		return this.head_positon.x === food_position.x && this.head_positon.y === food_position.y;
	}
	
	move () {
		this.generate_head_positon();
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
		this.grow_power = (this.type+1)*2;

	}
	
	draw () {
		territory_ctx.fillStyle = food_color[this.type];
		territory_ctx.fillRect(this.position.x, this.position.y, scale, scale);
	}
	
	generate_position (snake_positions) {
		this.position.x = random_number(0, territory.width-scale, scale);
		this.position.y = random_number(0, territory.height-scale, scale);
		
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
	
	setTimeout(function onTick() {
		if (!paused) {
			snake.move();
			for (let food of foods) {
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
	}, 100)
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
	setTimeout(function() {
		menu_score_display.textContent = "SCORE : "+score;
		menu_tile.style.display = 'block';
		menu_tile.style.animation = 'appear 1s forwards';
		territory.style.animation = 'blur 1s forwards';
	}, 300);
}

function random_number(min, max, step) {
	return Math.round((Math.random() * (max-min)) / step) * step + min;
}
