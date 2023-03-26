// get territory
const territory = document.getElementById("territory");
const territory_ctx = territory.getContext("2d");

// set game scale
const scale = 50;

// colors
const board_background = "#262626";
const snake_color = "#BFBFBF";
const dead_snake_color = "#BF3939";
const food_color = ["#6a2020", "#961b1b", "#d91414"];

// set territory dimentions
territory.height = Math.floor(window.innerHeight / scale) * scale;
territory.width = Math.floor(window.innerWidth / scale) * scale;
console.log(window.innerHeight, window.innerWidth)

// set glass dimentions
const glass = document.getElementById("glass");
glass.style.height = territory.height+'px';
glass.style.width = territory.width+'px';

// menu
const menu_tile = document.getElementById("menu-tile");
document.getElementById("play-button").onclick = function() {
	setTimeout(function() {
		main()
	}, );
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
pause_tile.addEventListener("animationend", function(event) {
	if (event.animationName==="hide") {
		pause_tile.style.display = 'none';
		paused = false;
	}
});

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
			this.growing_up--;
			score++;
			
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
	
	generate_position (snake, foods) {
		let occuped_positions = [];
		occuped_positions = occuped_positions.concat(snake.vertebrae);
		//~ foods.forEach(food => {occuped_positions.push(food.position); console.log("food.position = ", food.position)});
		
		this.position.x = random_number(0, territory.width-scale, scale);
		this.position.y = random_number(0, territory.height-scale, scale);
		
		console.log("this.position = ", this.position);
		for (const occuped_position of occuped_positions) {
			console.log("	occuped_position = ", occuped_position);
			if (this.position.x == occuped_position.x && this.position.y == occuped_position.y) {
				console.log(this.position, occuped_position)
				console.log("position error")
				this.generate_position(snake, foods);
			}
		}
	}
}

// initialisation
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
	
	foods.forEach(food => food.generate_position(snake, foods));
	
	menu_tile.style.display = 'none';
	glass.style.animation = 'deflouter 0.5s forwards';
	clear_territory();
	foods.forEach(food => food.draw());
	snake.draw();
	
	game_loop(snake, foods)
}

// game loop
function game_loop (snake, foods) {
	if (snake.is_dead()) {
		snake.dead();
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
					food.generate_position(snake, foods);
				}
			}
			
			menu_score_display.textContent = "SCORE : "+score;
			pause_score_display.textContent = "SCORE : "+score;
			
			clear_territory();
			draw_score();
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

function draw_score () {
	territory_ctx.font = "bold 200px Ubuntu";
	territory_ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
	territory_ctx.textAlign = "center";
	territory_ctx.fillText(score, territory.width/2, territory.height/2+70);
}

function pause () {
	if (!paused) {
		pause_tile.style.display = 'block';
		pause_tile.style.animation = 'show 1.5s forwards';
		glass.style.animation = 'flouter 1.5s forwards';
		paused = true;
	} else {
		pause_tile.style.animation = 'hide 1.5s forwards';
		glass.style.animation = 'deflouter 1.5s forwards';
		//~ pause_tile.style.display = 'none';
	}
}

function end () {
	playing = false;
	console.log("Score : ", score)
	setTimeout(function() {
		menu_tile.style.display = 'block';
		menu_tile.style.animation = 'show 1.5s forwards';
		glass.style.animation = 'flouter 1.5s forwards';
	}, 300);
}

function random_number(min, max, step) {
	return Math.round((Math.random() * (max-min)) / step) * step + min;
}
