```bash
# Build the Docker image
docker build -t my_pgvector_db .

# Run the Docker container
docker run --name my_postgres -p 5432:5432 -d my_pgvector_db
```
