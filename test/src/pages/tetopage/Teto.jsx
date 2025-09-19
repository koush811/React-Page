import React, { useEffect, useRef, useState } from "react";
useEffect(() => {
  if(!canvasRef.current) return;
  canvasRef.current.width = (LEFT_HOLD_WIDTH + COLS + 6) * BLOCK_SIZE;
  canvasRef.current.height = ROWS * BLOCK_SIZE;

  draw(); // 初回描画トリガー
}, [canvasRef]);

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;
const LEFT_HOLD_WIDTH = 6;

const mino = [
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // I
  [[1,1],[1,1]], // O
  [[0,1,0],[1,1,1],[0,0,0]], // T
  [[0,1,1],[1,1,0],[0,0,0]], // S
  [[1,1,0],[0,1,1],[0,0,0]], // Z
  [[1,0,0],[1,1,1],[0,0,0]], // J
  [[0,0,1],[1,1,1],[0,0,0]]  // L
];

const COLORS = ['cyan','yellow','purple','green','red','blue','orange'];

const SRS_KICKS_I = [
  [[0,0], [-2,0], [1,0], [-2,1], [1,-2]],
  [[0,0], [-1,0], [2,0], [-1,-2], [2,1]],
  [[0,0], [2,0], [-1,0], [2,-1], [-1,2]],
  [[0,0], [1,0], [-2,0], [1,2], [-2,-1]]
];

