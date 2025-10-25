
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Enum for game states
enum GameState {
  Start,
  Playing,
  GameOver,
}

// Enum for math operators
enum Operator {
  Add = '+',
  Subtract = '-',
  Multiply = '×',
}

// Interface for a math problem
interface Problem {
  num1: number;
  num2: number;
  operator: Operator;
  answer: number;
}

// Constants
const GAME_DURATION = 60; // in seconds

// Helper function to get high score from localStorage
const getHighScore = (): number => {
  const score = localStorage.getItem('mathGameHighScore');
  return score ? parseInt(score, 10) : 0;
};

// Helper function to set high score in localStorage
const setHighScore = (score: number) => {
  localStorage.setItem('mathGameHighScore', score.toString());
};


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Start);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [highScore, setLocalHighScore] = useState<number>(getHighScore());
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [feedback, setFeedback] = useState<{ message: string; color: string } | null>(null);

  const answerInputRef = useRef<HTMLInputElement>(null);
  // Fix: Use `number` for the timer ref in a browser environment instead of `NodeJS.Timeout`.
  const timerRef = useRef<number | null>(null);

  const generateProblem = useCallback(() => {
    const operators = [Operator.Add, Operator.Subtract, Operator.Multiply];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let num1 = 0;
    let num2 = 0;
    let answer = 0;

    switch (operator) {
      case Operator.Add:
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 + num2;
        break;
      case Operator.Subtract:
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * num1) + 1; // Ensure result is not negative
        answer = num1 - num2;
        break;
      case Operator.Multiply:
        num1 = Math.floor(Math.random() * 10) + 2;
        num2 = Math.floor(Math.random() * 10) + 2;
        answer = num1 * num2;
        break;
    }
    
    setProblem({ num1, num2, operator, answer });
    setUserAnswer('');
    answerInputRef.current?.focus();
  }, []);

  const startGame = useCallback(() => {
    setGameState(GameState.Playing);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setFeedback(null);
    generateProblem();
  }, [generateProblem]);
  
  const stopGame = useCallback(() => {
    if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
    }
    setGameState(GameState.GameOver);
    if (score > highScore) {
      setHighScore(score);
      setLocalHighScore(score);
    }
  }, [score, highScore]);
  
  useEffect(() => {
    if (gameState === GameState.Playing) {
        timerRef.current = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    stopGame();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    }

    return () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, stopGame]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userAnswer === '') return;

    const userAnswerNum = parseInt(userAnswer, 10);
    
    if (userAnswerNum === problem?.answer) {
      setScore(prev => prev + 1);
      setFeedback({ message: 'Correto!', color: 'text-green-400' });
    } else {
      setFeedback({ message: `Errado! A resposta era ${problem?.answer}`, color: 'text-red-400' });
    }

    setTimeout(() => setFeedback(null), 1000);
    generateProblem();
  };

  const renderGameContent = () => {
    switch (gameState) {
      case GameState.Start:
        return (
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">Jogo de Matemática</h1>
            <p className="text-slate-300 text-lg mb-8 max-w-md mx-auto">
              Teste sua agilidade mental! Resolva o máximo de problemas que conseguir em {GAME_DURATION} segundos.
            </p>
            <button
              onClick={startGame}
              className="w-full sm:w-auto bg-yellow-400 text-slate-900 font-bold py-4 px-10 rounded-lg text-xl shadow-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105"
            >
              Começar a Jogar
            </button>
          </div>
        );
      case GameState.GameOver:
        return (
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">Fim de Jogo!</h2>
            <p className="text-slate-200 text-3xl mb-4">Sua pontuação final: <span className="font-bold text-white">{score}</span></p>
            <p className="text-slate-300 text-xl mb-8">Recorde: <span className="font-bold text-white">{highScore}</span></p>
            <button
              onClick={startGame}
              className="w-full sm:w-auto bg-yellow-400 text-slate-900 font-bold py-4 px-10 rounded-lg text-xl shadow-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105"
            >
              Jogar Novamente
            </button>
          </div>
        );
      case GameState.Playing:
        return (
          <>
            <div className="absolute top-4 left-4 md:left-6 text-lg bg-slate-900/50 px-4 py-2 rounded-lg">
              <i className="fa-solid fa-star text-yellow-400 mr-2"></i>
              Pontos: <span className="font-bold text-2xl">{score}</span>
            </div>
            <div className="absolute top-4 right-4 md:right-6 text-lg bg-slate-900/50 px-4 py-2 rounded-lg">
              <i className="fa-solid fa-clock text-blue-400 mr-2"></i>
              Tempo: <span className="font-bold text-2xl">{timeLeft}</span>
            </div>

            <div className="w-full text-center">
              {problem && (
                <div className="text-5xl md:text-7xl font-bold mb-8 transition-all duration-300">
                  <span>{problem.num1}</span>
                  <span className="mx-4 text-yellow-400">{problem.operator}</span>
                  <span>{problem.num2}</span>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <input
                  ref={answerInputRef}
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full max-w-xs mx-auto bg-slate-700/50 border-2 border-slate-600 rounded-lg text-center text-4xl p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
                  autoFocus
                />
                 <button 
                  type="submit"
                  className="w-full max-w-xs mx-auto bg-green-500 text-white font-bold py-4 px-10 rounded-lg text-xl shadow-lg hover:bg-green-400 transition-all duration-300"
                  >
                  Enviar
                </button>
              </form>
              {feedback && (
                <div className={`mt-6 text-2xl font-semibold transition-opacity duration-300 ${feedback.color}`}>
                  {feedback.message}
                </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <main className="relative w-full max-w-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl p-8 md:p-12 flex items-center justify-center min-h-[400px]">
        {renderGameContent()}
      </main>
      <footer className="text-center text-slate-500 mt-8">
        Criado com React, Tailwind CSS e diversão.
      </footer>
    </div>
  );
};

export default App;