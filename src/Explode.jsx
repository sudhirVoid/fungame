import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import './ExplodingAvatar.css';

const ExplodingAvatar = () => {
  const [currentImage, setCurrentImage] = useState(null);
  const [clickCount, setClickCount] = useState(0);
  const [allPieces, setAllPieces] = useState([]);
  const [totalExplosions, setTotalExplosions] = useState(0);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCurrentImage(e.target.result);
        setClickCount(0);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate random glass shard shape
  const generateGlassShape = (size) => {
    const points = [];
    
    // 3 points for a triangle
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Define the 3 points of the triangle
    const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]; // 120 degrees apart for equilateral-like triangles
    const radius = size / 2;
  
    angles.forEach(angle => {
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    });
    
    return `polygon(${points.join(' ')})`;
  };

  const generateBackgroundPosition = () => {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    return `${x}% ${y}%`;
  };

  // Generate glass shards
  const generatePieces = (imageUrl) => {
    const numPieces = 30; // Number of pieces
    const newPieces = [];
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    
    // Define the three vertices of the triangle
    const triangleVertices = [
        { x: centerX - 150, y: centerY - 150 }, // Vertex 1
        { x: centerX + 150, y: centerY - 150 }, // Vertex 2
        { x: centerX, y: centerY + 150 }        // Vertex 3
    ];
    
    for (let i = 0; i < numPieces; i++) {
      const size = 20 + Math.random() * 40; // Piece size
      const randomEdge = Math.floor(Math.random() * 3); // Random edge to pick
      const vertex1 = triangleVertices[randomEdge];
      const vertex2 = triangleVertices[(randomEdge + 1) % 3]; // Next vertex in the triangle
      
      // Distribute pieces along the edge between two vertices
      const edgeFactor = Math.random(); // Random position along the edge
      const x = vertex1.x + (vertex2.x - vertex1.x) * edgeFactor;
      const y = vertex1.y + (vertex2.y - vertex1.y) * edgeFactor;
      
      newPieces.push({
        id: `explosion-${totalExplosions}-piece-${i}`,
        imageUrl,
        x: x,
        y: y,
        rotation: Math.random() * 360,
        velocityX: (Math.random() - 0.5) * 40,
        velocityY: (Math.random() - 0.5) * 40 - 10, // Slight upward bias
        rotationSpeed: (Math.random() - 0.5) * 20,
        size: size,
        clipPath: generateGlassShape(size),
        backgroundPosition: generateBackgroundPosition(),
        scale: 1 + Math.random() * 0.3,
      });
    }
    
    return newPieces;
};


  const handleClick = () => {
    if (clickCount < 6) {
      setClickCount(prev => prev + 1);
      // Play crack sound
      const audio = new Audio('sword.mp3');
      audio.play().catch(() => {}); // Ignore errors if audio can't play
    } else if (clickCount === 6) {
      const newPieces = generatePieces(currentImage);
      setAllPieces(prev => [...prev, ...newPieces]);
      setTotalExplosions(prev => prev + 1);
      setCurrentImage(null);
      setClickCount(0);
      // Play shatter sound
      const audio = new Audio('data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==');
      audio.play().catch(() => {}); // Ignore errors if audio can't play
    }
  };

  React.useEffect(() => {
    if (allPieces.length === 0) return;

    let animationFrameId;
    const animate = () => {
      setAllPieces(currentPieces => 
        currentPieces.map(piece => {
          let newX = piece.x + piece.velocityX;
          let newY = piece.y + piece.velocityY;
          let newVelocityX = piece.velocityX;
          let newVelocityY = piece.velocityY + 0.5; // Add gravity
          
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          // More realistic bouncing
          if (newX < 0 || newX > viewportWidth - piece.size) {
            newVelocityX = -newVelocityX * 0.6;
            newX = newX < 0 ? 0 : viewportWidth - piece.size;
          }
          
          if (newY < 0 || newY > viewportHeight - piece.size) {
            newVelocityY = -newVelocityY * 0.6;
            newY = newY < 0 ? 0 : viewportHeight - piece.size;
            // Add friction when hitting the ground
            newVelocityX *= 0.95;
          }

          return {
            ...piece,
            x: newX,
            y: newY,
            velocityX: newVelocityX * 0.99,
            velocityY: newVelocityY,
            rotation: piece.rotation + piece.rotationSpeed,
          };
        })
      );
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [allPieces.length]);

  const scale = 1 + (clickCount * 0.02); // Subtle scale for glass effect

  return (
    <div className="avatar-container">
      <div className="explosion-container">
        {allPieces.map(piece => (
          <div
            key={piece.id}
            className="avatar-piece"
            style={{
              backgroundImage: `url(${piece.imageUrl})`,
              backgroundPosition: piece.backgroundPosition,
              backgroundSize: `${piece.scale * 400}px`,
              transform: `translate(${piece.x}px, ${piece.y}px) rotate(${piece.rotation}deg)`,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              clipPath: piece.clipPath,
            }}
          />
        ))}
      </div>

      <div className="avatar-overlay">
        {!currentImage ? (
          <label className="upload-label">
            <Upload className="upload-icon" />
            <span className="upload-text">
              {allPieces.length === 0 ? 'Upload, Smash, Be cool' : 'Smash again'}
            </span>
            <input
              type="file"
              className="file-input"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
        ) : (
          <div 
            className={`avatar-wrapper ${clickCount > 0 ? `clicked-${clickCount}` : ''}`} 
            onMouseOver={handleClick}
          >
            <div
              className="avatar-image"
              style={{
                backgroundImage: `url(${currentImage})`,
                transform: `scale(${scale})`,
              }}
            />
            <div className="crack-overlay">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={`crack crack-${i}`} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplodingAvatar;