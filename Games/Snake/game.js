class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.finalScoreElement = document.getElementById('finalScore');
        this.gameOverScreen = document.getElementById('gameOver');
        this.startScreen = document.getElementById('startScreen');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        
        // Mobile controls
        this.upBtn = document.getElementById('upBtn');
        this.downBtn = document.getElementById('downBtn');
        this.leftBtn = document.getElementById('leftBtn');
        this.rightBtn = document.getElementById('rightBtn');

        this.gridSize = 20;
        this.snake = [];
        this.food = null;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.lastRenderTime = 0;
        this.gameSpeed = 150; // Initial speed in ms
        this.isGameOver = false;
        this.isPaused = false;
        this.animationFrameId = null;

        this.setupCanvas();
        this.setupEventListeners();
        this.showStartScreen();
    }

    setupCanvas() {
        const containerWidth = this.canvas.parentElement.clientWidth;
        const size = Math.min(containerWidth - 40, 600);
        this.canvas.width = size;
        this.canvas.height = size;
        this.cellSize = size / this.gridSize;
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // Mobile controls
        this.upBtn.addEventListener('click', () => this.setDirection('up'));
        this.downBtn.addEventListener('click', () => this.setDirection('down'));
        this.leftBtn.addEventListener('click', () => this.setDirection('left'));
        this.rightBtn.addEventListener('click', () => this.setDirection('right'));

        // Touch controls
        let touchStartX = 0;
        let touchStartY = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touchEndX = e.touches[0].clientX;
            const touchEndY = e.touches[0].clientY;
            
            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) this.setDirection('right');
                else this.setDirection('left');
            } else {
                if (dy > 0) this.setDirection('down');
                else this.setDirection('up');
            }
        }, { passive: false });

        // Game buttons
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());

        // Difficulty selection
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setDifficulty(btn.dataset.difficulty);
            });
        });

        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleResize() {
        this.setupCanvas();
        if (!this.isGameOver && !this.startScreen.style.display) {
            this.draw();
        }
    }

    handleKeyPress(event) {
        const key = event.key.toLowerCase();
        const directions = {
            'arrowup': 'up',
            'arrowdown': 'down',
            'arrowleft': 'left',
            'arrowright': 'right',
            'w': 'up',
            's': 'down',
            'a': 'left',
            'd': 'right'
        };

        if (directions[key]) {
            event.preventDefault();
            this.setDirection(directions[key]);
        }
    }

    setDirection(newDirection) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (opposites[newDirection] !== this.direction) {
            this.nextDirection = newDirection;
        }
    }

    setDifficulty(level) {
        const speeds = {
            'easy': 150,
            'medium': 100,
            'hard': 70
        };
        this.gameSpeed = speeds[level];
    }

    showStartScreen() {
        this.startScreen.style.display = 'block';
        this.gameOverScreen.style.display = 'none';
    }

    startGame() {
        this.startScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        this.resetGame();
        this.gameLoop();
    }

    resetGame() {
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.scoreElement.textContent = '0';
        this.isGameOver = false;
        this.generateFood();
    }

    generateFood() {
        while (true) {
            this.food = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
            if (!this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y)) {
                break;
            }
        }
    }

    gameLoop(currentTime) {
        if (this.isGameOver) return;

        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));

        const secondsSinceLastRender = (currentTime - this.lastRenderTime) / 1000;
        if (secondsSinceLastRender < 1 / (1000 / this.gameSpeed)) return;

        this.lastRenderTime = currentTime;

        this.update();
        this.draw();
    }

    update() {
        this.direction = this.nextDirection;
        const head = { ...this.snake[0] };

        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check collision with walls
        if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
            this.gameOver();
            return;
        }

        // Check collision with self
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Check if food is eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
            this.generateFood();
            // Increase speed slightly
            if (this.gameSpeed > 50) {
                this.gameSpeed -= 2;
            }
        } else {
            this.snake.pop();
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.gridSize; i++) {
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();

            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }

        // Draw snake
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#0f0' : '#0a0';
            this.ctx.fillRect(
                segment.x * this.cellSize + 1,
                segment.y * this.cellSize + 1,
                this.cellSize - 2,
                this.cellSize - 2
            );

            // Add eyes to head
            if (index === 0) {
                this.ctx.fillStyle = '#000';
                const eyeSize = this.cellSize / 4;
                const eyeOffset = this.cellSize / 4;

                // Position eyes based on direction
                let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
                switch (this.direction) {
                    case 'up':
                        leftEyeX = segment.x * this.cellSize + eyeOffset;
                        leftEyeY = segment.y * this.cellSize + eyeOffset;
                        rightEyeX = segment.x * this.cellSize + this.cellSize - eyeOffset - eyeSize;
                        rightEyeY = segment.y * this.cellSize + eyeOffset;
                        break;
                    case 'down':
                        leftEyeX = segment.x * this.cellSize + eyeOffset;
                        leftEyeY = segment.y * this.cellSize + this.cellSize - eyeOffset - eyeSize;
                        rightEyeX = segment.x * this.cellSize + this.cellSize - eyeOffset - eyeSize;
                        rightEyeY = segment.y * this.cellSize + this.cellSize - eyeOffset - eyeSize;
                        break;
                    case 'left':
                        leftEyeX = segment.x * this.cellSize + eyeOffset;
                        leftEyeY = segment.y * this.cellSize + eyeOffset;
                        rightEyeX = segment.x * this.cellSize + eyeOffset;
                        rightEyeY = segment.y * this.cellSize + this.cellSize - eyeOffset - eyeSize;
                        break;
                    case 'right':
                        leftEyeX = segment.x * this.cellSize + this.cellSize - eyeOffset - eyeSize;
                        leftEyeY = segment.y * this.cellSize + eyeOffset;
                        rightEyeX = segment.x * this.cellSize + this.cellSize - eyeOffset - eyeSize;
                        rightEyeY = segment.y * this.cellSize + this.cellSize - eyeOffset - eyeSize;
                        break;
                }

                this.ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
                this.ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
            }
        });

        // Draw food
        this.ctx.fillStyle = '#f00';
        this.ctx.beginPath();
        this.ctx.arc(
            (this.food.x + 0.5) * this.cellSize,
            (this.food.y + 0.5) * this.cellSize,
            this.cellSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // Add shine effect to food
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(
            (this.food.x + 0.5) * this.cellSize - this.cellSize / 6,
            (this.food.y + 0.5) * this.cellSize - this.cellSize / 6,
            this.cellSize / 8,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    gameOver() {
        this.isGameOver = true;
        cancelAnimationFrame(this.animationFrameId);
        this.finalScoreElement.textContent = this.score;
        this.gameOverScreen.style.display = 'block';
    }

    restartGame() {
        this.startGame();
    }
}

// Initialize game when window loads
window.addEventListener('load', () => {
    new SnakeGame();
});