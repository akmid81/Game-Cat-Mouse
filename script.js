	let score;
	let cat;
	let mouse;
	let dogs = [];
	let animals = [];
	let id;
	let lawnCoord;
	let champions;
	
	if(localStorage.champions === undefined) {
		champions = [];
	} else {
		champions = JSON.parse(localStorage.champions);
	};
	
	let game = {
		pauseGame() {
			game.intervals.clear();
			
			pause.hidden = true;
			resume.hidden = false;
		},
		
		resumeGame() {
			game.intervals.set();
			
			pause.hidden = false;
			resume.hidden = true;
		},
		
		clearGame() {
			game.intervals.clear();
			
			for(let animal of animals) {
				animal.delAnimal();
			};
			
			dogs.length = 0;
			animals.length = 0;
			id = 1;
		},
		
		stopGame() {
			game.clearGame();
			
			document.body.insertAdjacentHTML('beforeend', '<div class="rezult" id="end"><div>Ваш счет: ' + score + '</div><input type="button" id="restart" onclick="game.restart()" value="Начать заново"></input></div>');
			
			if(champions.length < 10) {
				game.addChampion();
			} else {
				for(let c of champions) {
					if(score > c.score) {
						champions.length = 9;
						game.addChampion();
						break;
					};
				};
			};
		},
		
		saveScore() {
			champions.push({name: playerName.value, score: score});
			
			champions.sort((a, b) => b.score - a.score);
			
			let json = JSON.stringify(champions);
			localStorage.setItem('champions', json);
			
			game.drawChampionsTable();
			
			game.restart();
		},
		
		restart() {
			end.remove();
			startGame();
		},
		
		intervals: {
			set(){
				for(let a of animals) {
					a.move();
				};
			},
			
			clear() {
				for(let a of animals) {
					clearInterval(a.interval);
				};
			}
		},
		
		addChampion() {
			end.insertAdjacentHTML('beforeend', '<div>Вы попали в таблицу рекордов, напишите имя:</div><input type="text" id="playerName" value=""></input><input type="button" onclick="game.saveScore()" value="Сохранить">');
		},
		
		drawChampionsTable() {
			champ.innerHTML = '';
			for(let c of champions) {
				let nameT = document.createElement('div');
				nameT.innerHTML = c.name;
				champ.append(nameT);
				let scoreT = document.createElement('div');
				scoreT.innerHTML = c.score;
				champ.append(scoreT);
			};
		},
	};

	game.drawChampionsTable();
	
	class Animal {
		constructor(type, timeout) {
			let name = type + id++;
			this.head = document.createElement('div');
			this.head.setAttribute('id', name);
			this.head.classList.add("animal");
			this.head.classList.add(type);
			this.head.setAttribute('hidden', true);
			this.type = type;
			this.timeout = timeout;
			this.interval = '';
			this.head.insertAdjacentHTML('beforeend', '<img width="36" height="36" style="margin: -6px;" alt="" src="' + type + '.png">');
			lawn.append(this.head);
		}
				
		changeTrend() {
			let x = getRandomInt(0, 4);
			this.trend = (x == 0) ? 'up' :
						(x == 1) ? 'down' :
						(x == 2) ? 'left' : 'right';
		}
			
		appear(x = getRandomInt(0, 24)*24, y = getRandomInt(0, 24)*24) {
			let head = this.head;
			head.hidden = false;
			head.style.position = 'relative';
			head.style.top = y + 'px'
			head.style.left = x + 'px'
				
			let coord = head.getBoundingClientRect();
					
			head.style.position = 'fixed';
			head.style.top = coord.top + 'px';
			head.style.left = coord.left + 'px';
		}
			
		delAnimal() {
			this.head.remove();
			if(this.type == 'cat') document.removeEventListener('keydown', cat.changeTrend);
		}
			
		move() {
			this.interval = setInterval( () => {
				if(!this.step()) { 
					if(this == cat) game.stopGame();
				};
					
				if(animals.length > 0) {
					checkPosition();
					if(this != cat) this.changeTrend();
				};
			}, this.timeout);
		}
			
		step() {
			let head = this.head;
			let trend = this.trend;
				
			let coord = head.getBoundingClientRect();
					
			head.style.position = 'fixed';
			head.style.top = coord.top + 'px';
			head.style.left = coord.left + 'px';
				
			if(trend == 'up') {
				let top = coord.top - 24;
				if(!isBorder(top, coord.left)) {
					head.style.top = top + 'px';
					return true;
				};
				return;
			} else if(trend == 'down') {
				let top = coord.top + 24;
				if(!isBorder(top, coord.left)) {
					head.style.top = top + 'px';
					return true;
				};
				return;
			} else if(trend == 'left') {
				let left = coord.left - 24;
				if(!isBorder(coord.top, left)) {
					head.style.left = left + 'px';
					return true;
				};
				return;
			} else if(trend == 'right') {
				let left = coord.left + 24;
				if(!isBorder(coord.top, left)) {
					head.style.left = left + 'px';
					return true;
				};
				return;
			};
		}
	}
		
	class Cat extends Animal {
		constructor(type, timeout) {
			super(type, timeout);
			this.trend = 'up';
		}
			
		changeTrend(e) {
			e.preventDefault();
				
			let key = e.code;
			
			if(key == 'ArrowUp') {
				cat.trend = 'up';
			} else if(key == 'ArrowDown') {
				cat.trend = 'down';
			} else if(key == 'ArrowLeft') {
				cat.trend = 'left';
			} else if(key == 'ArrowRight') {
				cat.trend = 'right';
			};
		}
	};
		
	class Dog extends Animal {
		constructor(type, timeout) {
			super(type, timeout);
			this.trend = '';
		}
			
		changeTrend() {
			let dogTrend = [];
			
			if(cat.head.offsetTop < this.head.offsetTop) {
				dogTrend.push('up');
			} else if(cat.head.offsetTop > this.head.offsetTop) {
				dogTrend.push('down');
			};
			
			if(cat.head.offsetLeft < this.head.offsetLeft) {
				dogTrend.push('left');
			} else if(cat.head.offsetLeft > this.head.offsetLeft) {
				dogTrend.push('right');
			};
			
			this.trend = dogTrend[getRandomInt(0, 2)];
			dogTrend.lenght = 0;
		}
	};
	
	function startGame() {
		score = 0;
		showScore.innerHTML = score;
		
		game.clearGame();
		pause.hidden = false;
		resume.hidden = true;
	
		lawnCoord = lawn.getBoundingClientRect();
		
		catAppear();
		mouseAppear();
		cat.move();
		mouse.move();
	}
	
	function catAppear() {
		cat = new Cat('cat', 400);
		animals.push(cat);
		cat.appear(288, 288);
		document.addEventListener('keydown', cat.changeTrend);
	}
			
	function mouseAppear() {	
		mouse = new Animal('mouse', 1000);
		animals.push(mouse);
		mouse.appear();
		mouse.changeTrend();
	}
		
	function dogAppear() {
		dogs.push(new Dog('dog', 700));
		animals.push(dogs[dogs.length - 1]);
		dogs[dogs.length - 1].appear();
		dogs[dogs.length - 1].changeTrend();
	}
	
	function checkPosition() {
		if(cat.head.offsetTop == mouse.head.offsetTop 
		&& cat.head.offsetLeft == mouse.head.offsetLeft) {
				
			game.intervals.clear();				
				
			mouse.delAnimal();
			score += 10;
			showScore.innerHTML = score;
				
			if(score == 50 || score == 100) {
				dogAppear();
			} else if (score > 50) {
				for(let dog of dogs) {
					dog.timeout = Math.round(dog.timeout / 1.06);
				};
			};
				
			cat.timeout = Math.round(cat.timeout / 1.06);

			game.intervals.set();

			setTimeout(() => {
				mouseAppear();
				mouse.move();
			}, 500);
		};
			
		if(dogs.length > 0) {
			for(let dog of dogs) {
				if(cat.head.offsetTop == dog.head.offsetTop 
				&& cat.head.offsetLeft == dog.head.offsetLeft) {
					game.stopGame();
					break;
				};
			};
		};
	}	
	
	function isBorder(t, l) {
		if(t <= lawnCoord.top 
			|| t >= (lawnCoord.bottom - 24)
			|| l <= lawnCoord.left
			|| l >= (lawnCoord.right - 24)) {
				return true;
		};
	};
	
	function getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	}