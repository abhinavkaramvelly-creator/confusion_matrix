# Confusion Matrix & Classification Error Visualizer

A premium, interactive web-based tool to demonstrate how classification errors (False Positives, False Negatives) occur and how they populate a Confusion Matrix.

## Features
- **Interactive Simulation**: Drag the decision boundary line to classify randomly generated data points in real-time.
- **Visual Feedback**:
  - **Green Points**: Actual Positive cases.
  - **Blue Points**: Actual Negative cases.
  - **Red Rings**: False Positives (Type I Error).
  - **Amber Rings**: False Negatives (Type II Error).
- **Live Metrics**: Accuracy, Precision, Recall, and F1 Score update instantly as you adjust the classifier.
- **Glassmorphism Design**: Modern, dark-themed UI with smooth animations.

## How to Use
1. Open `index.html` in any modern web browser.
2. **Move the Line**: Drag the white handles on the canvas to adjust the decision boundary.
3. **Observe Errors**: Watch how moving the line affects the classification of points. Points on the "Positive" side of the line are predicted as Positive.
   - If the orientation is wrong (0% accuracy), try swapping the handles to flip the "Positive" side.
4. **Adjust Noise**: Use the slider to increase dataset overlap, making perfect classification impossible and forcing a trade-off between Precision and Recall.

## Running Locally
To run this project on your local machine:
1. Ensure you have Node.js installed.
2. Open a terminal in the project directory.
3. Run the following command:
   ```bash
   npx serve .
   ```
4. Open the displayed URL (usually `http://localhost:3000`) in your browser.
