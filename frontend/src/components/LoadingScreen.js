import React from 'react';
import { motion } from 'framer-motion';
import './LoadingScreen.css';

const LoadingScreen = ({ message = null, type = "analysis" }) => {
  const analysisSteps = [
    "Analyzing your goal...",
    "Breaking down complexity...",
    "Calculating timelines...",
    "Identifying dependencies...",
    "Optimizing task order...",
    "Finalizing your plan..."
  ];

  const authSteps = [
    "Initializing neural network...",
    "Establishing secure connection...",
    "Validating credentials...",
    "Loading user profile..."
  ];

  const loadingSteps = type === "auth" ? authSteps : analysisSteps;

  const [currentStep, setCurrentStep] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % loadingSteps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [loadingSteps.length]);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        {/* AI Brain Animation */}
        <motion.div
          className="ai-brain"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 360]
          }}
          transition={{
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            },
            rotate: {
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }
          }}
        >
          <div className="brain-core">
            <div className="neural-network">
              {/* Neural connections */}
              <svg className="neural-connections" viewBox="0 0 100 100">
                {[...Array(8)].map((_, i) => (
                  <motion.line
                    key={i}
                    x1={Math.random() * 100}
                    y1={Math.random() * 100}
                    x2={Math.random() * 100}
                    y2={Math.random() * 100}
                    stroke="rgba(59, 130, 246, 0.3)"
                    strokeWidth="0.5"
                    animate={{
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                  />
                ))}
              </svg>
              
              {/* Neurons */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="neuron"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          className="loading-text"
          key={message || currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <h2>{message || loadingSteps[currentStep]}</h2>
        </motion.div>

        {/* Progress Bar */}
        <div className="progress-container">
          <motion.div
            className="progress-bar"
            animate={{
              width: `${((currentStep + 1) / loadingSteps.length) * 100}%`
            }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Floating Particles */}
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 50 - 25, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
