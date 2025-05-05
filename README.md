## CampusLink

CampusLink (formerly "Thani") is a mobile-first platform designed to connect college students across different universities. It aggregates student discussions, local campus tips, and inter-university events into one app. By combining forums, interactive maps, and event listings, CampusLink helps students branch out beyond their immediate surroundings and get involved in nearby campus communities.

## Features

**Overview**
- Location-based map with user-submitted posts and travel tips  
- Secure access for verified student accounts  
- Forums for clubs, classes, shared interests, and general discussion  
- Aggregated events from nearby universities with RSVP support  

**Map & Location Feed**
- Searchable campus maps with interactive pins  
- Posts tied to campus buildings, dorms, or hangout spots  
- Comment threads used for travel advice, warnings, or general info  

**Authentication**
- Firebase-backed authentication for verified student access  
- Login/signup system using university email validation  

**Community Forums**
- Interest-based discussion boards  
- Club-specific threads and student Q&A  
- Encourages intercampus friendships and knowledge sharing  

**Events Feed**
- Real-time event listings from nearby colleges  
- Event details, RSVP features, and calendar-friendly formats  
- Helps students explore new communities and activities  


## Tech Stack

- React Native – Mobile interface and interaction  
- Python (Flask) – Backend logic and data processing  
- Docker – Containerization and deployment  
- Firebase – Authentication and real-time backend services  
- SQL – Structured data storage  


## Local Deployment

Make sure you have the following installed and configured:

- Java (JDK 11 or higher)  
- Python 3.x  
- Node.js and npm  
- Docker Desktop  

### 1. Clone the repository

1. git clone https://github.com/your-org/CampusLink.git
2. cd CampusLink

### 2. Backend Setup

1. Navigate to the db directory: `cd db_setup`
2. Run the provided `setup.bat` script (Windows only)

This script will:

- Build and run a Dockerized PostgreSQL + pgvector container  
- Set up a Python virtual environment  
- Install all required Python dependencies  
- Run the `datapipeline.py` script  
- Leave the virtual environment active for further development  

### 3. Frontend Setup

1. Navigate to the frontend directory: `cd thani-dev`
2. npm install
3. npm start

## Contributors

- Abenezer Woldesenbet  
- Alisha Pravasi  
- Dillion Melville  
- Jeremy Dougherty  
- Joe Ontiveros Rodriguez
- Rachel Reyes  