const SRS_KICKS_OTHERS = [
  [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
  [[0,0], [1,0], [1,-1], [0,2], [1,2]],
  [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
  [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]]
];

export default function Tetris() {
  const canvasRef = useRef(null);
  const [board, setBoard] = useState(() => Array.from({length: ROWS}, () => Array(COLS).fill(0)));
  const [currentMinoIndex, setCurrentMinoIndex] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [current, setCurrent] = useState(mino[0]);
  const [currentX, setCurrentX] = useState(3);
  const [currentY, setCurrentY] = useState(0);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);

  const [holdMino, setHoldMino] = useState(null);
  const [holdColor, setHoldColor] = useState(null);
  const [holdUsed, setHoldUsed] = useState(false);
  const [holdRotation, setHoldRotation] = useState(0);
  const [holdMinoIndex, setHoldMinoIndex] = useState(null);

  const [minoQueue, setMinoQueue] = useState([]);
  const [nextMinoIndex, setNextMinoIndex] = useState(null);
  const [nextMinoShape, setNextMinoShape] = useState(null);
  const [nextMinoColor, setNextMinoColor] = useState(null);

  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(4000);
  const [timer, setTimer] = useState("00:00");

  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [lockTimer, setLockTimer] = useState(null);
  const [isCleared, setIsCleared] = useState(false);

  const [gameInterval, setGameInterval] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);
  const [startTimestamp, setStartTimestamp] = useState(null);
  const [pauseElapsed, setPauseElapsed] = useState(0);

  const shuffle = (array) => {
    for(let i=array.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const refillQueue = () => {
    setMinoQueue((prev) => [...prev, ...shuffle([...Array(mino.length).keys()])]);
  };

  const rotateByCenter = (shape, cx, cy, isCCW = false) => {
    const N = shape.length;
    let newShape = Array.from({length: N}, () => Array(N).fill(0));
    for(let y=0;y<N;y++){
      for(let x=0;x<N;x++){
        if(!shape[y][x]) continue;
        let dx = x-cx;
        let dy = y-cy;
        let rx, ry;
        if(!isCCW){
          rx = dy;
          ry = -dx;
        }else{
          rx = -dy;
          ry = dx;
        }
        let nx, ny;
        if (N===4){
          nx = Math.floor(cx + rx + 0.01);
          ny = Math.floor(cy + ry + 0.01);
        }else{
          nx = Math.round(cx + rx);
          ny = Math.round(cy + ry);
        }
        if(ny>=0 && ny<N && nx>=0 && nx<N){
          newShape[ny][nx] = shape[y][x];
        }
      }
    }
    return newShape;
  };

  const rotate = (shape, minoIndex) => {
    if(minoIndex === 0) return rotateByCenter(shape,1.5,1.5,false);
    if(minoIndex === 1) return shape.map(row => row.slice());
    return rotateByCenter(shape,1,1,false);
  };

  const rotateCCW = (shape, minoIndex) => {
    if(minoIndex === 0) return rotateByCenter(shape,1.5,1.5,true);
    if(minoIndex === 1) return shape.map(row => row.slice());
    return rotateByCenter(shape,1,1,true);
  };

  const collision = (nx, ny, shape, b = board) => {
    for(let y=0; y<shape.length; y++){
      for(let x=0; x<shape[y].length; x++){
        if(shape[y][x]){
          let px = nx + x;
          let py = ny + y;
          if(px<0 || px>=COLS || py>=ROWS || (py>=0 && b[py][px])) return true;
        }
      }
    }
    return false;
  };

  const merge = () => {
    setBoard(prev => {
      const newBoard = prev.map(row => row.slice());
      for(let y=0; y<current.length; y++){
        for(let x=0; x<current[y].length; x++){
          if(current[y][x]){
            newBoard[currentY + y][currentX + x] = currentColor;
          }
        }
      }
      return newBoard;
    });
    setScore(prev => prev + 10);
  };

  const clearLines = () => {
    setBoard(prev => {
      let newBoard = prev.filter(row => !row.every(cell => cell !== 0));
      let linesCleared = ROWS - newBoard.length;
      for(let i=0; i<linesCleared; i++){
        newBoard.unshift(Array(COLS).fill(0));
      }
      if(linesCleared > 0){
        setScore(prev => prev + linesCleared * 100);
        checkClear(score + linesCleared * 100);
      }
      return newBoard;
    });
  };

  const checkClear = (newScore) => {
    if(newScore >= maxScore){
      if(gameInterval) clearInterval(gameInterval);
      setIsCleared(true);
      stopTimer();
    }
  };

  const SRSRotate = (shape, x, y, rotateFunc, kicks) => {
    const rotated = rotateFunc(shape);
    for(let i=0; i<kicks.length; i++){
      const [dx, dy] = kicks[i];
      if(!collision(x+dx, y+dy, rotated)){
        return {success:true, shape:rotated, x:x+dx, y:y+dy};
      }
    }
    return {success:false, shape, x, y};
  };

  // Game timer functions
  const startTimer = () => {
    setStartTimestamp(Date.now());
    if(timerInterval) clearInterval(timerInterval);
    const tid = setInterval(() => {
      setTimer(prev => {
        if(!startTimestamp) return "00:00";
        const elapsed = Math.floor( (pauseElapsed + (Date.now() - startTimestamp))/1000 );
        const min = String(Math.floor(elapsed/60)).padStart(2,'0');
        const sec = String(elapsed%60).padStart(2,'0');
        return `${min}:${sec}`;
      });
    }, 1000);
    setTimerInterval(tid);
  };

  const stopTimer = () => {
    if(timerInterval) clearInterval(timerInterval);
    setPauseElapsed(prev => prev + (Date.now() - (startTimestamp || Date.now())));
    setStartTimestamp(null);
  };

  // Game control functions
  const gameLoop = () => {
    if(!gameOver && !isPaused){
      drop();
    }
  };

  const drop = () => {
    if(!collision(currentX, currentY+1, current)){
      setCurrentY(currentY => currentY+1);
      if(isLocking){
        setIsLocking(false);
        if(lockTimer){ clearTimeout(lockTimer); setLockTimer(null);}
      }
    }else{
      if(!isLocking){
        setIsLocking(true);
        const tid = setTimeout(()=>{
          if(collision(currentX, currentY+1, current)){
            merge();
            clearLines();
            newTetromino();
          }
          setIsLocking(false);
          setLockTimer(null);
        },1000);
        setLockTimer(tid);
      }
    }
  };

  const hold = () => {
    if(holdUsed) return;
    if(!holdMino){
      setHoldMino(current);
      setHoldColor(currentColor);
      setHoldRotation(currentRotation);
      setHoldMinoIndex(currentMinoIndex);
      newTetromino();
    } else {
      const tempMino = current;
      const tempColor = currentColor;
      const tempRotation = currentRotation;
      const tempMinoIndex = currentMinoIndex;

      setCurrent(holdMino);
      setCurrentColor(holdColor);
      setCurrentMinoIndex(holdMinoIndex);
      setCurrentRotation(holdRotation);

      setHoldMino(tempMino);
      setHoldColor(tempColor);
      setHoldRotation(tempRotation);
      setHoldMinoIndex(tempMinoIndex);

      setCurrentX(3);
      setCurrentY(0);

      if(collision(3, 0, holdMino)){
        setGameOver(true);
        if(gameInterval) clearInterval(gameInterval);
      }
    }
    setHoldUsed(true);
  };

  const newTetromino = () => {
    setMinoQueue(queue => {
      let q = [...queue];
      if(q.length === 0){
        q = shuffle([...Array(mino.length).keys()]);
      }
      const nextIndex = q.shift();
      setCurrentMinoIndex(nextIndex);
      setCurrent(mino[nextIndex]);
      setCurrentColor(COLORS[nextIndex]);
      setCurrentX(3);
      setCurrentY(0);
      setCurrentRotation(0);
      setHoldUsed(false);

      if(q.length === 0){
        q = shuffle([...Array(mino.length).keys()]);
      }

      setNextMinoIndex(q[0]);
      setNextMinoShape(mino[q[0]]);
      setNextMinoColor(COLORS[q[0]]);

      // If immediately collides after spawn game over
      if(collision(3,0, mino[nextIndex])){
        setGameOver(true);
        if(gameInterval) clearInterval(gameInterval);
      }

      return q;
    });
  };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = e => {
      if(isPaused || gameOver || isCleared) return;
      const kicks = currentMinoIndex === 0 ? SRS_KICKS_I : currentMinoIndex !== 1 ? SRS_KICKS_OTHERS : null;
      let moved = false;

      if(e.key === 'z' && kicks){
        const result = SRSRotate(current, currentX, currentY, shape=>rotateCCW(shape,currentMinoIndex), kicks[currentRotation]);
        if(result.success){
          setCurrent(result.shape);
          setCurrentX(result.x);
          setCurrentY(result.y);
          setCurrentRotation((currentRotation + 3) % 4);
          moved = true;
        }
      }
      if(e.code === 'ArrowUp' && kicks){
        const result = SRSRotate(current, currentX, currentY, shape=>rotate(shape,currentMinoIndex), kicks[currentRotation]);
        if(result.success){
          setCurrent(result.shape);
          setCurrentX(result.x);
          setCurrentY(result.y);
          setCurrentRotation((currentRotation + 1) % 4);
          moved = true;
        }
      }
      if(e.key === 'ArrowLeft' && !collision(currentX-1, currentY, current)){
        setCurrentX(x=>x-1);
        moved = true;
      }
      if(e.key === 'ArrowRight' && !collision(currentX+1, currentY, current)){
        setCurrentX(x=>x+1);
        moved = true;
      }
      if(e.key === 'ArrowDown'){
        drop();
      }
      if(e.key === 'Shift'){
        hold();
      }
      if(e.code === 'Space'){
        hardDrop();
      }
      if(moved){
        if(isLocking && collision(currentX, currentY+1, current)){
          if(lockTimer){
            clearTimeout(lockTimer);
            setLockTimer(null);
          }
          setIsLocking(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [current, currentX, currentY, currentRotation, currentMinoIndex, isLocking, lockTimer, isPaused, gameOver, isCleared]);

  const cancelLockIfOnGround = () => {
    if(isLocking && collision(currentX,currentY+1,current)){
      if(lockTimer){
        clearTimeout(lockTimer);
        setLockTimer(null);
      }
      setIsLocking(false);
    }
  };

  const hardDrop = () => {
    let y = currentY;
    while(!collision(currentX, y+1, current)){
      y++;
    }
    setCurrentY(y);
    merge();
    clearLines();
    newTetromino();
    setIsLocking(false);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    const drawBlock = (x,y,color) => {
      ctx.fillStyle = color;
      ctx.fillRect((LEFT_HOLD_WIDTH + x) * BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE-1, BLOCK_SIZE-1);
    };

    // draw board
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if(cell) drawBlock(x,y,cell);
      });
    });

    // draw current
    current.forEach((row,y) => {
      row.forEach((cell,x) => {
        if(cell) drawBlock(currentX + x, currentY + y, currentColor);
      });
    });

    ctx.strokeStyle = 'rgba(126,126,126,1)';
    ctx.lineWidth = 0.7;

    for(let x=0; x <= COLS; x++){
      ctx.beginPath();
      ctx.moveTo((LEFT_HOLD_WIDTH + x)*BLOCK_SIZE, 0);
      ctx.lineTo((LEFT_HOLD_WIDTH + x)*BLOCK_SIZE, ROWS*BLOCK_SIZE);
      ctx.stroke();
    }
    for(let y=0;y<=ROWS;y++){
      ctx.beginPath();
      ctx.moveTo(LEFT_HOLD_WIDTH*BLOCK_SIZE, y*BLOCK_SIZE);
      ctx.lineTo((LEFT_HOLD_WIDTH + COLS)*BLOCK_SIZE, y*BLOCK_SIZE);
      ctx.stroke();
    }
    drawNext(ctx);
    drawHold(ctx);

    if(gameOver){
      stopTimer();
      // Show game over UI can be handled by React state & JSX
    }
  };

  const drawNext = (ctx) => {
    if(!nextMinoShape) return;
    const offsetX = (COLS + 7) * BLOCK_SIZE;
    const offsetY = BLOCK_SIZE + 1*BLOCK_SIZE + 10;
    ctx.strokeRect(offsetX, offsetY, 4*BLOCK_SIZE, 4*BLOCK_SIZE);
    ctx.strokeStyle = 'white';
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('NEXT', offsetX + 2*BLOCK_SIZE, offsetY-5);

    nextMinoShape.forEach((row,y) => {
      row.forEach((cell,x) =>{
        if(cell){
          ctx.fillStyle = nextMinoColor;
          ctx.fillRect(offsetX + x*BLOCK_SIZE, offsetY + y*BLOCK_SIZE, BLOCK_SIZE-1, BLOCK_SIZE-1);
        }
      });
    });
  };

  const drawHold = (ctx) => {
    const holdX = 1 * BLOCK_SIZE;
    const holdY = 2 * BLOCK_SIZE;
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.strokeRect(holdX, holdY, 4*BLOCK_SIZE, 4*BLOCK_SIZE);
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = 'left';
    ctx.fillText('HOLD', holdX+4, holdY-8);

    if(holdMinoIndex === null) return;

    const holdShape = mino[holdMinoIndex];
    const holdColorLocal = COLORS[holdMinoIndex];

    holdShape.forEach((row,y) => {
      row.forEach((cell,x) => {
        if(cell){
          ctx.fillStyle = holdColorLocal;
          ctx.fillRect(holdX + x*BLOCK_SIZE, holdY + y*BLOCK_SIZE, BLOCK_SIZE-1, BLOCK_SIZE-1);
        }
      });
    });
  };

  // Game loop and draw scheduling
  useEffect(() => {
    draw();
  }, [board, current, currentX, currentY, currentColor, nextMinoShape, nextMinoColor, holdMinoIndex]);

  useEffect(() => {
    if(gameInterval) clearInterval(gameInterval);
    if(!gameOver && !isPaused){
      const interval = setInterval(gameLoop, dropSpeed);
      setGameInterval(interval);
      return () => clearInterval(interval);
    }
  }, [gameOver, isPaused, dropSpeed, currentX, currentY, currentRotation]);

  const startGame = () => {
    setPauseElapsed(0);
    setStartTimestamp(Date.now());
    if(timerInterval) clearInterval(timerInterval);
    const tid = setInterval(() => {
      setTimer(() => {
        if(!startTimestamp) return "00:00";
        const elapsed = Math.floor((pauseElapsed + (Date.now() - startTimestamp))/1000);
        const min = String(Math.floor(elapsed/60)).padStart(2,'0');
        const sec = String(elapsed % 60).padStart(2,'0');
        return `経過時間：${min}:${sec}`;
      });
    }, 100);
    setTimerInterval(tid);
    setBoard(Array.from({length: ROWS}, () => Array(COLS).fill(0)));
    setHoldMino(null);
    setHoldColor(null);
    setHoldMinoIndex(null);
    setHoldUsed(false);
    setHoldRotation(0);
    setGameOver(false);
    setMinoQueue([]);
    newTetromino();
    setIsPaused(false);
    setScore(0);
  };

  const stopGame = () => {
    if(gameInterval) clearInterval(gameInterval);
    setGameInterval(null);
    setIsPaused(true);
    stopTimer();
  };

  return (
    <>
      <h1>テトリス</h1>
      <div className="setumei">
        ＜説明＞<br />
        ← → 左右移動<br />
        ↑ 左回転<br />
        z キー 右回転<br />
        shift ホールド<br />
        space ハードドロップ
      </div>

      <div id="message" style={{display: gameOver ? "flex" : "none"}}>GAME OVER</div>
      <div id="message2" style={{display: isCleared ? "flex" : "none"}}>CONGRATULATIONS!</div>
      <div id="score">スコア：{score}</div>
      <div id="timer">{timer}</div>

      <canvas
        ref={canvasRef}
        width={(LEFT_HOLD_WIDTH + COLS + 6) * BLOCK_SIZE}
        height={ROWS * BLOCK_SIZE}
        style={{backgroundColor: "#000"}}
      />

      <div className="btn">
        <div className="click">
          <button id="resetbtn" onClick={startGame}>リセット</button>
          <button id="stopbtn" onClick={stopGame}>一時停止</button>
          <button id="startbtn" onClick={startGame}>スタート</button>
        </div>
        <div>
          スピード：
          <input
            type="number"
            value={dropSpeed}
            step={10}
            onChange={e => setDropSpeed(Number(e.target.value) || 400)}
          />
        </div>
        <div>
          クリア条件：
          <input
            type="number"
            value={maxScore}
            step={100}
            onChange={e => setMaxScore(Number(e.target.value) || 4000)}
          />
        </div>
      </div>
    </>

  )
}
