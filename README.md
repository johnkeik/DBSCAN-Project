# AutoDBSCAN

## Overview
AutoDBSCAN is a web application designed to facilitate clustering analysis using the DBSCAN algorithm. Users can upload datasets and the application will assist in determining the appropriate values for the parameters minpts and eps. Once the parameters are set, AutoDBSCAN performs the clustering and presents the results to the user. The application features a user-friendly web interface and a WEB API that supports all operations via HTTP requests.

## Features
- Dataset Upload: Users can upload their datasets for analysis.
- Parameter Selection Assistance: The application helps users determine optimal minpts and eps values.
- Clustering Execution: Executes the DBSCAN algorithm on the uploaded datasets.
- Results Visualization: Displays the clustering results in a user-friendly format.
- Web API: Allows execution of all functionalities via HTTP requests.

## Technologies
- Frontend: Next.js
- Backend: Node.js
- Clustering Algorithm: Python (DBSCAN implementation)
- Swagger for API documentation

## Installation
To run AutoDBSCAN locally, follow these steps:

### Prerequisites
- Node.js (v14.x or later)
- Python (v3.8 or later)
- pip (Python package installer)
  
### Steps
1. Clone the repository
```
git clone [https://github.com/yourusername/AutoDBSCAN.git](https://github.com/johnkeik/DBSCAN-Project.git)
cd AutoDBSCAN
```

2. Install Node.js dependencies
```
cd client
npm install
cd ../server
npm install
```

3. Install Python dependencies
```
pip install -r requirements.txt
```

4. Run the application
Open two terminal windows or tabs.
In the first terminal, start the Node.js server:
```
cd server
npm start
```
In the second terminal, start the Next.js development server:
```
cd client
npm run dev
```
Access the application
Open your browser and navigate to http://localhost:3000.

### Usage
- Upload Dataset: Use the web interface to upload your dataset (CSV format).
- Parameter Selection: Follow the prompts to determine suitable minpts and eps values.
- Run Clustering: Execute the DBSCAN algorithm with the selected parameters.
- View Results: Visualize the clustering results directly on the web interface.
- API Endpoints
- AutoDBSCAN also provides a WEB API. On the client you can find a usefull SWAGGER documentation where you can find all available apis and test them live through the app.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue to discuss any changes.

## Contact
For any inquiries or questions, please contact giannis.keik@gmail.com
