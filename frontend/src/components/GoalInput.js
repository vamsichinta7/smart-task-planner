import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './GoalInput.css';

const GoalInput = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    goal: '',
    title: '',
    deadline: '',
    context: {}
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedGoal = formData.goal.trim();
    if (!trimmedGoal) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const exampleGoals = [
    "Launch a mobile app in 8 weeks",
    "Learn Python programming in 3 months",
    "Start an e-commerce business",
    "Organize a 50-person company event",
    "Build a personal website portfolio"
  ];

  return (
    <div className="goal-input-container">
      <motion.div
        className="goal-input-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="step-indicator">
          {[1, 2, 3].map(num => (
            <div
              key={num}
              className={`step ${step >= num ? 'active' : ''}`}
            >
              {num}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="goal-form">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="form-step"
            >
              <h2>What's your goal?</h2>
              <p>Describe what you want to achieve and let our AI break it down into manageable tasks.</p>

              <textarea
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                placeholder="e.g., Launch a mobile app in 8 weeks"
                className="goal-textarea"
                rows="4"
                required
              />

              <div className="examples">
                <p>Popular examples:</p>
                <div className="example-tags">
                  {exampleGoals.map((example, index) => (
                    <button
                      key={index}
                      type="button"
                      className="example-tag"
                      onClick={() => setFormData(prev => ({ ...prev, goal: example }))}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={nextStep}
                  className="next-btn"
                  disabled={!formData.goal.trim()}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="form-step"
            >
              <h2>Project Details</h2>
              <p>Help us understand your project better for more accurate task breakdown.</p>

              <div className="form-group">
                <label htmlFor="title">Project Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Give your project a name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="deadline">Target Deadline (Optional)</label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={prevStep} className="back-btn">
                  Back
                </button>
                <button type="button" onClick={nextStep} className="next-btn">
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="form-step"
            >
              <h2>Ready to Generate Your Plan?</h2>
              <p>Our AI will analyze your goal and create a detailed task breakdown with timelines and dependencies.</p>

              <div className="goal-summary">
                <h3>Goal Summary:</h3>
                <p className="goal-text">{formData.goal}</p>
                {formData.title && <p><strong>Project:</strong> {formData.title}</p>}
                {formData.deadline && <p><strong>Deadline:</strong> {new Date(formData.deadline).toLocaleDateString()}</p>}
              </div>

              <div className="form-actions">
                <button type="button" onClick={prevStep} className="back-btn">
                  Back
                </button>
                <button
                  type="submit"
                  className="generate-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Analyzing Goal...
                    </>
                  ) : (
                    'Generate Task Plan'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default GoalInput;