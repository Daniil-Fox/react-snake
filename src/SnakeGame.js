// src/SnakeGame.js
import React, { useEffect, useRef, useState } from "react";
import "./SnakeGame.css"; // Импортируем стили

const CANVAS_SIZE = 800; // Размер канваса
const CELL_SIZE = 20;
const FRAME_RATE = 1000 / 20; // 20 FPS

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([[0, 0]]);
  const [food, setFood] = useState([5, 5]);
  const [direction, setDirection] = useState("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [score, setScore] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(0); // Для обратного отсчета
  const [countdownActive, setCountdownActive] = useState(false); // Признак активного обратного отсчета

  const resetGame = () => {
    setSnake([[0, 0]]);
    setFood([
      Math.floor(Math.random() * (CANVAS_SIZE / CELL_SIZE)),
      Math.floor(Math.random() * (CANVAS_SIZE / CELL_SIZE)),
    ]);
    setDirection("RIGHT");
    setGameOver(false);
    setScore(0);
    setGameStarted(false); // Сброс состояния игры
    setCountdown(0); // Сброс счётчика
  };

  const startGame = () => {
    resetGame();
    setCountdown(3); // Начинаем обратный отсчет с 3
    setCountdownActive(true); // Активируем отсчет
  };

  useEffect(() => {
    let timer;
    // Обработка обратного отсчета
    if (countdownActive && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1); // Уменьшаем счётчик каждую секунду
      }, 1000); // Каждую секунду
    } else if (countdown === 0) {
      setCountdownActive(false); // Останавливаем отсчет
      setGameStarted(true); // Начинаем игру после остановки обратного отсчета
    }
    return () => clearTimeout(timer); // Чистим таймер по завершению
  }, [countdown, countdownActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const drawCountdown = () => {
      context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      context.fillStyle = isDarkTheme ? "white" : "black"; // Фон доски
      context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE); // Рисуем фон

      // Рисуем обратный отсчет
      context.fillStyle = "yellow"; // Яркий цвет для текста
      context.font = "200px Arial"; // Увеличиваем размер шрифта
      context.textAlign = "center"; // Выравнивание по центру
      context.textBaseline = "middle"; // Выравнивание по вертикали
      context.fillText(countdown, CANVAS_SIZE / 2, CANVAS_SIZE / 2); // Рисуем число в центре
    };

    const drawGame = () => {
      context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      context.fillStyle = isDarkTheme ? "white" : "black"; // Фон доски
      context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE); // Рисуем фон
      context.fillStyle = isDarkTheme ? "green" : "white"; // Цвет змейки
      snake.forEach(([x, y]) => {
        context.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      });

      context.fillStyle = "red";
      context.fillRect(
        food[0] * CELL_SIZE,
        food[1] * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    };

    const updateGame = () => {
      if (gameStarted && !gameOver) {
        let newSnake = [...snake];
        let newHead = [...newSnake[0]];

        switch (direction) {
          case "LEFT":
            newHead[0] -= 1;
            break;
          case "RIGHT":
            newHead[0] += 1;
            break;
          case "UP":
            newHead[1] -= 1;
            break;
          case "DOWN":
            newHead[1] += 1;
            break;
          default:
            break;
        }

        newSnake.unshift(newHead);

        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          setFood([
            Math.floor(Math.random() * (CANVAS_SIZE / CELL_SIZE)),
            Math.floor(Math.random() * (CANVAS_SIZE / CELL_SIZE)),
          ]);
          setScore((prevScore) => prevScore + 1);
        } else {
          newSnake.pop();
        }

        const hitWall =
          newHead[0] < 0 ||
          newHead[0] >= CANVAS_SIZE / CELL_SIZE ||
          newHead[1] < 0 ||
          newHead[1] >= CANVAS_SIZE / CELL_SIZE;
        const hitSelf = newSnake
          .slice(1)
          .some(([x, y]) => x === newHead[0] && y === newHead[1]);

        if (hitWall || hitSelf) {
          setGameOver(true);
          setGameHistory((prevHistory) => [...prevHistory, score]);
        }

        setSnake(newSnake);
      }
      drawGame(); // Отрисовываем игровое поле
    };

    // Обновление холста для обратного отсчета
    const countdownInterval = setInterval(() => {
      if (countdownActive) {
        drawCountdown(); // Обновляем холст для обратного отсчета
      }
    }, 1000);

    const gameInterval = setInterval(updateGame, FRAME_RATE);

    return () => {
      clearInterval(countdownInterval); // Очищаем интервал обратного отсчета
      clearInterval(gameInterval); // Очищаем интервал игры
    };
  }, [
    snake,
    direction,
    food,
    gameOver,
    isDarkTheme,
    gameStarted,
    countdownActive,
  ]);

  const handleKeyPress = (event) => {
    switch (event.key) {
      case "ArrowLeft":
        if (direction !== "RIGHT") setDirection("LEFT");
        break;
      case "ArrowUp":
        if (direction !== "DOWN") setDirection("UP");
        break;
      case "ArrowRight":
        if (direction !== "LEFT") setDirection("RIGHT");
        break;
      case "ArrowDown":
        if (direction !== "UP") setDirection("DOWN");
        break;
      default:
        break;
    }
  };

  const toggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [direction]);

  return (
    <div className={`game-container ${isDarkTheme ? "dark" : "light"}`}>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{ border: "1px solid black" }}
      />
      <div className="scoreboard">
        <h2>Счет: {score}</h2>
        {gameOver && (
          <div>
            <h2>Игра Окончена</h2>
            <button onClick={resetGame}>Перезапустить игру</button>
          </div>
        )}
        {!countdownActive && !gameStarted && (
          <button onClick={startGame} style={{ marginTop: "10px" }}>
            Старт
          </button>
        )}
        <button onClick={toggleTheme} style={{ marginTop: "10px" }}>
          {isDarkTheme ? "Светлая тема" : "Темная тема"}
        </button>
        {gameHistory.length > 0 && (
          <div className="history">
            <h3>История игр</h3>
            <table>
              <thead>
                <tr>
                  <th>Игровая сессия</th>
                  <th>Очки</th>
                </tr>
              </thead>
              <tbody>
                {gameHistory.map((score, index) => (
                  <tr key={index}>
                    <td>Игра {index + 1}</td>
                    <td>{score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnakeGame;
