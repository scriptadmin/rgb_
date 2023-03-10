const CANVAS_BORDER_COLOUR = 'white';
        const CANVAS_BACKGROUND_COLOUR = "black";
        const HERO_COLOUR = 'rgb(0, 255, 0)';
        const PROJECTILE_COLOUR = 'red';
        const CIRCLE_COLOUR = 'blue';
        const RADIUS = 10;

        let hero = [ {x: 225, y: 225} ]

        let projectiles = [];
        let circles = [];

        let score;
        let lvl;
        let gameSpeed;
        let gotHit;
        let counter;
        let leftPressed = false, rightPressed = false, upPressed = false, downPressed = false;

        const gameCanvas = document.getElementById("gameCanvas");
        const ctx = gameCanvas.getContext("2d");

        document.addEventListener("keydown", keyDownHandler, false);
        document.addEventListener("keyup", keyUpHandler, false);
        document.addEventListener("click", mouseClickHandler, false);

        callMain(); 

        
        function callMain() {
            gotHit = false;
            score = 0;
            lvl = 0;
            counter = 0;
            gameSpeed = 1;
            projectiles.splice(0, projectiles.length);
            circles.splice(0, circles.length);
            main();
        }


        function main() {
            
            if (gotHit) {
                updateHighest();
                callMain();             
                return;                 
            }

            clearCanvas();
            drawCircles();
            createProjectile();
            drawProjectiles();
            moveHero();
            drawHero();
            checkHero();

            requestAnimationFrame(main);
        }


        function clearCanvas() {
            ctx.beginPath();
            ctx.fillStyle = CANVAS_BACKGROUND_COLOUR;
            ctx.strokeStyle = CANVAS_BORDER_COLOUR;
            ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
            ctx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height);
            ctx.closePath();
        }


        function drawHero() {
            ctx.beginPath();
            ctx.fillStyle = HERO_COLOUR;
            ctx.fillRect(hero[0].x - 5, hero[0].y - 5, 10, 10);
            ctx.strokeRect(hero[0].x - 5, hero[0].y - 5, 10, 10);
            ctx.closePath();
        }


        function checkHero() {

            if (!gotHit) {                  
                
                if(score < 3000)           
                    score += 25;
                else
                    score += 3;             
                
                if(score / 300 > lvl) {
                    lvl += 1;
                    gameSpeed += 1;
                }

                document.getElementById('score').innerHTML = score;
            }
        }
        
        
        function createProjectile() {
            
            if(projectiles.length < (gameSpeed / 5)) { 
                
                let projectileX = randomTen(0, gameCanvas.width);           
                let projectileY = randomTen(0, gameCanvas.height);
                let randomness = Math.floor(Math.random()*2) % 2;
                let angle;
                
                
                if(projectileX < projectileY) {

                    if(randomness == 0) {          
                        angle = Math.random()*180;
                        projectiles.push( { x: 0, 
                                            y: projectileY, 
                                            dx: ((RADIUS+gameSpeed)*Math.cos(angle))/3, 
                                            dy: ((RADIUS+gameSpeed)*Math.sin(angle))/3
                                        } )
                    }
                    else {                        
                        angle = Math.random()*180+180;
                        projectiles.push( { x: gameCanvas.width, 
                                            y: projectileY, 
                                            dx: ((RADIUS+gameSpeed)*Math.cos(angle))/3, 
                                            dy: ((RADIUS+gameSpeed)*Math.sin(angle))/3 
                                        } )
                    }
                }

                else {          
                    if(randomness == 0) {          
                        angle = Math.random()*180-90;
                        projectiles.push( { x: projectileX, 
                                            y: 0, 
                                            dx: ((RADIUS+gameSpeed)*Math.cos(angle))/3, 
                                            dy: ((RADIUS+gameSpeed)*Math.sin(angle))/3
                                        } )
                    }
                    else {                          // Spawns DOWN
                        angle = Math.random()*180+90;
                        projectiles.push( { x: projectileX, 
                                            y: gameCanvas.height, 
                                            dx: ((RADIUS+gameSpeed)*Math.cos(angle))/3, 
                                            dy: ((RADIUS+gameSpeed)*Math.sin(angle))/3 
                                        } )
                    }
                }
            }
        }

        function drawProjectiles() {
            projectiles.forEach(stuffProjectile);
        }

        
        // Called by drawProjectile() on every RedBall (projectiles)
        function stuffProjectile(projectilePart) {                  // Both draw and Move -> stuff :^)
            
            let x = hero[0].x;
            let y = hero[0].y;
            
            // This simple calculation means "Is the Hero touching this projectile?"
            if(Math.sqrt((projectilePart.x-x)*(projectilePart.x-x) + (projectilePart.y-y)*(projectilePart.y-y)) < RADIUS)
                gotHit = true;

            // Moves the projectile
            projectilePart.x += projectilePart.dx;
            projectilePart.y += projectilePart.dy;

            // Removes the projectile if "out of bounds"
            if(projectilePart.x > gameCanvas.width || projectilePart.x < 0 || projectilePart.y > gameCanvas.height || projectilePart.y < 0)
                projectiles.splice(projectiles.indexOf(projectilePart), 1);

            // Draws the projectile
            else {
                ctx.beginPath();
                ctx.fillStyle = PROJECTILE_COLOUR;
                ctx.arc(projectilePart.x, projectilePart.y, 10, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();
            }
        }


        // Moves the Hero :^)
        function moveHero() {
            
            touchingCircles();

            if(leftPressed && hero[0].x > 9)
                hero[0].x = hero[0].x - 6;
            else if(rightPressed && hero[0].x < gameCanvas.width - 9)
                hero[0].x = hero[0].x + 6;
            if(upPressed && hero[0].y > 9)
                hero[0].y = hero[0].y - 6;
            else if(downPressed && hero[0].y < gameCanvas.height - 9)
                hero[0].y = hero[0].y + 6;

            touchingCircles();
        }


        // If the Hero is touching a BlueBall (circles) he gets "knocked" a bit away
        function touchingCircles() {
            
            let a = hero[0].x;
            let b = hero[0].y;
            
            for(var n = 0; n < circles.length; n++) {
                
                let circ = circles[n];
                let dist = Math.sqrt((circ.x-a)*(circ.x-a) + (circ.y-b)*(circ.y-b)) -circ.r -5;
                // This simple calculation means "Are you inside this circle?"
                if(dist < 0) {   
                    
                    if(a < circ.x)
                        hero[0].x = hero[0].x - Math.abs(dist);
                    else if (a > circ.x)
                        hero[0].x = hero[0].x + Math.abs(dist);
                    
                    if(b < circ.y)
                        hero[0].y = hero[0].y - Math.abs(dist);
                    else if (b > circ.y)
                        hero[0].y = hero[0].y + Math.abs(dist);
                    
                    return true;
                }
            }
            
            return false;
        }


        // Creates a BlueBall (circles)
        function createCircle() { 

            if(circles.length < 5 && counter >= 59) {               // No more than 5 because of REASONZ
                counter = 0;
                let tmpX = Math.random()*(gameCanvas.width-37);
                let tmpY = Math.random()*(gameCanvas.height-37);
                if(tmpX < 37) tmpX += 37;                           // All of this is just to prevent "out of bounds"
                if(tmpY < 37) tmpY += 37;                           // on the hero, which would make you invincible
                circles.push( {x: tmpX, y: tmpY, r: 3});
            }
            
            else
                counter += 1 % 60;
        }


        // Can you see how lazy I am? Both create and draw in the same function huehue
        function drawCircles(){
            createCircle();
            circles.forEach(drawCircle);
        }

        
        // Simply draws the circle, called by drawCircles()
        function drawCircle(circlePart) {
            
            if(circlePart.r < 18) {             // "18" is simply the maximum range, I'm lazy and I won't put a constant
                circlePart.r += 0.1;
                ctx.fillStyle = CIRCLE_COLOUR;
            }
            
            else 
                ctx.fillStyle = "blue";            // Easter Egg for whoever knows me AHAHAH
    
            // Draws the BlueBall (circles)
            ctx.beginPath();
            ctx.arc(circlePart.x, circlePart.y, circlePart.r, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        }
        

        // If clicking, calls hitTest with pointer's relatives coordinates
        function mouseClickHandler(e) {
            hitTest(e.x - gameCanvas.offsetLeft, e.y - gameCanvas.offsetTop);
        }


        // If the click is inside any BlueBall (circles)..
        function hitTest(ex, ey) {
            
            for(var n = 0; n < circles.length; n++) { 
                
                let xc = circles[n].x;
                let yc = circles[n].y;
                
                if(Math.sqrt((xc-ex)*(xc-ex) + (yc-ey)*(yc-ey)) < circles[n].r) {
                    counter = 0;                                // reset the counter for smoothness
                    score += Math.floor(10000/circles[n].r);    // get points for hitting the circle
                    circles.splice(n,1);                        // remove the circle
                }
            }
        }

        
        // Key Handler (Down)
        function keyDownHandler(e) {
            if(e.keyCode == 37) 
                leftPressed = true;
            if(e.keyCode == 39) 
                rightPressed = true;
            if(e.keyCode == 38) 
                upPressed = true;
            if(e.keyCode == 40) 
                downPressed = true;
        }
        

        // Key Handler (Up)
        function keyUpHandler(e) {
            if(e.keyCode == 37) 
                leftPressed = false;
            if(e.keyCode == 39) 
                rightPressed = false;
            if(e.keyCode == 38) 
                upPressed = false;
            if(e.keyCode == 40) 
                downPressed = false;
        }

        
        // Simple random
        function randomTen(min, max) {
            return Math.round((Math.random() * (max-min) + min) / 10) * 10;
        }

        
        // Updates the highest score (this run), if needed
        function updateHighest() {
            let tmp = highest.innerHTML;
            if(tmp < score)
                highest.innerHTML = score; 
        }