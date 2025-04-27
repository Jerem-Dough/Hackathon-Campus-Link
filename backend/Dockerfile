# Use ankane/pgvector image
FROM ankane/pgvector

# Set environment variables (optional if you want them baked in)
ENV POSTGRES_USER=myuser
ENV POSTGRES_PASSWORD=mypassword
ENV POSTGRES_DB=mydatabase

# Expose Postgres port
EXPOSE 5432

# Add a script to create extensions automatically
COPY ./docker-entrypoint-initdb.d/extensions.sql /docker-entrypoint-initdb.d/
