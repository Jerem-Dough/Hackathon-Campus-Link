@echo off
echo Starting database setup process...
REM Stop all running containers and remove volumes
echo Stopping any running containers and removing volumes...
docker-compose down -v
IF EXIST "data" (
    echo Removing existing data directory...
    rmdir /s /q "data"
    echo Removed existing data directory.
) ELSE (
    echo No existing data directory found.
)
REM ^ remove the data directory if exists
mkdir data
REM Verify init scripts exist in desired directory
IF NOT EXIST "docker-entrypoint-initdb.d\01_init.sql" (
    echo Error: 01_init.sql not found in docker-entrypoint-initdb.d directory
    goto ERROR
)
REM Starting PostgreSQL db with a clean state in a new terminal
echo Starting PostgreSQL container...
start "PostgreSQL" cmd /k "docker-compose up db  --force-recreate"
REM Waiting for PostgreSQL to be ready
echo Waiting for PostgreSQL to be fully initialized...
docker-compose exec db sh -c "until pg_isready -h localhost -U postgres; do echo 'Waiting for PostgreSQL...'; sleep 1; done; echo 'PostgreSQL is ready.'"
REM running initialization scripts in db
echo Running initialization scripts...
docker-compose exec db psql -U postgres -d EXPOS_THANI_WEB -f /docker-entrypoint-initdb.d/01_init.sql
@REM docker-compose exec db psql -U postgres -d EXPOS_THANI_WEB -f /docker-entrypoint-initdb.d/02_functionsmain.sql
REM starting pgAdmin
echo starting pgAdmin...
docker-compose up -d pgadmin
REM verifying if program_data schema exists before starting CLI (needed else nodejs throws schema errors)
echo Verifying program_data schema...
docker-compose exec db psql -U postgres -d EXPOS_THANI_WEB -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'program_data';" | findstr "program_data" > nul
IF ERRORLEVEL 1 (
    echo Error: program_data schema was not created properly.
    echo Checking PostgreSQL logs...
    docker-compose logs db
    goto ERROR
)
echo Schema was verification successful.

REM starting the CLI environment in a new window (bash shell)
echo Starting Node.js CLI...
start "EXPOS_THANI_WEB CLI" cmd /k "docker-compose run --rm cli bash"

@REM  handle exit codes: 0 = success, 1 = error
echo Setup completed successfully.
goto END
:ERROR
echo Setup failed. Please check the errors above.
exit /b 1
:END
ENDLOCAL
exit /b 0