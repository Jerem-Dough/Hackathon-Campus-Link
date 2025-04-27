

@echo off
REM Step 1: Build and run the Docker container
docker build -t my_pgvector_db .
docker run --name my_postgres -p 5432:5432 -d my_pgvector_db

REM Step 2: Create a virtual environment
python -m venv venv

REM Step 3: Activate the virtual environment
call venv\Scripts\activate

REM Step 4: Install dependencies
pip install -r requirements.txt

REM Step 5: Run the Python scripts
python create_table.py

python datapipeline.py

REM Step 6: Deactivate the virtual environment
@REM deactivate
