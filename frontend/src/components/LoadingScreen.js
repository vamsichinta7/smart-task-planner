import React from 'react';
import { motion } from 'framer-motion';
import './LoadingScreen.css';

const LoadingScreen = () => {
  const loadingSteps = [
    "Analyzing your goal...",
    "Breaking down complexity...",
    "Calculating timelines...",
    "Identifying dependencies...",
    "Optimizing task order...",
    "Finalizing your plan..."
  ];

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
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="brain-core">
            <div className="neural-network">
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
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <h2>{loadingSteps[currentStep]}</h2>
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
