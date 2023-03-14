//~ import { Snake } from './Snake.js';

const territory = document.getElementById("snakeboard");
const territoryContext = territory.getContext("2d");

const territory_height = window.innerHeight;
const territory_width = window.innerWidth;

const scale = 20

territory.height = Math.round(territory_height / scale) * scale;
territory.width = Math.round(territory_width / scale) * scale;

const board_border = '#D9D8D7';
const board_background = "#171F26";
const snake_color = "#97A0A6";
const snake_border_color = "#171F26";

let positions = [
	{x: 200, y: 200},
	{x: 180, y: 200},
	{x: 160, y: 200},
	{x: 140, y: 200},
	{x: 120, y: 200},
];

class Snake {
	constructor (vertebrae) {
		this.vertebrae = vertebrae
	}
}

let snakeobj = new Snake(positions);
let snake = snakeobj.vertebrae;

let changing_direction = false;

let food_x;
let food_y;
let direction_x = scale;
let direction_y = 0;

let challengeTile = document.getElementById("challenge");
let challenge_completed_button = document.getElementById("challenge_completed");
let challenge_completed = true;
challenge_completed_button.onclick = function(){challenge_completed = true; challenge.style.bottom = "-550px";};
//~ challengeTile.style.bottom = "-500px";

let menuTile = document.getElementById("menu");


main();
generate_food();
document.addEventListener("keydown", change_direction);

function main() {
	//~ menu();
	game();
}

//~ function menu() {
	//~ menuTile.style.top = "50px";
	//~ fond.style.filter = "blur(5px)";

	//~ // Animer l'apparition du menu
	//~ menu.style.opacity = 0;
	//~ menu.style.display = "block";
	//~ const animation = menu.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000 });
	//~ animation.onfinish = () => {
    //~ // Débloquer le programme une fois l'animation terminée
    //~ fond.style.filter = "";
    //~ game();
  //~ };
	
//~ }

function game() {
	
	if (has_game_ended()) {
		end();
		//challenge.style.bottom = "50px";
		return
	};
	changing_direction = false;
	
	setTimeout(function onTick() {
		if (challenge_completed) {
			clearCanvas();   
			drawFood(); 
			move_snake();  
			drawSnake();
		}
		game();
	}, 100)
}

function clearCanvas() {
	territoryContext.fillStyle = board_background;
	//territoryContext.strokestyle = board_border;
	territoryContext.fillRect(0, 0, territory.width, territory.height);
	//territoryContext.strokeRect(10, 10, territory.width, territory.height);
}

function drawSnakePart(snakePart) {  
  territoryContext.fillStyle = 'lightblue';  
  territoryContext.strokestyle = 'darkblue';
  territoryContext.fillRect(snakePart.x, snakePart.y, scale, scale);  
  territoryContext.strokeRect(snakePart.x, snakePart.y, scale, scale);
}

function drawSnake() {  
  snake.forEach(drawSnakePart);
}

function drawFood() {
      territoryContext.fillStyle = 'lightgreen';
      territoryContext.strokestyle = 'darkgreen';
      territoryContext.fillRect(food_x, food_y, scale, scale);
      territoryContext.strokeRect(food_x, food_y, scale, scale);
}

function has_game_ended() {
      for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true
      }
      const hitLeftWall = snake[0].x < 0;
      const hitRightWall = snake[0].x > territory.width - scale;
      const hitToptWall = snake[0].y < 0;
      const hitBottomWall = snake[0].y > territory.height - scale;
      return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall
    }
    
function random_number(min, max, step) {
      return Math.round((Math.random() * (max-min)) / step) * step + min;
      //~ return Math.round((Math.random() * (max-min) + min) / scale) * scale;
    }
    
function generate_food() {
      // Generate a random number the food x-coordinate
      food_x = random_number(0, territory.width, scale);
      // Generate a random number for the food y-coordinate
      food_y = random_number(0, territory.height, scale);
      // if the new food location is where the snake currently is, generate a new food location
      snake.forEach(function has_snake_eaten_food(part) {
        const has_eaten = part.x == food_x && part.y == food_y;
        if (has_eaten) gen_food();
      });
    }
    
function change_direction(event) {
      const LEFT_KEY = 37;
      const RIGHT_KEY = 39;
      const UP_KEY = 38;
      const DOWN_KEY = 40;
      
    // Prevent the snake from reversing
    
      if (changing_direction) return;
      changing_direction = true;
      const keyPressed = event.keyCode;
      const goingUp = direction_y === -scale;
      const goingDown = direction_y === scale;
      const goingRight = direction_x === scale;
      const goingLeft = direction_x === -scale;
      if (keyPressed === LEFT_KEY && !goingRight) {
        direction_x = -scale;
        direction_y = 0;
      }
      if (keyPressed === UP_KEY && !goingDown) {
        direction_x = 0;
        direction_y = -scale;
      }
      if (keyPressed === RIGHT_KEY && !goingLeft) {
        direction_x = scale;
        direction_y = 0;
      }
      if (keyPressed === DOWN_KEY && !goingUp) {
        direction_x = 0;
        direction_y = scale;
      }
    }

function move_snake() 
{  
  const head = {x: snake[0].x + direction_x, y: snake[0].y + direction_y}; // ajouter modulo pour grille infinie
  snake.unshift(head);
  const has_eaten_food = snake[0].x === food_x && snake[0].y === food_y;
      if (has_eaten_food) {
		challenger();
        // Generate new food location
        generate_food();
      } else {
        // Remove the last part of snake body
        snake.pop();
      }
}

function challenger() {
	challenge_completed = false;
	challenge.style.bottom = "50px";
	//~ while (!challenge_completed) {
		
	//~ }
	//~ challenge.style.bottom = "-550px";
}
function end() {
	snake.forEach(function(snakePart) {
			territoryContext.fillStyle = 'red';  
			territoryContext.strokestyle = 'darkblue';
			territoryContext.fillRect(snakePart.x, snakePart.y, scale, scale);  
			territoryContext.strokeRect(snakePart.x, snakePart.y, scale, scale);
			})
}
