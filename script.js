
        // Game globals
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        let gameRunning = false;
        let score = 0;
        let highScore = parseInt(localStorage.getItem('starCatcherHighScore')) || 0;
        let timeLeft = 60;
        let starSpeed = 2;
        
        // Game objects
        const basket = {
            x: canvas.width / 2 - 40,
            y: canvas.height - 60,
            width: 80,
            height: 40,
            speed: 8
        };
        
        const stars = [];
        const keys = {};
        
        // Event listeners for keyboard input
        document.addEventListener('keydown', (e) => {
            keys[e.key] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            keys[e.key] = false;
        });
        
        // Create a new falling star at random position
        function createStar() {
            return {
                x: Math.random() * (canvas.width - 40),
                y: -20,
                size: 15,
                speed: starSpeed + Math.random() * 2
            };
        }
        
        // Draw a five-point star polygon
        function drawStar(x, y, size) {
            ctx.fillStyle = '#FFD700';
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            // Calculate star points
            const spikes = 5;
            const outerRadius = size;
            const innerRadius = size * 0.4;
            
            for (let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / spikes - Math.PI / 2;
                const px = x + Math.cos(angle) * radius;
                const py = y + Math.sin(angle) * radius;
                
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        
        // Draw the basket as a brown rectangle with handle
        function drawBasket() {
            // Main basket body
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(basket.x, basket.y, basket.width, basket.height);
            
            // Basket rim
            ctx.fillStyle = '#654321';
            ctx.fillRect(basket.x, basket.y, basket.width, 8);
            
            // Basket handle
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(basket.x + basket.width/2, basket.y - 10, 15, 0, Math.PI, true);
            ctx.stroke();
        }
        
        // Update basket position based on key input
        function updateBasket() {
            if (keys['ArrowLeft'] && basket.x > 0) {
                basket.x -= basket.speed;
            }
            if (keys['ArrowRight'] && basket.x < canvas.width - basket.width) {
                basket.x += basket.speed;
            }
        }
        
        // Update all falling stars positions
        function updateStars() {
            for (let i = stars.length - 1; i >= 0; i--) {
                const star = stars[i];
                star.y += star.speed;
                
                // Check collision with basket
                if (star.x > basket.x - 15 && 
                    star.x < basket.x + basket.width + 15 &&
                    star.y > basket.y - 15 && 
                    star.y < basket.y + basket.height) {
                    
                    // Star caught!
                    score++;
                    stars.splice(i, 1);
                    
                    // Update high score
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem('starCatcherHighScore', highScore);
                    }
                }
                // Remove stars that fell off screen
                else if (star.y > canvas.height + 20) {
                    stars.splice(i, 1);
                }
            }
        }
        
        // Render score and timer display
        function drawUI() {
            ctx.fillStyle = 'white';
            ctx.font = '24px Arial';
            
            // Current score (top-left)
            ctx.fillText(`Score: ${score}`, 20, 30);
            
            // High score (top-right)
            ctx.fillText(`High Score: ${highScore}`, canvas.width - 200, 30);
            
            // Timer (top-center)
            ctx.fillStyle = timeLeft <= 10 ? '#FF4444' : 'white';
            ctx.fillText(`Time: ${timeLeft}s`, canvas.width/2 - 50, 30);
        }
        
        // Main game rendering loop
        function render() {
            // Clear canvas with gradient background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#001122');
            gradient.addColorStop(1, '#003366');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw game objects
            drawBasket();
            
            stars.forEach(star => {
                drawStar(star.x, star.y, star.size);
            });
            
            drawUI();
        }
        
        // Increase difficulty every 15 seconds
        function updateDifficulty(gameTime) {
            const difficultyLevel = Math.floor((60 - timeLeft) / 15);
            starSpeed = 2 + difficultyLevel * 1.5;
        }
        
        // Main game loop
        function gameLoop() {
            if (!gameRunning) return;
            
            updateBasket();
            updateStars();
            updateDifficulty();
            
            // Spawn new stars randomly
            if (Math.random() < 0.03 + (60 - timeLeft) * 0.001) {
                stars.push(createStar());
            }
            
            render();
            requestAnimationFrame(gameLoop);
        }
        
        // Game timer countdown
        function startTimer() {
            const timer = setInterval(() => {
                timeLeft--;
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    endGame();
                }
            }, 1000);
        }
        
        // End game and show results
        function endGame() {
            gameRunning = false;
            document.getElementById('finalScore').textContent = 
                `You caught ${score} stars! ${score === highScore ? '🎉 New High Score!' : ''}`;
            document.getElementById('gameOver').style.display = 'block';
        }
        
        // Initialize and start new game
        function startGame() {
            gameRunning = true;
            score = 0;
            timeLeft = 60;
            starSpeed = 2;
            stars.length = 0;
            basket.x = canvas.width / 2 - 40;
            
            document.getElementById('gameOver').style.display = 'none';
            
            startTimer();
            gameLoop();
        }
        
        // Start the game when page loads
        window.addEventListener('load', () => {
            render(); // Show initial state
            
            // Start game on any key press
            document.addEventListener('keydown', function startOnKey() {
                startGame();
                document.removeEventListener('keydown', startOnKey);
            }, { once: true });
        });
    