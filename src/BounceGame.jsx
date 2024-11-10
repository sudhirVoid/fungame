import React, { useState, useRef, useEffect } from 'react';

function BounceApp() {
  const [image, setImage] = useState(null);
  const canvasRef = useRef(null);
  const paddleWidth = 100;
  const paddleHeight = 20;
  const canvasWidth = 800;
  const canvasHeight = 500;
  const paddleAngle = 45 * (Math.PI / 180); // Paddle rotated 45 degrees

  const paddleRef = useRef({ x: canvasWidth / 2, y: canvasHeight - 50 });
  const ballRef = useRef({
    x: canvasWidth / 2,
    y: canvasHeight / 4,
    radius: 25,
    dx: 3,
    dy: 3,
  });

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => setImage(img);
    }
  };

  // Draw the image and paddle
  const draw = (ctx) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw the paddle at a 45-degree angle
    ctx.save();
    ctx.translate(paddleRef.current.x, paddleRef.current.y);
    ctx.rotate(paddleAngle); // Rotate 45 degrees
    ctx.fillStyle = '#333';
    ctx.fillRect(-paddleWidth / 2, -paddleHeight / 2, paddleWidth, paddleHeight);
    ctx.restore();

    // Draw the image as the "ball" if uploaded
    if (image) {
      ctx.drawImage(image, ballRef.current.x - ballRef.current.radius, ballRef.current.y - ballRef.current.radius, ballRef.current.radius * 2, ballRef.current.radius * 2);
    } else {
      // Fallback to a circle if no image is uploaded
      ctx.beginPath();
      ctx.arc(ballRef.current.x, ballRef.current.y, ballRef.current.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ff6347';
      ctx.fill();
      ctx.closePath();
    }
  };

  // Update the ball position and handle collisions
  const updateBall = () => {
    const ball = ballRef.current;

    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Check for collisions with walls
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvasWidth) {
      ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
      ball.dy = -ball.dy;
    }

    // Calculate paddle edges after rotation
    const paddleX1 = paddleRef.current.x - (paddleWidth / 2) * Math.cos(paddleAngle);
    const paddleY1 = paddleRef.current.y - (paddleWidth / 2) * Math.sin(paddleAngle);
    const paddleX2 = paddleRef.current.x + (paddleWidth / 2) * Math.cos(paddleAngle);
    const paddleY2 = paddleRef.current.y + (paddleWidth / 2) * Math.sin(paddleAngle);

    // Check for collision with paddle line
    const lineDist = Math.abs(
      (paddleY2 - paddleY1) * ball.x - (paddleX2 - paddleX1) * ball.y + paddleX2 * paddleY1 - paddleY2 * paddleX1
    ) / Math.sqrt((paddleY2 - paddleY1) ** 2 + (paddleX2 - paddleX1) ** 2);

    // Bounce off the paddle if the distance is less than or equal to the radius
    if (lineDist <= ball.radius) {
      const ballToPaddleAngle = Math.atan2(ball.y - paddleRef.current.y, ball.x - paddleRef.current.x);
      const bounceAngle = 2 * paddleAngle - ballToPaddleAngle;

      ball.dx = Math.cos(bounceAngle) * Math.hypot(ball.dx, ball.dy);
      ball.dy = Math.sin(bounceAngle) * Math.hypot(ball.dx, ball.dy);

      // Push ball slightly away to prevent repeated collision
      ball.x += ball.dx;
      ball.y += ball.dy;
    }

    // Reset if it falls below the screen
    if (ball.y + ball.radius > canvasHeight) {
      ball.x = canvasWidth / 2;
      ball.y = canvasHeight / 4;
    }
  };

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const animate = () => {
      draw(ctx);
      updateBall();
      requestAnimationFrame(animate);
    };

    animate(); // Start animation loop

    return () => cancelAnimationFrame(animate);
  }, [image]);

  // Move paddle based on cursor position
  const handleMouseMove = (e) => {
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;

    // Update paddle position based on mouse position
    paddleRef.current = { x: mouseX, y: mouseY };
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Image Bounce with Paddle</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <div
        style={{
          display: 'inline-block',
          border: '2px solid #333',
          marginTop: '20px',
        }}
        onMouseMove={handleMouseMove}
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{ backgroundColor: '#f0f0f0' }}
        />
      </div>
    </div>
  );
}

export default BounceApp;
