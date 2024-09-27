# Visual Studio Code Time Tracker

This tool allows you to track your activity within Visual Studio Code by recording file usage and providing statistics via a web interface.

## Requirements

- **Golang** installed
- **Node.js** or another package manager installed
- **Visual Studio Code** installed

## Setup

1. **Install the extension:**
    - Open the **Extensions** panel in Visual Studio Code.
    - Click on the three dots (`...`) in the top-right corner of the panel.
    - Select **Install from VSIX**.
    - Navigate to the `extension/` folder and select the `timetracker-0.0.1.vsix` file to install the extension.

2. **Run the backend:**
    - Open your terminal.
    - Navigate to the `app/backend` directory.
    - Run the following command to start the backend service:
      ```bash
      go run .
      ```

## Usage

- After completing the setup, every time you open a file in Visual Studio Code, it will be registered by the time tracker.
- To view your usage statistics, open your browser and go to [127.0.0.1:5000](http://127.0.0.1:5000) or [localhost:5000](http://localhost:5000).

## Contribution

Feel free to contribute by creating issues or submitting pull requests.
